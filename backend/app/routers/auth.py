"""Auth + health endpoints (07_screen_to_table_mapping.md §1.1)."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, list_accessible_roles
from app.core.security import (
    COOKIE_NAME,
    create_access_token,
    decode_access_token,
    session_cookie,
    token_sha256,
    verify_password,
)
from app.models import Brand, User, UserSession, UserRole
from app.schemas.auth import BrandRef, LoginRequest, MeResponse

router = APIRouter(prefix="/api", tags=["auth"])


def _brand_ref(brand: Brand) -> BrandRef:
    return BrandRef(id=brand.slug, slug=brand.slug, name=brand.name)


async def _me_response(
    db: AsyncSession, user: User, brand: Brand
) -> MeResponse:
    # role for the active brand
    role_row = await db.execute(
        select(UserRole.role)
        .where(UserRole.user_id == user.user_id, UserRole.brand_id == brand.brand_id)
        .order_by(UserRole.user_role_id)
    )
    role = role_row.scalars().first()

    # all brands this user holds a role in (for the brand switcher)
    pairs = await list_accessible_roles(db, user)
    accessible: dict[int, BrandRef] = {}
    if pairs:
        brand_rows = await db.execute(
            select(Brand).where(Brand.brand_id.in_(frozenset({pair[0] for pair in pairs})))
        )
        accessible = {row.brand_id: _brand_ref(row) for row in brand_rows.scalars()}

    return MeResponse(
        email=user.email,
        name=user.full_name,
        role=str(role) if role else "student",
        brand=_brand_ref(brand),
        accessible_brands=sorted(accessible.values(), key=lambda b: b.slug),
    )


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/auth/login", response_model=MeResponse)
async def login(payload: LoginRequest, request: Request, response: Response,
                db: AsyncSession = Depends(get_db)) -> MeResponse:
    email = payload.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.status != "active":
        raise HTTPException(status_code=403, detail="Account is suspended. Contact support.")

    # brands the user can access
    role_rows = await db.execute(
        select(UserRole.brand_id, UserRole.role)
        .where(UserRole.user_id == user.user_id)
        .order_by(UserRole.user_role_id)
    )
    pairs = [(row.brand_id, row.role) for row in role_rows.all()]
    if not pairs:
        raise HTTPException(status_code=403, detail="Your account has no brand access yet")

    brand_ids = list(dict.fromkeys(pair[0] for pair in pairs))
    brand_rows = await db.execute(select(Brand).where(Brand.brand_id.in_(brand_ids)))
    accessible_brands = {row.brand_id: row for row in brand_rows.scalars()}

    if payload.brand:
        brand = next(
            (b for b in accessible_brands.values() if b.slug == payload.brand), None
        )
        if brand is None:
            raise HTTPException(status_code=403, detail="You do not have access to this brand")
    elif len(accessible_brands) == 1:
        brand = next(iter(accessible_brands.values()))
    else:
        raise HTTPException(status_code=403, detail="Select the brand to sign in to")

    # mint token + persist session
    token = create_access_token(
        {"sub": str(user.user_id), "email": user.email, "name": user.full_name}
    )
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_ttl_minutes
    )
    client_ip = request.client.host if request.client else "unknown"
    db.add(
        UserSession(
            user_id=user.user_id,
            token_hash=token_sha256(token),
            ip_address=client_ip,
            user_agent=(request.headers.get("user-agent") or None),
            expires_at=expires_at,
        )
    )
    user.last_active_at = datetime.now(timezone.utc)
    await db.commit()

    response.set_cookie(
        value=token,
        **session_cookie(max_age_seconds=settings.access_token_ttl_minutes * 60),
    )
    return await _me_response(db, user, brand)


@router.post("/auth/logout")
async def logout(request: Request, response: Response,
                 db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.execute(
            delete(UserSession).where(UserSession.token_hash == token_sha256(token))
        )
        await db.commit()
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"status": "logged_out"}


@router.get("/auth/me", response_model=MeResponse)
async def me(request: Request, user: User = Depends(get_current_user),
             db: AsyncSession = Depends(get_db)) -> MeResponse:
    # active brand from X-Brand-Id; fall back to token's brand or single accessible brand
    claims = decode_access_token(request.cookies.get(COOKIE_NAME, ""))
    slug = request.headers.get("X-Brand-Id")
    brand: Brand | None = None
    if slug:
        row = await db.execute(select(Brand).where(Brand.slug == slug))
        brand = row.scalar_one_or_none()
        if brand is None:
            raise HTTPException(status_code=404, detail=f"Unknown brand '{slug}'")
    pairs = await list_accessible_roles(db, user)
    if not pairs:
        raise HTTPException(status_code=403, detail="Your account has no brand access")
    if brand is None:
        brand_ids = list(dict.fromkeys(pair[0] for pair in pairs))
        rows = await db.execute(select(Brand).where(Brand.brand_id.in_(brand_ids)))
        brands = rows.scalars().all()
        if len(brands) != 1:
            raise HTTPException(
                status_code=400, detail="X-Brand-Id header is required for multi-brand users"
            )
        brand = brands[0]

    access_rows = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user.user_id,
            UserRole.brand_id == brand.brand_id,
        )
    )
    if access_rows.scalars().first() is None:
        raise HTTPException(status_code=403, detail="You do not have access to this brand")

    return await _me_response(db, user, brand)


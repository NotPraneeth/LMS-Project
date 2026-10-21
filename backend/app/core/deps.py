"""Auth deps: current user (JWT cookie), brand context (X-Brand-Id), student enrolment."""

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import COOKIE_NAME, decode_access_token
from app.models import Brand, Enrolment, User, UserBrandAccess, UserRole


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        claims = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    user_id = int(claims["sub"])
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if user is None or user.status != "active":
        raise HTTPException(status_code=401, detail="Account is not active")
    return user


async def get_brand_context(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> tuple[User, Brand]:
    """Resolve the active brand from X-Brand-Id and verify membership."""
    slug = request.headers.get("X-Brand-Id")
    if not slug:
        raise HTTPException(status_code=400, detail="X-Brand-Id header is required")
    result = await db.execute(select(Brand).where(Brand.slug == slug))
    brand = result.scalar_one_or_none()
    if brand is None:
        raise HTTPException(status_code=404, detail=f"Unknown brand '{slug}'")

    access = await db.execute(
        select(UserBrandAccess).where(
            UserBrandAccess.user_id == user.user_id,
            UserBrandAccess.brand_id == brand.brand_id,
        )
    )
    if access.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this brand",
        )
    return user, brand


async def get_active_role(db: AsyncSession, user: User, brand_id: int) -> str:
    """Highest-precedence role the user holds for the brand (student phase)."""
    result = await db.execute(
        select(UserRole.role)
        .where(UserRole.user_id == user.user_id, UserRole.brand_id == brand_id)
        .order_by(UserRole.user_role_id)
    )
    role = result.scalars().first()
    if role is None:
        raise HTTPException(status_code=403, detail="No role assigned for this brand")
    return str(role)


async def list_accessible_roles(db: AsyncSession, user: User) -> list[tuple[int, str]]:
    """(brand_id, role) pairs the user holds across brands."""
    result = await db.execute(
        select(UserRole.brand_id, UserRole.role).where(UserRole.user_id == user.user_id)
    )
    return [(row[0], row[1]) for row in result.all()]


def require_role(role: str):
    """Dependency wrapper enforcing a specific role for the active brand."""

    async def _dependency(
        ctx: tuple[User, Brand] = Depends(get_brand_context),
        db: AsyncSession = Depends(get_db),
    ) -> tuple[User, Brand]:
        user, brand = ctx
        current = await get_active_role(db, user, brand.brand_id)
        if current != role:
            raise HTTPException(
                status_code=403,
                detail=f"This resource requires the '{role}' role",
            )
        return ctx

    return _dependency


async def get_student_enrolment(
    ctx: tuple[User, Brand] = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
) -> Enrolment:
    """The student's active enrolment for the active brand (student phase: first enrolment)."""
    user, brand = ctx
    result = await db.execute(
        select(Enrolment)
        .where(
            Enrolment.student_id == user.user_id,
            Enrolment.brand_id == brand.brand_id,
            Enrolment.status == "active",
        )
        .order_by(Enrolment.enrolment_id)
        .limit(1)
    )
    enrolment = result.scalars().first()
    if enrolment is None:
        raise HTTPException(
            status_code=404,
            detail="You have no active enrolment in this brand yet. Contact admissions.",
        )
    return enrolment

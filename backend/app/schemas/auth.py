from app.schemas.base import CamelModel


class LoginRequest(CamelModel):
    email: str
    password: str
    brand: str | None = None  # brand slug, optional


class BrandRef(CamelModel):
    id: str
    slug: str
    name: str


class MeResponse(CamelModel):
    email: str
    name: str
    role: str
    brand: BrandRef
    accessible_brands: list[BrandRef]

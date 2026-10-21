from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from backend/.env (upper-case env vars)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://lms:lms_dev_password@localhost:5433/lms"
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    # 7 days for dev convenience (documented in studentmoduleimplementation.md §5)
    access_token_ttl_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()

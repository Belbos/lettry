import warnings

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_JWT_SECRET = "change-me-in-production"


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./lottery.db"
    cors_origins: list[str] = ["http://localhost:3000"]
    jwt_secret_key: str = DEFAULT_JWT_SECRET
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @model_validator(mode="after")
    def _validate_jwt_secret(self):
        is_weak = (
            self.jwt_secret_key == DEFAULT_JWT_SECRET
            or len(self.jwt_secret_key) < 32
        )
        if self.app_env == "production":
            if is_weak:
                raise ValueError(
                    "JWT_SECRET_KEY must be set to a strong, random value "
                    "(>= 32 chars) in production. Generate one with "
                    "`openssl rand -hex 32`."
                )
        elif is_weak:
            warnings.warn(
                "JWT_SECRET_KEY is using the insecure default/short value. "
                "Set a strong JWT_SECRET_KEY before deploying.",
                stacklevel=2,
            )
        return self


settings = Settings()

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
    # Username auto-promoted to admin on registration, but only while no admin
    # exists yet (closes the bootstrap window — see routers/auth.py).
    initial_admin_username: str = ""

    # SMTP for transactional email (password reset). The app password MUST be
    # provided via env (SMTP_PASSWORD) — never hardcode it.
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "youngjong674@gmail.com"
    smtp_password: str = ""
    smtp_from: str = ""  # defaults to smtp_user when empty

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def email_from(self) -> str:
        return self.smtp_from or self.smtp_user

    @property
    def smtp_enabled(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)

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

"""
Application configuration using Pydantic Settings.

WHY PYDANTIC SETTINGS?
- Reads from environment variables automatically
- Validates types at startup (fail fast if DATABASE_URL is missing)
- Provides type hints for IDE support
- Follows the 12-Factor App methodology (config via environment)

INTERVIEW TALKING POINT:
"I use Pydantic BaseSettings to load configuration from environment variables.
This follows the 12-Factor App principle where config is stored in the
environment, not hardcoded. It validates at startup — if DATABASE_URL is
missing, the app fails immediately instead of crashing at the first DB call."
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    All configuration is loaded from environment variables.
    Default values are provided for non-sensitive settings.
    Sensitive values (DATABASE_URL, JWT_SECRET_KEY) MUST be set in .env
    """

    # Database
    DATABASE_URL: str = "sqlite:///./stockpulse.db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "stockpulse-serverless-jwt-secret-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application
    APP_NAME: str = "StockPulse"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton instance — imported everywhere as `from app.core.config import settings`
settings = Settings()

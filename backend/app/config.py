"""
Application configuration.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API
    API_TITLE: str = "Process Tool API"
    API_VERSION: str = "0.1.0"

    # Database
    DATABASE_URL: str = "postgresql://processtool:processtool_dev_password@localhost:5432/processtool"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # API Keys
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Azure Content Safety (optional)
    AZURE_CONTENT_SAFETY_KEY: str = ""
    AZURE_CONTENT_SAFETY_ENDPOINT: str = ""

    # OAuth (for calendar integrations)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Feature Flags
    REQUIREMENTS_GENERATION_ENABLED: bool = True
    SMART_ALLOCATION_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

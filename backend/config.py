import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # API Configurations
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    
    # LLM Settings
    llm_model: str = "llama-3.3-70b-specdec"
    llm_base_url: str = "https://api.groq.com/openai/v1"
    
    # Server Settings
    host: str = "127.0.0.1"
    port: int = 8000
    
    # Load configuration from .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings
settings = Settings()

# Setup backup checks for keys directly in environment
if not settings.groq_api_key:
    settings.groq_api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("groq_api_key")

if not settings.openai_api_key:
    settings.openai_api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("openai_api_key")

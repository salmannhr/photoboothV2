from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./photobooth.db"
    frontend_origins: str = "http://localhost:5173"

    resend_api_key: str = ""
    email_from: str = "onboarding@resend.dev"
    email_logo_url: str = "https://placehold.co/240x80/1b1230/f5b942?text=SNAPSTRIP&font=montserrat"

    storage_dir: str = "storage/photos"

    google_client_id: str = ""
    google_client_secret: str = ""
    google_refresh_token: str = ""
    google_drive_folder_id: str = ""

    auth_secret_key: str = "ganti-ini-di-env-production"

    @property
    def frontend_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


settings = Settings()

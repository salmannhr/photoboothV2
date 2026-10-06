from pathlib import Path

from fastapi import HTTPException
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from app.config import settings

SCOPES = ["https://www.googleapis.com/auth/drive.file"]


def _get_drive_service():
    if not (settings.google_client_id and settings.google_client_secret and settings.google_refresh_token):
        raise HTTPException(status_code=500, detail="Kredensial Google Drive belum diisi di .env")

    creds = Credentials(
        token=None,
        refresh_token=settings.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=SCOPES,
    )
    creds.refresh(GoogleRequest())
    return build("drive", "v3", credentials=creds)


def _make_public(service, file_id: str) -> None:
    """Set permission jadi 'siapa saja yang punya link boleh lihat'."""
    service.permissions().create(fileId=file_id, body={"role": "reader", "type": "anyone"}).execute()


def _create_folder(service, name: str, parent_id: str) -> tuple[str, str]:
    """Bikin 1 folder baru di dalam parent_id. Balikin (folder_id, folder_link)."""
    metadata = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }
    folder = service.files().create(body=metadata, fields="id, webViewLink").execute()
    _make_public(service, folder["id"])
    return folder["id"], folder["webViewLink"]


def _upload_file(service, local_path: Path, filename: str, parent_id: str) -> str:
    """Upload 1 file ke folder tertentu. Balikin link file itu."""
    file_metadata = {"name": filename, "parents": [parent_id]}
    media = MediaFileUpload(str(local_path), mimetype="image/jpeg")
    uploaded = service.files().create(body=file_metadata, media_body=media, fields="id, webViewLink").execute()
    _make_public(service, uploaded["id"])
    return uploaded["webViewLink"]


def upload_session_photos(order_id: str, order_dir: Path) -> str:
    """
    Bikin 1 folder baru khusus buat sesi ini (di dalam folder induk
    GOOGLE_DRIVE_FOLDER_ID), lalu upload semua file .jpg di order_dir
    (shot_1.jpg, shot_2.jpg, ..., strip.jpg) ke folder baru itu.
    Balikin link folder-nya, buat ditaruh di email.
    """
    if not settings.google_drive_folder_id:
        raise HTTPException(status_code=500, detail="GOOGLE_DRIVE_FOLDER_ID belum diisi di .env")

    service = _get_drive_service()
    folder_id, folder_link = _create_folder(service, order_id, settings.google_drive_folder_id)

    for photo_file in sorted(order_dir.glob("*.jpg")):
        _upload_file(service, photo_file, photo_file.name, folder_id)

    return folder_link

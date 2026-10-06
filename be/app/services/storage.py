import base64
from pathlib import Path

from app.config import settings


def save_order_photos(order_id: str, photos: list[str]) -> Path:
    order_dir = Path(settings.storage_dir) / order_id
    order_dir.mkdir(parents=True, exist_ok=True)

    for i, data_url in enumerate(photos, start=1):
        _, encoded = data_url.split(",", 1)
        raw = base64.b64decode(encoded)
        (order_dir / f"shot_{i}.jpg").write_bytes(raw)

    return order_dir


def save_strip_image(order_dir: Path, image_bytes: bytes) -> Path:
    strip_path = order_dir / "strip.jpg"
    strip_path.write_bytes(image_bytes)
    return strip_path

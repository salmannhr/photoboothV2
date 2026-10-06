import base64
import io

from PIL import Image, ImageOps

FRAME_BG = (250, 246, 236)
GAP = 16
PADDING = 24
SLOT_WIDTH = 500


def _decode_data_url(data_url: str) -> Image.Image:
    _, encoded = data_url.split(",", 1)
    raw = base64.b64decode(encoded)
    return Image.open(io.BytesIO(raw)).convert("RGB")


def compose_strip(photos: list[str], arrangement: str) -> bytes:
    images = [_decode_data_url(p) for p in photos]
    n = len(images)

    if arrangement == "grid":
        cols = 2
        rows = (n + 1) // 2
        slot_w = SLOT_WIDTH
        slot_h = SLOT_WIDTH
    else:
        cols = 1
        rows = n
        slot_w = SLOT_WIDTH
        slot_h = int(SLOT_WIDTH * 4 / 3)

    canvas_w = PADDING * 2 + cols * slot_w + (cols - 1) * GAP
    canvas_h = PADDING * 2 + rows * slot_h + (rows - 1) * GAP

    canvas = Image.new("RGB", (canvas_w, canvas_h), FRAME_BG)

    for i, img in enumerate(images):
        col = i % cols
        row = i // cols
        fitted = ImageOps.fit(img, (slot_w, slot_h), method=Image.LANCZOS)
        x = PADDING + col * (slot_w + GAP)
        y = PADDING + row * (slot_h + GAP)
        canvas.paste(fitted, (x, y))

    buf = io.BytesIO()
    canvas.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

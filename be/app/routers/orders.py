from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order
from app.schemas import OrderCreate, OrderOut
from app.services import drive
from app.services import email as email_service
from app.services import image_compose, storage

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _upload_to_drive(order_id: str, order_dir) -> str | None:
    """
    Bikin folder baru khusus order ini di Drive, upload semua foto ke situ.
    Best-effort -- kalau gagal, tidak bikin seluruh proses order gagal,
    cuma linknya jadi kosong di email.
    """
    try:
        return drive.upload_session_photos(order_id, order_dir)
    except Exception as e:
        print(f"[drive] Gagal upload ke Google Drive untuk order {order_id}: {e}")
        return None


@router.post("", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """
    Dipanggil FE begitu user selesai isi email di halaman Checkout.
    Pembayaran ditangani kasir lewat mesin EDC terpisah -- backend langsung
    simpan foto ke disk, upload ke folder Google Drive baru khusus sesi ini,
    susun gambar strip, & kirim email (SEMUA foto sebagai lampiran + link
    folder Drive) tanpa menunggu konfirmasi apa pun.
    """
    order = Order(
        layout_id=payload.layout_id,
        arrangement=payload.arrangement,
        shot_count=payload.shot_count,
        email=payload.email,
        amount=payload.amount,
        access_code=payload.access_code,
        status="processing",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    try:
        order_dir = storage.save_order_photos(order.id, payload.photos)
        image_bytes = image_compose.compose_strip(payload.photos, order.arrangement)
        storage.save_strip_image(order_dir, image_bytes)
        order.photo_dir = str(order_dir)

        drive_link = _upload_to_drive(order.id, order_dir)
        order.drive_link = drive_link

        # Kumpulkan semua file di folder order (shot_1.jpg, shot_2.jpg, ..., strip.jpg)
        # buat dilampirkan semua ke email, bukan cuma strip-nya doang.
        attachments = [
            (photo_file.name, photo_file.read_bytes())
            for photo_file in sorted(order_dir.glob("*.jpg"))
        ]

        email_service.send_photo_strip(
            to_email=order.email, photos=attachments, order_id=order.id, drive_link=drive_link
        )
        order.status = "email_sent"
    except Exception as e:
        order.status = "failed"
        print(f"[order] Gagal proses order {order.id}: {e}")

    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    return order

import uuid

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


def generate_order_id() -> str:
    return f"SNAP-{uuid.uuid4().hex[:10].upper()}"


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_order_id)
    layout_id = Column(String, nullable=False)
    arrangement = Column(String, nullable=False, default="strip")
    shot_count = Column(Integer, nullable=False)
    email = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    access_code = Column(String, nullable=True)  # kode yang dipakai buat unlock sesi ini

    photo_dir = Column(String, nullable=True)
    drive_link = Column(String, nullable=True)  # sekarang link FOLDER Drive sesi ini

    status = Column(String, nullable=False, default="processing")

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StaffUser(Base):
    """Akun staff (admin/operator) buat masuk ke mode staff aplikasi."""

    __tablename__ = "staff_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "admin" | "operator"


class AccessCode(Base):
    """
    Kode akses yang di-generate Admin. Customer masukin kode ini + email
    buat mulai sesi photobooth. Sekali dipakai, langsung jadi "used" --
    tidak bisa dipakai ulang.
    """

    __tablename__ = "access_codes"

    code = Column(String, primary_key=True)
    status = Column(String, nullable=False, default="active")  # active | used
    created_by = Column(String, nullable=True)  # username admin yang generate
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    used_at = Column(DateTime, nullable=True)
    used_email = Column(String, nullable=True)

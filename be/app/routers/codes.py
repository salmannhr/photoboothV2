import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccessCode
from app.routers.auth import get_current_staff, require_admin
from app.schemas_codes import CodeOut, VerifyCodeRequest, VerifyCodeResponse

router = APIRouter(prefix="/api/codes", tags=["codes"])


def _generate_unique_code(db: Session) -> str:
    for _ in range(10):
        code = "".join(random.choices(string.digits, k=6))
        if not db.get(AccessCode, code):
            return code
    raise HTTPException(status_code=500, detail="Gagal generate kode unik, coba lagi")


@router.post("", response_model=CodeOut)
def generate_code(db: Session = Depends(get_db), staff: dict = Depends(require_admin)):
    """Cuma Admin yang boleh generate kode baru."""
    code = _generate_unique_code(db)
    entry = AccessCode(code=code, status="active", created_by=staff["sub"])
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=list[CodeOut])
def list_codes(db: Session = Depends(get_db), staff: dict = Depends(get_current_staff)):
    """Admin & Operator dua-duanya boleh lihat riwayat kode (read-only buat Operator)."""
    return db.query(AccessCode).order_by(AccessCode.created_at.desc()).limit(50).all()


@router.post("/verify", response_model=VerifyCodeResponse)
def verify_code(payload: VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    Dipanggil dari halaman customer (bukan staff) -- cek kode masih 'active',
    kalau valid langsung ditandai 'used' supaya tidak bisa dipakai ulang.
    """
    entry = db.get(AccessCode, payload.code)
    if not entry or entry.status != "active":
        raise HTTPException(status_code=400, detail="Kode salah atau sudah dipakai")

    entry.status = "used"
    entry.used_at = datetime.now(timezone.utc)
    entry.used_email = payload.email
    db.commit()

    return VerifyCodeResponse(valid=True)

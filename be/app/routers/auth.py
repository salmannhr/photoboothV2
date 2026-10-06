from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app import auth as auth_service
from app.database import get_db
from app.models import StaffUser
from app.schemas_auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(StaffUser).filter(StaffUser.username == payload.username).first()
    if not user or not auth_service.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Username atau password salah")

    token = auth_service.create_token({"sub": user.username, "role": user.role})
    return LoginResponse(token=token, role=user.role, username=user.username)


def get_current_staff(authorization: str = Header(default="")) -> dict:
    """Dependency: cek header 'Authorization: Bearer <token>' valid, balikin payload-nya."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token tidak ada")
    token = authorization.removeprefix("Bearer ")
    payload = auth_service.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token tidak valid atau sudah expired")
    return payload


def require_admin(staff: dict = Depends(get_current_staff)) -> dict:
    """Dependency: kayak get_current_staff, tapi WAJIB role admin."""
    if staff.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Cuma admin yang boleh akses ini")
    return staff

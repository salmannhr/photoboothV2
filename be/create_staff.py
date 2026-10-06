"""
Script buat bikin akun staff (admin/operator) pertama kali, atau reset
password akun yang sudah ada. Dijalankan manual dari terminal -- SENGAJA
tidak ada endpoint API atau halaman buat "daftar akun sendiri", supaya
cuma orang yang punya akses ke server ini yang bisa bikin akun staff.

Cara pakai:
    python create_staff.py <username> <password> <role>

Contoh:
    python create_staff.py admin admin123 admin
    python create_staff.py budi budi123 operator
"""

import sys

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import StaffUser


def main():
    if len(sys.argv) != 4:
        print("Cara pakai: python create_staff.py <username> <password> <role>")
        print("role harus 'admin' atau 'operator'")
        sys.exit(1)

    username, password, role = sys.argv[1], sys.argv[2], sys.argv[3]
    if role not in ("admin", "operator"):
        print("role harus 'admin' atau 'operator'")
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(StaffUser).filter(StaffUser.username == username).first()
        if existing:
            existing.password_hash = hash_password(password)
            existing.role = role
            db.commit()
            print(f"Password & role user '{username}' berhasil di-update jadi '{role}'.")
        else:
            user = StaffUser(username=username, password_hash=hash_password(password), role=role)
            db.add(user)
            db.commit()
            print(f"User '{username}' ({role}) berhasil dibuat.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

import base64
import hashlib
import hmac
import json
import secrets
import time

from app.config import settings


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hex_digest = stored.split("$", 1)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return hmac.compare_digest(digest.hex(), hex_digest)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_token(payload: dict, expires_in: int = 60 * 60 * 12) -> str:
    """Token sederhana ala JWT, ditandatangani pakai AUTH_SECRET_KEY. Default berlaku 12 jam."""
    body = {**payload, "exp": int(time.time()) + expires_in}
    body_b64 = _b64url_encode(json.dumps(body).encode())
    sig = hmac.new(settings.auth_secret_key.encode(), body_b64.encode(), hashlib.sha256).hexdigest()
    return f"{body_b64}.{sig}"


def verify_token(token: str) -> dict | None:
    try:
        body_b64, sig = token.split(".", 1)
        expected_sig = hmac.new(settings.auth_secret_key.encode(), body_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        body = json.loads(_b64url_decode(body_b64))
        if body.get("exp", 0) < time.time():
            return None
        return body
    except Exception:
        return None

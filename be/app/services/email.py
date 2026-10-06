import base64

import requests
from fastapi import HTTPException

from app.config import settings

RESEND_API_URL = "https://api.resend.com/emails"


def _build_html(drive_link: str | None, order_id: str) -> str:
    drive_section = ""
    if drive_link:
        drive_section = f"""
            <tr>
              <td style="padding: 0 32px 28px;">
                <table role="presentation" style="background:#faf6ec; border-radius:12px; padding:20px 24px; width:100%;">
                  <tr>
                    <td>
                      <p style="margin:0 0 4px; color:#241b2e; font-size:13px; font-weight:600;">
                        Semua foto kamu juga ada di Google Drive
                      </p>
                      <p style="margin:0 0 14px; color:#6b5f7a; font-size:12px;">
                        Termasuk tiap jepretan satuan, resolusi asli, bisa didownload kapan saja.
                      </p>
                      <a href="{drive_link}"
                         style="display:inline-block; background:#ff4d8d; color:#ffffff; padding:12px 22px; border-radius:999px; text-decoration:none; font-size:13px; font-weight:700;">
                        Buka Folder di Google Drive
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
        """

    return f"""
    <table role="presentation" style="width:100%; background:#150e24; padding:32px 0; font-family:'Segoe UI', Roboto, sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" style="width:100%; max-width:480px; background:#1b1230; border-radius:16px; overflow:hidden;">
            <tr>
              <td align="center" style="padding:32px 32px 20px;">
                <img src="{settings.email_logo_url}" alt="Snapstrip" width="200" style="display:block; border-radius:8px;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px;">
                <h1 style="margin:0; color:#ffd98a; font-size:22px; letter-spacing:0.02em;">
                  Terima kasih sudah mampir!
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <p style="margin:0; color:rgba(250,246,236,0.75); font-size:14px; line-height:1.6;">
                  Semua foto kamu (tiap jepretan + hasil strip) ada di lampiran email ini, siap didownload atau langsung diprint.
                </p>
              </td>
            </tr>
            {drive_section}
            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0; color:#6b5f7a; font-size:11px; font-family:monospace;">
                  Order ID: {order_id}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    """


def send_photo_strip(
    to_email: str,
    photos: list[tuple[str, bytes]],
    order_id: str,
    drive_link: str | None = None,
) -> None:
    """
    Kirim email lewat Resend, dengan SEMUA foto dilampirkan (bukan cuma
    gambar strip-nya doang). `photos` adalah list (filename, isi_bytes).
    Kalau `drive_link` diisi, ditambah bagian link folder Google Drive juga.
    Dokumentasi: https://resend.com/docs/api-reference/emails/send-email
    """
    if not settings.resend_api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY belum diisi di .env")

    attachments = [
        {"filename": filename, "content": base64.b64encode(content).decode()}
        for filename, content in photos
    ]

    payload = {
        "from": settings.email_from,
        "to": [to_email],
        "subject": "Foto Snapstrip Kamu Sudah Jadi! 🎞️",
        "html": _build_html(drive_link, order_id),
        "attachments": attachments,
    }

    headers = {
        "Authorization": f"Bearer {settings.resend_api_key}",
        "Content-Type": "application/json",
    }

    resp = requests.post(RESEND_API_URL, json=payload, headers=headers, timeout=15)
    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Resend menolak request: {resp.text}")

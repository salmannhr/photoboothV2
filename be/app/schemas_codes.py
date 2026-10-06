from datetime import datetime

from pydantic import BaseModel


class CodeOut(BaseModel):
    code: str
    status: str
    created_by: str | None = None
    created_at: datetime
    used_at: datetime | None = None
    used_email: str | None = None

    class Config:
        from_attributes = True


class VerifyCodeRequest(BaseModel):
    code: str
    email: str


class VerifyCodeResponse(BaseModel):
    valid: bool

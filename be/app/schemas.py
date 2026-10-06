from datetime import datetime

from pydantic import BaseModel, EmailStr


class OrderCreate(BaseModel):
    layout_id: str
    arrangement: str
    shot_count: int
    email: EmailStr
    amount: int
    photos: list[str]
    access_code: str | None = None


class OrderOut(BaseModel):
    id: str
    layout_id: str
    arrangement: str
    shot_count: int
    email: EmailStr
    amount: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

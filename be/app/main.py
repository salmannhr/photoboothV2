from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import auth, codes, health, orders

Base.metadata.create_all(bind=engine)

Path(settings.storage_dir).mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Snapstrip Photobooth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(orders.router)
app.include_router(auth.router)
app.include_router(codes.router)

app.mount("/photos", StaticFiles(directory=settings.storage_dir), name="photos")


@app.get("/")
def root():
    return {"message": "Snapstrip Photobooth API jalan. Lihat /docs untuk daftar endpoint."}

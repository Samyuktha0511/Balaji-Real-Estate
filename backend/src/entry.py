from datetime import datetime, timezone
from decimal import Decimal
from mimetypes import guess_type
from typing import Any
from uuid import uuid4

import asgi
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, Field, field_serializer
from workers import WorkerEntrypoint


app = FastAPI(title="Balaji Real Estate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ListingIn(BaseModel):
    title: str | None = None
    address: str | None = None
    price: Decimal | None = None
    area: str | None = None
    description: str | None = None
    phone: str | None = None
    email: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    status: str | None = "available"
    photos: list[str] = Field(default_factory=list)
    documents: list[str] = Field(default_factory=list)


class Listing(ListingIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    createdAt: datetime

    @field_serializer("price")
    def serialize_price(self, value: Decimal | None) -> str | None:
        return None if value is None else str(value)

    @field_serializer("createdAt")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat().replace("+00:00", "Z")


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        app.state.env = self.env
        return await asgi.fetch(app, request, self.env)


def env() -> Any:
    current = getattr(app.state, "env", None)
    if current is None:
        raise HTTPException(status_code=500, detail="Worker environment is unavailable")
    return current


def db() -> Any:
    current = getattr(env(), "DB", None)
    if current is None:
        raise HTTPException(status_code=500, detail="D1 binding DB is not configured")
    return current


def bucket() -> Any:
    current = getattr(env(), "LISTING_MEDIA", None)
    if current is None:
        raise HTTPException(status_code=500, detail="R2 binding LISTING_MEDIA is not configured")
    return current


def js_get(value: Any, key: str, default: Any = None) -> Any:
    if value is None:
        return default
    if isinstance(value, dict):
        return value.get(key, default)
    try:
        return getattr(value, key)
    except Exception:
        return default


async def d1_all(sql: str, *params: Any) -> list[dict[str, Any]]:
    result = await db().prepare(sql).bind(*params).all()
    rows = js_get(result, "results", [])
    return [dict(row) for row in rows]


async def d1_first(sql: str, *params: Any) -> dict[str, Any] | None:
    result = await db().prepare(sql).bind(*params).first()
    return None if result is None else dict(result)


async def d1_run(sql: str, *params: Any) -> Any:
    return await db().prepare(sql).bind(*params).run()


async def hydrate_listing(row: dict[str, Any]) -> Listing:
    listing_id = row["id"]
    photo_rows = await d1_all(
        "SELECT photo FROM listing_photos WHERE listing_id = ? ORDER BY sort_order, photo",
        listing_id,
    )
    doc_rows = await d1_all(
        "SELECT doc FROM listing_docs WHERE listing_id = ? ORDER BY sort_order, doc",
        listing_id,
    )
    created_at = row.get("created_at") or datetime.now(timezone.utc).isoformat()

    return Listing(
        id=listing_id,
        title=row.get("title"),
        address=row.get("address"),
        price=Decimal(str(row["price"])) if row.get("price") is not None else None,
        area=row.get("area"),
        description=row.get("description"),
        phone=row.get("phone"),
        email=row.get("email"),
        latitude=row.get("latitude"),
        longitude=row.get("longitude"),
        status=row.get("status"),
        createdAt=datetime.fromisoformat(created_at.replace("Z", "+00:00")),
        photos=[item["photo"] for item in photo_rows],
        documents=[item["doc"] for item in doc_rows],
    )


@app.get("/")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "balaji-real-estate-api"}


@app.get("/api/listings", response_model=list[Listing])
async def all_listings() -> list[Listing]:
    rows = await d1_all("SELECT * FROM listing ORDER BY created_at DESC, id DESC")
    return [await hydrate_listing(row) for row in rows]


@app.get("/api/listings/{listing_id}", response_model=Listing)
async def get_listing(listing_id: int) -> Listing:
    row = await d1_first("SELECT * FROM listing WHERE id = ?", listing_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return await hydrate_listing(row)


@app.post("/api/listings", response_model=Listing, status_code=201)
async def create_listing(payload: ListingIn) -> Listing:
    created_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    result = await d1_run(
        """
        INSERT INTO listing (
            title, address, price, area, description, phone, email,
            latitude, longitude, status, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        payload.title,
        payload.address,
        str(payload.price) if payload.price is not None else None,
        payload.area,
        payload.description,
        payload.phone,
        payload.email,
        payload.latitude,
        payload.longitude,
        payload.status,
        created_at,
    )
    listing_id = js_get(js_get(result, "meta"), "last_row_id")
    row = await d1_first("SELECT * FROM listing WHERE id = ?", listing_id)
    if row is None:
        raise HTTPException(status_code=500, detail="Listing was not created")

    for index, photo in enumerate(payload.photos):
        await d1_run(
            "INSERT INTO listing_photos (listing_id, photo, sort_order) VALUES (?, ?, ?)",
            row["id"],
            photo,
            index,
        )
    for index, document in enumerate(payload.documents):
        await d1_run(
            "INSERT INTO listing_docs (listing_id, doc, sort_order) VALUES (?, ?, ?)",
            row["id"],
            document,
            index,
        )
    return await hydrate_listing(row)


@app.post("/api/listings/{listing_id}/photos", response_model=list[str])
async def upload_photos(listing_id: int, files: list[UploadFile] = File(...)) -> list[str]:
    row = await d1_first("SELECT id FROM listing WHERE id = ?", listing_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    saved: list[str] = []
    for upload in files:
        if not upload.filename:
            continue
        suffix = ""
        if "." in upload.filename:
            suffix = "." + upload.filename.rsplit(".", 1)[1]
        name = f"{uuid4()}{suffix}"
        content = await upload.read()
        content_type = upload.content_type or guess_type(upload.filename)[0] or "application/octet-stream"
        await bucket().put(name, content, {"httpMetadata": {"contentType": content_type}})
        await d1_run(
            "INSERT INTO listing_photos (listing_id, photo, sort_order) VALUES (?, ?, ?)",
            listing_id,
            name,
            len(saved),
        )
        saved.append(name)
    return saved


@app.get("/api/listings/media/{filename}")
async def serve_media(filename: str) -> Response:
    media = await bucket().get(filename)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")

    content_type = js_get(js_get(media, "httpMetadata"), "contentType")
    content_type = content_type or guess_type(filename)[0] or "application/octet-stream"
    body = await media.arrayBuffer()
    return Response(content=bytes(body), media_type=content_type)


@app.get("/api/whatsapp/webhook")
async def verify_whatsapp_webhook(request: Request) -> Response:
    challenge = request.query_params.get("hub.challenge", "")
    return Response(content=challenge, media_type="text/plain")


@app.post("/api/whatsapp/webhook", status_code=200)
async def handle_whatsapp_webhook(payload: dict[str, Any]) -> dict[str, str]:
    return {"status": "received"}

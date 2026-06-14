# Balaji Real Estate FastAPI Worker

FastAPI replacement for the old Spring Boot backend in `backend - tmp/`.

## Runtime Shape

- Framework: FastAPI running inside a Cloudflare Python Worker.
- Database: Cloudflare D1 by default for Worker deployment.
- Media storage: Cloudflare R2 bucket binding named `LISTING_MEDIA`.
- API base paths are preserved from Spring Boot:
  - `GET /api/listings`
  - `GET /api/listings/{id}`
  - `POST /api/listings`
  - `POST /api/listings/{id}/photos`
  - `GET /api/listings/media/{filename}`
  - `GET|POST /api/whatsapp/webhook`

## Install

Install `uv`, Node.js, and npm dependencies:

```bash
uv venv
uv sync
npm install
```

## Local D1 Setup

Create a D1 database and copy the real `database_id` into `wrangler.jsonc`:

```bash
npx wrangler d1 create balaji-real-estate
```

Apply the schema locally:

```bash
npx wrangler d1 migrations apply balaji-real-estate --local
```

Apply it remotely before production deploy:

```bash
npx wrangler d1 migrations apply balaji-real-estate --remote
```

## R2 Setup

Create the media bucket if it does not already exist:

```bash
npx wrangler r2 bucket create bre-listing-detail-img
```

The Worker reads and writes through this binding:

```json
{
  "binding": "LISTING_MEDIA",
  "bucket_name": "bre-listing-detail-img"
}
```

## Run

```bash
npm run dev
```

The local Worker runs at `http://localhost:8787` by default.

If the React app still proxies `/api` to port `8080`, update `frontend/vite.config.js` to target `http://localhost:8787` while using this backend.

## Deploy

```bash
npm run deploy
```

## Postgres Note

Python Workers are not the same as a normal Python server, so native Postgres drivers can complicate deployment. This backend uses D1-compatible SQL for Cloudflare deployment. A Postgres-compatible create script is included at `postgres-schema.sql` if you later run FastAPI somewhere with normal Python networking and a Postgres driver.

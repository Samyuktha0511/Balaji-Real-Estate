Balaji Real Estate - Portfolio & Listings

Overview
- React frontend + TypeScript Cloudflare Worker backend (Cloudflare D1 + R2)
- Purpose: public listings for plot resale broker with photo/docs and contact shortcuts.
- Note: the original Spring Boot + PostgreSQL backend is retained under `backend/` as a
  legacy reference, but the active backend is now the TypeScript Worker under `worker/`.

Architecture
- Frontend: React 18 + Vite (dev server on `http://localhost:3000`)
- Backend: Cloudflare Worker (itty-router) on `http://localhost:8787`
- Database: Cloudflare D1 (SQLite) — local simulator for development
- Media storage: Cloudflare R2 — local simulator for development
- The Vite dev server proxies `/api` requests to the Worker at `http://localhost:8787`.

Prerequisites
- Node.js 18+ (Node 22 recommended)
- npm (bundled with Node)
- A Cloudflare account is only required for remote deploy, not for local development.

Quick start (recommended)

1. Backend: TypeScript Worker (from `worker`):

```bash
cd worker
npm install
npm run db:migrate   # one-time: create the local D1 schema
npm run dev          # starts wrangler dev on http://localhost:8787
```

   - `npm run dev` runs `wrangler dev`, which spins up local D1 (SQLite) and R2 simulators.
   - If `npm run db:migrate` asks whether to run locally or remotely, choose local, or run:
     `wrangler d1 execute balaji-realestate --local --file=src/db/schema.sql`

2. Frontend: install and run (from `frontend`):

```bash
cd frontend
npm install
npm run dev          # starts Vite on http://localhost:3000
```

Available Worker scripts (worker/package.json)
- `npm run dev`               — run the Worker locally (wrangler dev, port 8787)
- `npm run db:migrate`        — apply schema to the local D1 database
- `npm run db:migrate:remote` — apply schema to the remote (production) D1 database
- `npm run deploy`            — deploy the Worker to Cloudflare
- `npm run type-check`        — TypeScript type-check only (tsc --noEmit)

API surface (mirrors the original Spring Boot backend)
- `GET    /api/listings`                 — list all listings
- `GET    /api/listings/:id`             — get a single listing
- `POST   /api/listings`                 — create a listing
- `PUT    /api/listings/:id`             — update listing fields
- `DELETE /api/listings/:id`             — delete a listing (and its R2 objects)
- `POST   /api/listings/:id/photos`      — upload photos (multipart)
- `GET    /api/listings/media/:filename` — serve a photo / document from R2

Notes
- Bindings (D1 `DB`, R2 `MEDIA`) and the dev port (8787) are configured in `worker/wrangler.toml`.
- For production, create the D1 database and R2 bucket in your Cloudflare account and
  update `wrangler.toml` with the generated IDs before running `npm run deploy`.

Legacy backend (Spring Boot + PostgreSQL)
- The original backend is still under `backend/` and can be run with Docker + Maven:

```bash
docker compose up -d          # start Postgres (and pgAdmin)
cd backend
mvn clean package
java -jar target/*.jar         # backend on http://localhost:8080
```

  - If you use the legacy backend, point the Vite proxy in `frontend/vite.config.js`
    back to `http://localhost:8080`.

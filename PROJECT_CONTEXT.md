# Balaji Real Estate - Project Context & Architecture

## 1. Project Overview

**Project Name:** Balaji Real Estate Website  
**Owner:** Balaji, plot resale broker in Coimbatore  
**Purpose:** Public-facing real estate portfolio website for showcasing plot listings with photos, documents, location details, and contact shortcuts.  
**Target Users:** Potential plot buyers. Public browsing does not require login.

### Business Requirements

- Display available plot listings with photos, documents, pricing, area, and location.
- Enable visitors to contact the owner through phone, WhatsApp, or email.
- Allow an admin/owner flow to create and manage listings.
- Store property media outside the application runtime.
- Show property locations through Google Maps.
- Deploy under the Cloudflare-managed domain `balajirealestatecovai.com`.

---

## 2. Current Architecture

The project started as a React frontend with a Spring Boot backend and PostgreSQL. The backend is now being migrated to a FastAPI service designed specifically for Cloudflare Workers.

### Current Direction

- **Frontend:** React + Vite.
- **Backend:** FastAPI running inside a Cloudflare Python Worker.
- **Database for Worker deployment:** Cloudflare D1.
- **Media storage:** Cloudflare R2 bucket.
- **Legacy backend reference:** Spring Boot code lives in `backend - tmp/`.
- **Postgres status:** Kept as a schema/reference option, but not the preferred runtime target for Cloudflare Workers.

### Philosophy

The backend is being shaped around Cloudflare-native primitives instead of trying to run a traditional server stack at the edge.

- Workers are request-driven and do not run like a long-lived VM/container.
- Local filesystem uploads do not fit Workers; media belongs in R2.
- Native Python Postgres drivers can complicate Python Worker deployment, so D1 is the simplest Cloudflare-native database path.
- The public API contract is kept close to the old Spring Boot API so the React frontend needs minimal changes.
- Local development should mirror production bindings as much as possible: local D1 for tables, R2 binding for media, Worker dev server for the API.

---

## 3. Technology Stack

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS split across files under `frontend/src/styles/`

### Backend

- **Framework:** FastAPI
- **Runtime:** Cloudflare Python Workers
- **Entrypoint:** `backend/src/entry.py`
- **Worker Tooling:** Wrangler through `pywrangler`
- **Python Environment:** Python 3.12+, `uv`
- **Dependencies:** `fastapi`, `python-multipart`, Cloudflare Workers Python dev packages

### Cloudflare Services

- **Workers:** Hosts the FastAPI backend.
- **D1:** Stores listing rows and media filename references.
- **R2:** Stores uploaded listing photos/documents.
- **Pages or static hosting:** Intended frontend deployment target.
- **Cloudflare DNS/domain:** Future production domain `balajirealestatecovai.com`.

---

## 4. Project Structure

```text
Balaji Real Estate/
+-- backend/
|   +-- src/
|   |   +-- entry.py                         FastAPI Worker entrypoint
|   +-- migrations/
|   |   +-- 0001_create_listing_schema.sql   D1 schema migration
|   +-- postgres-schema.sql                  Postgres-compatible schema reference
|   +-- wrangler.jsonc                       Worker, D1, and R2 bindings
|   +-- pyproject.toml                       Python dependencies
|   +-- package.json                         Wrangler scripts
|   +-- AGENTS.md                            Cloudflare Worker notes
|   +-- README.md                            Backend setup and run instructions
+-- backend - tmp/
|   +-- ...                                  Legacy Spring Boot backend reference
+-- frontend/
|   +-- package.json
|   +-- vite.config.js
|   +-- src/
|       +-- App.jsx
|       +-- main.jsx
|       +-- components/
|       +-- styles/
+-- docker-compose.yml                       Legacy/local Postgres and pgAdmin
+-- test-listing.json                        Sample listing payload
+-- README.md
+-- PROJECT_CONTEXT.md
```

---

## 5. Backend API

The FastAPI Worker preserves the Spring Boot endpoint shape:

| Method | Endpoint | Purpose | Storage |
|---|---|---|---|
| GET | `/` | Health check | None |
| GET | `/api/listings` | Fetch all listings | D1 |
| GET | `/api/listings/{id}` | Fetch one listing | D1 |
| POST | `/api/listings` | Create listing | D1 |
| POST | `/api/listings/{id}/photos` | Upload listing photos | R2 + D1 filename refs |
| GET | `/api/listings/media/{filename}` | Serve media file | R2 |
| GET | `/api/whatsapp/webhook` | WhatsApp verification challenge | None |
| POST | `/api/whatsapp/webhook` | WhatsApp webhook stub | None yet |

### Listing Response Shape

The API returns the frontend-compatible field names:

```json
{
  "id": 1,
  "title": "Premium Plot in Sunflower Layout",
  "address": "Sunflower Layout, Coimbatore, TN",
  "price": "2500000",
  "area": "2500 sq.ft",
  "description": "Beautiful plot in prime location.",
  "phone": "+91 98765 43210",
  "email": "balaji@realestate.com",
  "latitude": 11.0226,
  "longitude": 76.9558,
  "status": "available",
  "createdAt": "2026-06-14T00:00:00Z",
  "photos": [],
  "documents": []
}
```

---

## 6. Database Model

### D1 Runtime Schema

The production Worker path uses D1. The schema is checked in at:

```text
backend/migrations/0001_create_listing_schema.sql
```

Tables:

- `listing`
- `listing_photos`
- `listing_docs`

D1 uses SQLite-compatible SQL, so IDs are `INTEGER PRIMARY KEY AUTOINCREMENT`, timestamps are stored as ISO strings, and `price` is stored as text to avoid floating point money issues.

### Postgres Reference

A Postgres-compatible create script is kept at:

```text
backend/postgres-schema.sql
```

This exists for migration/reference or for a future traditional FastAPI deployment using a normal Python Postgres driver. It is not the preferred path for the Cloudflare Worker runtime.

### Why D1 Instead Of Postgres For Workers

Cloudflare Workers are not a normal Python server process. Using Postgres from Workers typically needs a hosted database plus connection pooling/proxying such as Hyperdrive, and Python package compatibility can become the hard part. D1 keeps the backend simple and Cloudflare-native for this project size.

---

## 7. Media Storage

### Current Runtime Design

- Uploaded photos are stored in Cloudflare R2.
- The generated filename is stored in D1 under `listing_photos`.
- Media is served through:

```text
GET /api/listings/media/{filename}
```

### R2 Binding

The Worker expects this binding in `backend/wrangler.jsonc`:

```jsonc
"r2_buckets": [
  {
    "binding": "LISTING_MEDIA",
    "bucket_name": "bre-listing-detail-img"
  }
]
```

### Philosophy

The application should not depend on local disk for uploaded media. Local disk worked for Spring Boot development, but it does not fit Cloudflare Workers. R2 is the durable storage layer, and the database stores only metadata/references.

---

## 8. Local Setup

Run these from `backend/`.

### Install Dependencies

```powershell
cd "d:\Projects\Balaji Real Estate\backend"
uv venv
uv sync
npm install
```

On this machine, Python is invoked as `py` instead of `python`.

### Create D1 Database

```powershell
npx wrangler d1 create balaji-real-estate
```

Copy the printed `database_id` into:

```text
backend/wrangler.jsonc
```

Replace:

```jsonc
"database_id": "00000000-0000-0000-0000-000000000000"
```

### Apply Local Tables

Yes, the tables should be created before meaningful API testing.

```powershell
npx wrangler d1 migrations apply balaji-real-estate --local
```

Optional verification:

```powershell
npx wrangler d1 execute balaji-real-estate --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### Create R2 Bucket

```powershell
npx wrangler r2 bucket create bre-listing-detail-img
```

### Run Backend Locally

```powershell
npm run dev
```

The Worker API should run at:

```text
http://localhost:8787
```

Smoke test URLs:

```text
http://localhost:8787/
http://localhost:8787/api/listings
```

---

## 9. Frontend Local Setup

Run from `frontend/`:

```powershell
cd "d:\Projects\Balaji Real Estate\frontend"
npm install
npm run dev
```

The frontend usually runs at:

```text
http://localhost:3000
```

During the Worker migration, the Vite proxy should target:

```text
http://localhost:8787
```

instead of the old Spring Boot port:

```text
http://localhost:8080
```

---

## 10. Production Setup

### Backend

Production backend deployment is a Cloudflare Worker:

```powershell
cd "d:\Projects\Balaji Real Estate\backend"
npx wrangler d1 migrations apply balaji-real-estate --remote
npm run deploy
```

Before deploying:

- `wrangler.jsonc` must contain the real D1 `database_id`.
- The R2 bucket must exist.
- Secrets must be configured through Cloudflare, not committed into source control.

### Frontend

The React app can be deployed as static assets, ideally through Cloudflare Pages.

The frontend API base URL should point to either:

- the Worker route, such as `https://api.balajirealestatecovai.com`, or
- a same-domain route/proxy if the site and API are configured under one Cloudflare domain.

### Domain Direction

Target production domains:

- Public website: `balajirealestatecovai.com`
- API: `api.balajirealestatecovai.com` or same-domain `/api`

---

## 11. Legacy Spring Boot Backend

The old backend has been moved/kept as reference under:

```text
backend - tmp/
```

It used:

- Spring Boot 3
- Java 17
- Maven
- PostgreSQL
- JPA/Hibernate
- local filesystem uploads, later partially configured toward R2/S3-style storage

Important security note: any R2/S3-style access keys that were previously committed in Spring configuration should be rotated and replaced with Cloudflare bindings/secrets.

---

## 12. Completed Work

### Backend Migration

- [x] Replaced starter Durable Object sample with FastAPI Worker entrypoint.
- [x] Ported listing endpoints from Spring Boot.
- [x] Added R2-backed photo upload.
- [x] Added R2-backed media serving endpoint.
- [x] Added WhatsApp webhook verification and receive stubs.
- [x] Added D1 migration schema.
- [x] Added Postgres reference schema.
- [x] Updated Worker config with D1 and R2 bindings.
- [x] Updated backend README with local/prod commands.

### Frontend

- [x] React/Vite public listing UI exists.
- [x] Listing cards, listing detail, photo gallery, contact actions, and map display exist.
- [ ] Update Vite proxy to use Worker dev server during migration if not already done.

---

## 13. Needs Implementation

### Backend

- [ ] Add update/delete listing endpoints.
- [ ] Add document upload endpoint if documents are required before admin panel work.
- [ ] Add admin authentication.
- [ ] Add validation rules for listing fields.
- [ ] Add pagination/search/filter endpoints.
- [ ] Add tests or scripted smoke tests.

### Admin Panel

- [ ] Password-protected admin dashboard.
- [ ] Listing creation form.
- [ ] Listing editing interface.
- [ ] Listing deletion flow.
- [ ] Photo upload with preview.
- [ ] Document upload with preview/download.

### Deployment

- [ ] Create production D1 database.
- [ ] Apply remote D1 migrations.
- [ ] Create/confirm R2 bucket.
- [ ] Deploy Worker.
- [ ] Deploy frontend to Cloudflare Pages.
- [ ] Wire custom domain and API route.

---

## 14. Common Commands

### Backend Worker

```powershell
cd "d:\Projects\Balaji Real Estate\backend"
uv venv
uv sync
npm install
npm run dev
npm run deploy
```

### D1

```powershell
npx wrangler d1 create balaji-real-estate
npx wrangler d1 migrations apply balaji-real-estate --local
npx wrangler d1 migrations apply balaji-real-estate --remote
npx wrangler d1 execute balaji-real-estate --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### R2

```powershell
npx wrangler r2 bucket create bre-listing-detail-img
```

### Frontend

```powershell
cd "d:\Projects\Balaji Real Estate\frontend"
npm install
npm run dev
npm run build
```

---

## 15. Useful References

- Cloudflare Python Workers: https://developers.cloudflare.com/workers/languages/python/
- FastAPI on Python Workers: https://developers.cloudflare.com/workers/languages/python/packages/fastapi/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare R2 Workers API: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
- Cloudflare Hyperdrive: https://developers.cloudflare.com/hyperdrive/
- React: https://react.dev
- Vite: https://vite.dev

---

## 16. Open Questions

1. Should the admin panel use a simple password, Cloudflare Access, JWT, or another auth method?
2. Should production API live on `api.balajirealestatecovai.com` or same-domain `/api`?
3. Should documents share the same R2 bucket and media endpoint as photos?
4. What search/filter fields matter most: price, area, location, status, or plot size?
5. Should image optimization/thumbnails be added before public launch?

---

**Last Updated:** 2026-06-14  
**Status:** Backend migration in progress: FastAPI Worker scaffold complete, D1/R2 setup pending local smoke test.  
**Next Step:** Create/apply D1 tables, confirm R2 bucket, run `npm run dev`, and smoke test the API.

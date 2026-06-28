# Balaji Real Estate - Project Context & Architecture

## 1. Project Overview

**Project Name:** Balaji Real Estate Website  
**Owner:** Balaji (Plot Resale Broker, Coimbatore)  
**Purpose:** Public-facing real estate portfolio website showcasing plot listings with contact integration  
**Target Users:** Potential plot buyers with no login required (public access)

### Business Requirements
- Display available plot listings with photos, documents, and location
- Enable visitors to contact owner via phone, WhatsApp, or email
- Allow owner (admin) to create, edit, and manage listings
- Store property photos and documents
- Show property location on Google Maps
- No user authentication for public listing view
- Future migration to Cloudflare domain: `balajirealestatecovai.com`
- Future cloud storage migration (S3)

---

## 2. Technology Stack

### Backend (Active — TypeScript Cloudflare Worker)
- **Runtime:** Cloudflare Workers (workerd, run locally via Wrangler)
- **Language:** TypeScript 5.5
- **Router:** itty-router v5 (AutoRouter with built-in CORS)
- **Database:** Cloudflare D1 (SQLite)
- **Media Storage:** Cloudflare R2 (object storage)
- **Tooling:** Wrangler 3.x (local dev simulators for D1 + R2, deploy)

### Backend (Legacy — retained under `backend/`)
- **Framework:** Spring Boot 3.1.4 (Java 17)
- **Build Tool:** Maven 3.9.2 (via Maven Wrapper - mvnw.cmd)
- **Database:** PostgreSQL 15
- **ORM:** JPA/Hibernate
- **Additional Libraries:**
  - Lombok (@Data annotation for entity boilerplate)
  - Jackson (JSON serialization)
  - PostgreSQL JDBC Driver 42.6.0
  - Spring Data JPA
- _Note: superseded by the TypeScript Worker; kept for reference only._

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Routing:** React Router v6.20.0
- **HTTP Client:** Axios 1.5.0
- **Styling:** Vanilla CSS (responsive, no framework needed)

### DevOps & Infrastructure
- **Active backend:** Cloudflare Worker (Wrangler local dev / Cloudflare deploy)
- **Legacy backend services (Docker):**
  - PostgreSQL 15 container (port 5432)
  - pgAdmin 4 container (port 8081)
- **Local Development Ports:**
  - Worker API (active): `http://localhost:8787`
  - Frontend Dev Server: `http://localhost:3000`
  - Legacy Spring Boot API: `http://localhost:8080`
  - Legacy pgAdmin: `http://localhost:8081`
  - Legacy PostgreSQL: `localhost:5432`
- **Frontend → backend wiring:** Vite proxies `/api` to `http://localhost:8787` (the Worker).

### Deployment Considerations
- Worker deploys to Cloudflare via `wrangler deploy` (`npm run deploy`)
- D1 schema applied via `wrangler d1 execute` (`npm run db:migrate` / `db:migrate:remote`)
- Media stored in Cloudflare R2 (no local filesystem dependency)
- Legacy path: Maven wrapper + Dockerfile + Docker Compose, local `uploads/` storage

---

## 3. Project Structure

```
Balaji Real Estate/
├── backend/
│   ├── pom.xml                          (Maven build config)
│   ├── .mvn/wrapper/                    (Maven wrapper)
│   ├── mvnw.cmd                         (Windows Maven wrapper script)
│   ├── Dockerfile                       (Multi-stage build)
│   ├── target/
│   │   └── realestate-0.0.1-SNAPSHOT.jar
│   └── src/main/
│       ├── java/com/balaji/realestate/
│       │   ├── Application.java         (Spring Boot entry point)
│       │   ├── model/
│       │   │   └── Listing.java         (JPA entity)
│       │   ├── repository/
│       │   │   └── ListingRepository.java
│       │   ├── service/
│       │   │   └── FileStorageService.java
│       │   └── controller/
│       │       └── ListingController.java
│       └── resources/
│           └── application.yml          (Spring Boot config)
├── worker/                              (ACTIVE backend — TypeScript Cloudflare Worker)
│   ├── package.json                     (dev / deploy / db:migrate scripts)
│   ├── tsconfig.json
│   ├── wrangler.toml                    (Worker config: D1 + R2 bindings, dev port 8787)
│   └── src/
│       ├── index.ts                     (Worker entry: AutoRouter + routes + CORS)
│       ├── cors.ts                      (CORS / error response helpers)
│       ├── types.ts                     (Env bindings, Listing types)
│       ├── db/
│       │   └── schema.sql               (D1 / SQLite schema)
│       └── handlers/
│           ├── listings.ts              (CRUD handlers for listings)
│           └── media.ts                 (R2 upload + media serving)
├── frontend/
│   ├── package.json
│   ├── vite.config.js                   (Vite + React plugin + API proxy → :8787)
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                      (Main router component)
│       ├── styles/                      (Modular CSS — design system + sections)
│       └── components/
│           ├── ListingCard.jsx          (Grid card for homepage)
│           ├── ListingDetail.jsx        (Detail page with full info)
│           ├── PhotoGallery.jsx         (Carousel with thumbnails + lightbox)
│           └── Logo.jsx                 (Inline SVG brand mark)
├── docker-compose.yml                   (Legacy: Postgres + pgAdmin)
├── .gitignore
├── README.md
├── uploads/                             (Legacy media file storage)
├── PROJECT_CONTEXT.md                   (This file)
└── test-listing.json                    (Sample test data)
```

---

## 4. Database Schema

### Primary Entity: Listing

```sql
CREATE TABLE listing (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    address VARCHAR(255),
    price NUMERIC,
    area VARCHAR(255),
    description VARCHAR(2000),
    phone VARCHAR(255),
    email VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(255),
    created_at TIMESTAMP
);

-- Photos stored in separate table (ElementCollection)
CREATE TABLE listing_photos (
    listing_id BIGINT REFERENCES listing(id),
    photo VARCHAR(255)
);

-- Documents stored in separate table (ElementCollection)
CREATE TABLE listing_docs (
    listing_id BIGINT REFERENCES listing(id),
    doc VARCHAR(255)
);
```

### Listing Model Fields
| Field | Type | Purpose |
|-------|------|---------|
| id | Long | Unique identifier (auto-generated) |
| title | String | Property title/name |
| address | String | Property location |
| price | BigDecimal | Price in INR |
| area | String | Property size (e.g., "2500 sq.ft") |
| description | String (2000 chars) | Full property description |
| phone | String | Owner contact phone |
| email | String | Owner contact email |
| latitude | Double | Google Maps latitude |
| longitude | Double | Google Maps longitude |
| status | String | "available" or "sold" |
| createdAt | Instant | Listing creation timestamp |
| photos | List<String> | Filenames of uploaded photos |
| documents | List<String> | Filenames of uploaded documents |

### Database Credentials
- **Host:** `localhost:5432` (Docker container)
- **Database:** `realestate`
- **Username:** `realestate`
- **Password:** `changeme`
- **Timezone:** `Asia/Kolkata`

---

## 5. REST API Endpoints

### Listing Management
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/listings` | Fetch all listings | None (public) |
| GET | `/api/listings/{id}` | Fetch single listing by ID | None (public) |
| POST | `/api/listings` | Create new listing | None (not protected - TBD) |
| POST | `/api/listings/{id}/photos` | Upload photos for listing | None (not protected - TBD) |
| GET | `/api/listings/media/{filename}` | Serve photo/document files | None (public) |

### Example Request: Create Listing
```bash
POST http://localhost:8080/api/listings
Content-Type: application/json

{
  "title": "Premium Plot in Sunflower Layout",
  "address": "Sunflower Layout, Coimbatore, TN",
  "price": "2500000",
  "area": "2500 sq.ft",
  "description": "Beautiful plot in prime location...",
  "phone": "+91 98765 43210",
  "email": "balaji@realestate.com",
  "latitude": 11.0226,
  "longitude": 76.9558,
  "status": "available"
}

Response: 201 Created
{
  "id": 1,
  "title": "Premium Plot in Sunflower Layout",
  ...
}
```

### Example Request: Upload Photos
```bash
POST http://localhost:8080/api/listings/1/photos
Content-Type: multipart/form-data

files: [photo1.jpg, photo2.jpg, photo3.jpg]

Response: 200 OK
["uuid-generated-1.jpg", "uuid-generated-2.jpg", "uuid-generated-3.jpg"]
```

---

## 6. Frontend Components & Pages

### App.jsx (Router)
- Handles routing with React Router v6
- Routes:
  - `/` → Home page (lists all properties)
  - `/listing/:id` → Detail page for specific listing

### ListingCard.jsx
**Location:** `frontend/src/components/ListingCard.jsx`  
**Purpose:** Displays a single listing in grid layout (homepage)

**Features:**
- Shows first photo or placeholder
- Title, address, price (INR format), area, description
- "View Details" button (navigates to detail page)
- Quick contact buttons: Phone (tel:), WhatsApp (wa.me/), Email (mailto:)
- Hover effects with image zoom and shadow

**Props:** `listing` (object)

### ListingDetail.jsx
**Location:** `frontend/src/components/ListingDetail.jsx`  
**Purpose:** Full listing page with all details

**Features:**
- Photo gallery with carousel navigation
- Title, address, price, area (displayed in boxes)
- Full description
- Contact details and action buttons (Call Now, WhatsApp, Email)
- Status badge (AVAILABLE/SOLD)
- Location section with Google Maps iframe
- Documents download section
- Back button to return to homepage

**Sections:**
1. **Photo Gallery** - Full-width carousel with prev/next navigation
2. **Listing Info** - Title, address, price, area side-by-side
3. **Description** - Full property details
4. **Contact** - Phone, email, and action buttons
5. **Location** - Coordinates display and Google Maps embed
6. **Documents** - List of downloadable documents

### PhotoGallery.jsx
**Location:** `frontend/src/components/PhotoGallery.jsx`  
**Purpose:** Reusable photo carousel component

**Features:**
- Main image display with 4:3 aspect ratio
- Prev/Next navigation buttons (overlay)
- Thumbnail strip for quick navigation
- Photo counter (e.g., "1 / 5")
- Click thumbnail to jump to that photo
- Graceful "No photos available" fallback

**Props:** 
- `photos` (array of filenames)
- `title` (for alt text)

### Home Component (in App.jsx)
**Purpose:** Homepage listing the all properties

**Features:**
- Responsive grid layout
- Loading state while fetching
- "No listings" message when empty
- Uses ListingCard component for each property
- Header with branding
- Footer

---

## 7. Styling & Responsive Design

**File:** `frontend/src/styles.css`  
**Approach:** Vanilla CSS (no framework)

### Color Scheme
- Primary: `#2b7a78` (Teal)
- Dark accent: `#1f5753` (Dark teal)
- Call button: `#28a745` (Green)
- WhatsApp button: `#25d366` (WhatsApp green)
- Email button: `#fd7e14` (Orange)
- Background: `#f5f5f5` (Light gray)

### Key Styles
- **Header:** Linear gradient background, centered text
- **Cards:** White background, shadow, hover lift effect
- **Buttons:** Rounded corners, transition effects
- **Grid:** Auto-fill responsive grid (320px min width)
- **Detail Page:** Two-column layout (photos left, info right)
- **Responsive:** Single column on screens ≤768px

### Responsive Breakpoints
- `@media (max-width: 768px)` - Tablet/mobile adjustments
  - Detail page: Single column layout
  - Price/area boxes: Stack vertically
  - Header: Reduced font sizes

---

## 8. Configuration & Environment

## 8. Configuration & Environment

### Active Backend Configuration (worker/wrangler.toml)
```toml
name                = "balaji-realestate-api"
main                = "src/index.ts"
compatibility_date  = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]            # Cloudflare D1 (SQLite)
binding       = "DB"
database_name = "balaji-realestate"
database_id   = "<your-d1-database-id>"

[[r2_buckets]]             # Cloudflare R2 (media storage)
binding     = "MEDIA"
bucket_name = "bre-listing-detail-img"

[vars]
ALLOWED_ORIGIN = "*"

[dev]
port = 8787                # local wrangler dev port
```

### Running the Worker locally
```bash
cd worker
npm install
npm run db:migrate   # one-time: apply schema.sql to the local D1 database
npm run dev          # wrangler dev → http://localhost:8787
```
- `wrangler dev` runs local simulators for D1 and R2 — no Cloudflare account needed for dev.
- If `db:migrate` prompts for local vs remote, choose local, or run:
  `wrangler d1 execute balaji-realestate --local --file=src/db/schema.sql`

### Frontend Configuration (vite.config.js)
```javascript
export default {
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8787'   // proxied to the Worker
    }
  }
}
```

### Legacy Backend Configuration (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/realestate
    username: realestate
    password: changeme
  jpa:
    hibernate:
      ddl-auto: update  # Auto-create tables on startup
    show-sql: false

server:
  port: 8080

file:
  upload-dir: uploads
```

### Docker Compose Configuration
- **Postgres Service:**
  - Image: `postgres:15`
  - Port: `5432`
  - Environment: Database name, user, password, timezone
  - Volume: `db-data` for persistence

- **pgAdmin Service:**
  - Image: `dpage/pgadmin4`
  - Port: `8081`
  - Environment: Admin email (`admin@example.com`), password (`admin`)

### Critical JVM Flag for Backend
**Timezone Issue Workaround:**
```bash
java -Duser.timezone=Asia/Kolkata -jar target/realestate-0.0.1-SNAPSHOT.jar
```
**Why:** Windows system timezone (Asia/Calcutta) is deprecated in PostgreSQL. Setting JVM timezone to Asia/Kolkata ensures compatibility.

---

## 9. File Storage System

### Implementation
- **Service:** `FileStorageService.java`
- **Storage Location:** `uploads/` directory (relative to backend)
- **File Naming:** UUID + original file extension (e.g., `550e8400-e29b-41d4-a716-446655440000.jpg`)
- **Benefits:** Avoids filename conflicts, preserves extensions for MIME type detection

### API Endpoints
- **Upload:** `POST /api/listings/{id}/photos` (multipart/form-data)
- **Retrieve:** `GET /api/listings/media/{filename}`
- **Content-Type:** Auto-detected via `Files.probeContentType()`

### Future Enhancement
- Switch to AWS S3 for cloud storage
- Update FileStorageService to use S3 client instead of local filesystem
- Update API URLs to serve files from S3

---

## 10. What Has Been Completed

### ✅ Backend (Complete)
- [x] Spring Boot project scaffold
- [x] JPA entity (Listing) with all MVP fields
- [x] Repository (ListingRepository)
- [x] REST Controller with CRUD endpoints
- [x] File storage service (upload/retrieve)
- [x] Media serving endpoint with content-type detection
- [x] Docker Compose for local PostgreSQL + pgAdmin
- [x] Database auto-schema creation
- [x] Timezone configuration (JVM + Docker)
- [x] Maven wrapper for cross-platform builds

### ✅ Frontend (Complete)
- [x] React + Vite setup
- [x] React Router v6 with two routes (home, detail)
- [x] Home page with grid layout and listing cards
- [x] ListingCard component with contact buttons
- [x] ListingDetail page with full information
- [x] PhotoGallery component with carousel
- [x] Google Maps embed
- [x] Document download links
- [x] Responsive CSS (mobile-friendly)
- [x] API proxy configuration in Vite
- [x] Loading and error states

### ✅ Integration
- [x] Frontend → Backend API communication (axios)
- [x] Listing creation via REST API
- [x] Listing retrieval and display
- [x] Contact buttons (tel:, wa.me/, mailto:)
- [x] Test data creation

---

## 11. What Needs Implementation

### 🟡 Admin Panel (Not Started)
- [ ] Password-protected admin dashboard
- [ ] Listing creation form UI
- [ ] Listing editing interface
- [ ] Listing deletion functionality
- [ ] Photo upload interface with preview
- [ ] Document upload interface
- [ ] Listing management table/list view

### 🟡 Photo Upload & Gallery Display (Partially Complete)
- [x] Backend photo upload endpoint
- [x] Frontend photo gallery component
- [ ] Test with actual image files
- [ ] Thumbnail generation (optional)
- [ ] Image optimization (optional)

### 🟡 Testing & Validation
- [ ] End-to-end testing (create listing → view → contact)
- [ ] Photo upload testing
- [ ] Document download testing
- [ ] Mobile responsive testing
- [ ] Browser compatibility testing

### ❌ Cloud Deployment (Not Started)
- [ ] AWS S3 setup for file storage
- [ ] Cloudflare domain configuration
- [ ] Backend deployment (EC2, RDS, Elastic Beanstalk, etc.)
- [ ] Frontend deployment (Vercel, Netlify, Cloudflare Pages, etc.)
- [ ] Environment-specific configurations

### ❌ Advanced Features (Not Started)
- [ ] Search/filter by price range, area, location
- [ ] Pagination for large listing sets
- [ ] Advanced Google Maps integration (place markers)
- [ ] Image gallery lightbox
- [ ] Listing analytics (view count, inquiry count)
- [ ] Email notifications for inquiries
- [ ] SMS notifications via Twilio

---

## 12. Known Issues & Workarounds

### Issue 1: Timezone Mismatch
**Problem:** Windows system timezone (Asia/Calcutta) causes PostgreSQL connection errors  
**Root Cause:** PostgreSQL 15+ doesn't recognize deprecated timezone name  
**Solution:** 
1. Set Docker environment variable: `TZ: Asia/Kolkata` (in docker-compose.yml)
2. Set JVM flag: `java -Duser.timezone=Asia/Kolkata -jar ...`
3. In PowerShell, use `cmd /c` wrapper or quotes for proper parsing

### Issue 2: pgAdmin Email Validation
**Problem:** pgAdmin rejects `admin@local` as invalid email  
**Solution:** Changed to `admin@example.com` in docker-compose.yml environment variables

### Issue 3: Port Already In Use
**Problem:** If backend crashes, port 8080 may still be bound  
**Solution:** Kill existing process or use Docker for backend (planned)

### Issue 4: Maven Not Installed Globally
**Problem:** `mvn` command not found in PATH  
**Solution:** Maven wrapper (mvnw.cmd) included - no global installation needed

---

## 13. Development Workflow

### Starting the Application (Local Development)

#### Terminal 1: Database
```bash
cd "d:\Projects\Balaji Real Estate"
docker-compose up -d
```

#### Terminal 2: Backend
```bash
cd "d:\Projects\Balaji Real Estate\backend"
cmd /c "java -Duser.timezone=Asia/Kolkata -jar target/realestate-0.0.1-SNAPSHOT.jar"
```
*(Note: Must build first with `./mvnw.cmd clean package` if jar doesn't exist)*

#### Terminal 3: Frontend
```bash
cd "d:\Projects\Balaji Real Estate\frontend"
npm install  # First time only
npm run dev
```

Then open browser:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api/listings
- **pgAdmin:** http://localhost:8081 (admin@example.com / admin)

### Building for Production

#### Backend JAR Build
```bash
cd backend
./mvnw.cmd clean package -DskipTests
# Output: target/realestate-0.0.1-SNAPSHOT.jar
```

#### Frontend Build
```bash
cd frontend
npm run build
# Output: dist/ (static files for deployment)
```

---

## 14. Testing Sample Data

### Create Listing via API
```bash
# Using PowerShell
Invoke-WebRequest -Uri 'http://localhost:8080/api/listings' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -InFile 'test-listing.json' `
  -UseBasicParsing
```

**Sample test-listing.json:**
```json
{
  "title": "Premium Plot in Sunflower Layout",
  "address": "Sunflower Layout, Coimbatore, TN",
  "price": "2500000",
  "area": "2500 sq.ft",
  "description": "Beautiful plot in prime location with all modern facilities nearby.",
  "phone": "+91 98765 43210",
  "email": "balaji@realestate.com",
  "latitude": 11.0226,
  "longitude": 76.9558,
  "status": "available"
}
```

### View Listings
- **API:** `GET http://localhost:8080/api/listings`
- **Frontend:** `http://localhost:3000`

---

## 15. Future Roadmap

### Phase 1: Admin Panel (Next Priority)
- Build password-protected admin dashboard
- Implement listing CRUD UI
- Add photo/document upload form
- Create listing management interface

### Phase 2: Production Deployment
- Migrate database to AWS RDS (PostgreSQL)
- Deploy backend to AWS Elastic Beanstalk or EC2
- Deploy frontend to Vercel or Netlify
- Setup custom domain (balajirealestatecovai.com)
- Configure S3 for file storage

### Phase 3: Enhanced Features
- Search and filter functionality
- Advanced map integration
- Image optimization and CDN
- Inquiry form with email notifications
- Analytics dashboard

### Phase 4: Mobile App (Long-term)
- Consider React Native or Flutter for native mobile app
- Push notifications for new listings

---

## 16. Important Contacts & Credentials

### Application Credentials
- **Backend:** `http://localhost:8080`
- **Frontend:** `http://localhost:3000`
- **pgAdmin:** `http://localhost:8081`
  - Email: `admin@example.com`
  - Password: `admin`

### Database Credentials
- **Host:** `localhost:5432`
- **Database:** `realestate`
- **Username:** `realestate`
- **Password:** `changeme`

### Cloud Domains (When Ready)
- **Primary Domain:** `balajirealestatecovai.com` (Cloudflare)
- **API Domain:** `api.balajirealestatecovai.com` (or same domain)

---

## 17. Common Commands Reference

### Maven
```bash
./mvnw.cmd clean package          # Build JAR
./mvnw.cmd clean package -DskipTests
./mvnw.cmd spring-boot:run        # Run directly (dev)
```

### npm
```bash
npm install                        # Install dependencies
npm run dev                        # Start dev server
npm run build                      # Production build
npm run preview                    # Preview production build
```

### Docker
```bash
docker-compose up -d               # Start all services
docker-compose down                # Stop all services
docker-compose down -v             # Stop and remove volumes (full reset)
docker logs balajirealestate-db-1  # View database logs
```

### Git
```bash
git add .
git commit -m "message"
git push
```

---

## 18. Useful Resources

### Documentation Links
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

### Google Maps Embedding
- Current implementation: Static embed URL with coordinates
- Future: Interactive Google Maps JavaScript API for better UX

---

## 19. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│              (http://localhost:3000)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ React App (App.jsx, ListingCard, ListingDetail)     │   │
│  │ ├─ Home Route: Grid of listings                     │   │
│  │ └─ Detail Route: Full listing with photos/map       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────────────────┘
                 │
        Axios HTTP Requests
        (Vite proxy: /api → localhost:8080)
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│           Spring Boot Backend (localhost:8080)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ListingController                                    │   │
│  │ ├─ GET    /api/listings                             │   │
│  │ ├─ GET    /api/listings/{id}                        │   │
│  │ ├─ POST   /api/listings (create)                    │   │
│  │ ├─ POST   /api/listings/{id}/photos (upload)        │   │
│  │ └─ GET    /api/listings/media/{filename} (serve)    │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│          ┌──────────────┼──────────────┐                    │
│          │              │              │                    │
│          ▼              ▼              ▼                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Listing      │ │ Photo        │ │ File Storage │       │
│  │ Repository   │ │ Gallery Comp │ │ Service      │       │
│  │              │ │              │ │ (uploads/)   │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
└──────────────────────────────────────────┬──────────────────┘
                                           │
                    JPA/Hibernate + JDBC
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Docker)                    │
│              (localhost:5432)                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Database: realestate                                 │   │
│  │ ├─ Table: listing                                    │   │
│  │ ├─ Table: listing_photos (ElementCollection)         │   │
│  │ └─ Table: listing_docs (ElementCollection)           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              pgAdmin UI (Docker)                             │
│              (localhost:8081)                               │
│     Database management & SQL execution interface            │
└──────────────────────────────────────────────────────────────┘
```

---

## 20. Questions for Future Development

1. **Admin Authentication:** Should admin panel use simple password, OAuth, or JWT tokens?
2. **File Storage:** Keep local storage or migrate to AWS S3 immediately?
3. **Deployment:** AWS, DigitalOcean, Heroku, or other platform?
4. **Notifications:** Should inquiries trigger email/SMS notifications?
5. **Search:** What filters are most important (price range, area, location)?
6. **Multi-language:** Support multiple languages?
7. **Analytics:** Track listing views, inquiry sources, conversion metrics?

---

**Last Updated:** 2026-06-07  
**Status:** Frontend complete (Option A), Backend complete, Admin panel pending (Option B)  
**Next Step:** Build admin panel for listing CRUD operations

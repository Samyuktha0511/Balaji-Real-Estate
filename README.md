Balaji Real Estate - Portfolio & Listings

Overview
- React frontend + Spring Boot backend + PostgreSQL (Docker)
- Purpose: public listings for plot resale broker with photo/docs and contact shortcuts.

Quick start (recommended)
1. Ensure Docker & Docker Compose are installed.
2. Start Postgres:

```bash
docker compose up -d
```

3. Backend: build & run (from `backend`):

```bash
# from repo root
cd backend
mvn clean package
java -jar target/*.jar
```

4. Frontend: install and run (from `frontend`):

```bash
cd frontend
npm install
npm run dev
```

Notes
- App expects Postgres at the address configured in `docker-compose.yml`.
- Media uploads are stored in `uploads/` for now and can be switched to S3 later.

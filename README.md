# Dil Bahar Aromas — Backend API

Node + Express + MongoDB (Mongoose) REST API powering the content & commerce platform.

## Stack
- Express 4 · Mongoose 8 · JWT auth · Joi validation · Helmet · Winston · Compression · Rate limiting

## Setup
```bash
cp .env.example .env        # then edit values (MONGODB_URI, JWT_SECRET, ADMIN_*)
npm install
npm run seed                # creates admin user + categories + sample blogs + city pages
npm run dev                 # starts API with --watch on http://localhost:5000
```

Requires a running MongoDB (local `mongod` or a MongoDB Atlas URI in `MONGODB_URI`).

## API surface (Phase 1)
| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | auth |
| GET | `/api/blog` | public (drafts for staff) |
| GET | `/api/blog/:slug` | public |
| POST/PUT/DELETE | `/api/blog/...` | admin/editor |
| GET | `/api/categories` / `/api/categories/:slug` | public |
| POST/PUT/DELETE | `/api/categories/...` | admin/editor |
| GET | `/api/city-pages` / `/api/city-pages/:slug` | public (template-resolved) |
| POST/PUT/DELETE | `/api/city-pages/...` | admin/editor |
| POST | `/api/contact` | public |
| GET/PATCH | `/api/contact` | admin/editor |

## Architecture
- `src/models` — Mongoose schemas (User, Category, BlogPost, CityPage, ContactMessage) with a shared `SeoSchema`.
- `src/controllers` — request handlers.
- `src/routes` — Express routers mounted under `/api`.
- `src/middleware` — auth (JWT), validation (Joi), error handling.
- `src/utils/cityTemplate.js` — template + override engine for city SEO pages.
- `src/utils/seed.js` — idempotent seed script.

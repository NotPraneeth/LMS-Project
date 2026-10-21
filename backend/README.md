# LMS Backend (FastAPI + PostgreSQL)

Backend for the student module of the TeluguAI.com / GenAI99.com LMS.
Stack: **Python 3.12+ · FastAPI · PostgreSQL 16 (Docker) · SQLAlchemy 2.0 (async) · Alembic**.

## One-time setup

```powershell
# from this directory (backend/)
docker compose up -d          # starts lms-postgres on host port 5433
uv sync                       # creates .venv and installs dependencies
copy .env.example .env        # (already present in this repo — skip if .env exists)

uv run alembic upgrade head   # creates all 43 tables
uv run seed.py --reset        # seeds both brands + demo users (password: admin123)
```

> **Port note:** Postgres is mapped to host port **5433** because 5432 is
> typically taken by another local container. If 5433 is also busy, change the
> mapping in `docker-compose.yml` and `DATABASE_URL` in `.env` together.

## Running

```powershell
# terminal 1 (already running after setup, restart with:)
uv run uvicorn app.main:app --port 4000

# terminal 2 — frontend (see ../frontend)
npm run dev
```

Open **http://localhost:3000** and use the 1-click demo accounts.
All demo users share the password **`admin123`**:

| Brand     | Student login             | Notes                                    |
| --------- | ------------------------- | ---------------------------------------- |
| TeluguAI  | `student@teluguai.com`    | Partial fees, class today, cleaning data |
| GenAI99   | `student@genai99.com`     | Paid in full + issued certificate        |

Other seeded roles (per brand): `admin@`, `counselor@`, `trainer@` — the
super admin is `superadmin@lakes.dev` (has both brands). These portals are
still static UI (student module only, per plan).

## Useful commands

```powershell
uv run seed.py              # seed only if the DB is empty
uv run seed.py --reset      # wipe tenant data and reseed (idempotent demo reset)
uv run alembic revision --autogenerate -m "..."   # after model changes
uv run alembic upgrade head
```

API docs: http://127.0.0.1:4000/docs (Swagger UI).

## Architecture

```
app/
  core/       config (.env), database (async engine), security (JWT/bcrypt/cookies), deps
  models/     43 SQLAlchemy models across domain files
  schemas/    Pydantic response models — camelCase aliases matching studentApi.ts
  routers/
    auth.py     /api/health, /api/auth/login|logout|me  (HttpOnly cookie lms_session)
    student.py  13 endpoints fulfilling frontend/src/lib/studentApi.ts
alembic/       async migrations (initial: all tables, incl. btree_gist extension)
seed.py        demo data for both brands
```

### Auth & multi-brand model

- Login issues a **JWT in an HttpOnly cookie** (`lms_session`) and records the
  session row in `user_sessions` (token hash). Logout revokes the row.
- Every student request carries the **`X-Brand-Id` header**, validated against
  `user_brand_access` — cross-brand access returns `403`.
- Errors are always `{"error": "..."}` (the frontend reads `body.error`).
- The Next.js dev server proxies `/api/*` to this backend (same-origin, keeps
  the cookie same-site) — see `../frontend/next.config.ts`.

### Known environment quirks (documented, worked around)

- Host port 5432 was occupied by an unrelated container → we use **5433**.
- On this Windows machine, `[::1]:4000` and `[::]:4000` are held by
  `wslrelay` / `com.docker.backend`, and `localhost` resolves to `::1` first.
  Always address the backend as **`http://127.0.0.1:4000`** from scripts; the
  browser goes through the Next.js same-origin proxy instead.

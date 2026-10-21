# Student Module Implementation Plan
**Project:** Shared Multi-Brand LMS & Admissions CRM (`TeluguAI.com` & `GenAI99.com`)
**Scope:** Student Learning Portal (ST-01 – ST-18 subset) — remove all dummy data, build the FastAPI backend, PostgreSQL + SQLAlchemy integration, real JWT auth
**Target:** PostgreSQL 16 (Docker Compose) · Python 3.12+ · FastAPI · SQLAlchemy 2.0 · Alembic
**Doc Code:** `/studentmoduleimplementation.md`

---

## 1. Executive Summary

The Student Portal frontend is **already wired** to a designed REST API contract (`frontend/src/lib/studentApi.ts` → `http://localhost:4000/api/student/*`, 11 read + 3 mutation endpoints, consumed through the `useStudentResource` hook in 9 screens). **No backend exists anywhere in the workspace** — student screens currently render the offline `ApiError` banner.

This document specifies the implementation of that missing backend and the frontend changes required to make every student screen read live PostgreSQL data:

1. **Backend scaffold** — Python + FastAPI + SQLAlchemy 2.0 (typed) + Alembic, served by Uvicorn on port **4000** (the frontend's existing default).
2. **Database** — PostgreSQL 16 via `docker-compose.yml`; **all 42 tables** from `02_entity_extraction.md` / `05_data_dictionary.md` modeled in one initial migration, plus one documented addition (`lesson_progress`).
3. **Real JWT auth** — replaces the fake login (`detectRoleAndBrand` email-string sniffing, unchecked password) with bcrypt credential verification, HttpOnly cookie sessions backed by `user_sessions`, and brand membership checks from `user_brand_access`.
4. **Seed data** — the same demo content currently hardcoded in components is seeded into PostgreSQL, so screens look identical but everything is served live.
5. **Frontend cleanup** — remove all `?student=` identity plumbing, send `X-Brand-Id` headers, rewrite `CommonLogin.tsx` and `page.tsx` session handling to consume the real API.

Out of scope (later phases): Admin / Counselor / Trainer / Super Admin portal API integration, Razorpay/Stripe/WhatsApp gateways, S3 uploads, PDF generation, background workers.

---

## 2. Current State Audit

### 2.1 What is already real
| Component | File | Status |
|---|---|---|
| API contract & fetch plumbing | `frontend/src/lib/studentApi.ts` | ✅ Complete typed client (11 GET + 3 POST); broken identity model (see §2.2) |
| Data-fetch hook | `frontend/src/lib/useStudentResource.ts` | ✅ Complete (keyed fetch, reload, mutate, loading/error) |
| Async state primitives | `frontend/src/components/student/StudentAsyncState.tsx` | ✅ Loading / error / retry UI |
| All 9 student screens | `StudentDashboard, StudentCurriculum, StudentLiveClasses, StudentMaterials, StudentAssignments, StudentQuizzes, StudentAttendance, StudentFees, StudentCertificates` | ✅ Wired to `studentApi`; render server data only |

### 2.2 What is fake / hardcoded (to be removed)
| File | Dummy behaviour |
|---|---|
| `frontend/src/components/shared/CommonLogin.tsx` | `DEMO_ACCOUNTS` array; role & brand **detected from the email string** (`detectRoleAndBrand`); password never validated; hardcoded autofill `admin123`; fake 350 ms "routing" delay |
| `frontend/src/app/page.tsx` | `Switch Brand` fabricates a new session client-side (email string rewrite); session exists only in `useState` |
| `frontend/src/lib/studentApi.ts` | Identity = `?student=<email>` query param (no authentication, spoofable); `?brand=` query param |
| `frontend/src/components/student/*` | Pass `studentEmail` prop through purely to build the insecure query string |
| (Student-facing dummy **content**) | previously hardcoded in the above components before the API wiring; equivalent content must now live in the **database seed** |

Non-student portals (admin/counselor/trainer/superadmin still contain `INITIAL_*` hardcoded arrays) are explicitly **out of scope** for this phase.

---

## 3. Architecture & Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend framework | **FastAPI + Uvicorn** (port 4000) | User decision; matches `lms_system_architecture.md` FastAPI option |
| ORM / migrations | **SQLAlchemy 2.0** (typed `Mapped[]`/`mapped_column`, async via `asyncpg`) + **Alembic** | User decision (chosen over Prisma Client Python) |
| Database | **PostgreSQL 16** in `backend/docker-compose.yml` | User decision (Docker Compose); UTF-8 default; `pgcrypto` not required (UUIDs via `gen_random_uuid()` which needs PG13+ only) |
| Auth | **JWT in HttpOnly SameSite=Lax cookie** + `user_sessions` row (SHA-256 token hash) | `04_architecture_overview.md` §security; refresh-token **rotation deferred** but sessions rows already stored for it |
| Password hashing | `bcrypt` (passlib-compatible salted hashes) | `users.password_hash` contract |
| Identity transport | JWT claims carry `user_id/email/name`; **no student email in URL**; brand via `X-Brand-Id` header validated against `user_brand_access` | Removes spoofable query params |
| Response casing | Pydantic v2 `alias_generator=to_camel`, `populate_by_name=True` | Responses exactly match existing frontend types (`courseTitle`, `passPercentage`, …) |
| Repo layout | Monorepo: `backend/` (new) + `frontend/` (existing) | `lms_system_architecture.md` §8 Phase 1 |
| Row-Level Security | **Deferred.** App-layer brand scoping (every student query filters `brand_id` resolved from the validated `X-Brand-Id`) | RLS requires per-connection `SET LOCAL` middleware; unnecessary for a single trusted server connection; migration path documented in `04_architecture_overview.md` §2.2 |

### 3.1 Backend folder structure (Python-ified version of `lms_system_architecture.md` §5)

```text
backend/
├── docker-compose.yml        # postgres:16-alpine, healthcheck, volume
├── .env / .env.example       # DATABASE_URL, JWT_SECRET, CORS_ORIGINS
├── pyproject.toml            # deps pinned by uv
├── alembic.ini
├── alembic/                  # env.py + versions/0001_initial_schema.py
├── seed.py                   # demo data (idempotent: truncate-and-reseed flag)
└── app/
    ├── main.py               # FastAPI app, CORS, router registration
    ├── core/
    │   ├── config.py         # pydantic-settings
    │   ├── database.py       # async engine, sessionmaker, get_db dependency
    │   ├── security.py       # bcrypt hash/verify, JWT encode/decode, cookie helpers
    │   └── deps.py           # get_current_user, get_brand_context (+ get_student_enrolment)
    ├── models/               # SQLAlchemy models, one file per domain from 02_entity_extraction.md
    │   ├── base.py
    │   ├── identity.py       # brands, users, user_brand_access, user_roles, permissions,
    │   │                     # role_permissions, staff_profiles, student_profiles, user_sessions
    │   ├── curriculum.py     # courses, course_modules, course_lessons, learning_materials
    │   ├── academics.py      # batches, class_sessions, class_attendance
    │   ├── crm.py            # leads, lead_stage_history, lead_notes
    │   ├── enrolment.py      # enrolments, enrolment_status_history
    │   ├── finance.py        # fee_plans, fee_plan_instalments, invoices, payments,
    │   │                     # payment_transactions, payment_adjustments
    │   ├── assessments.py    # assignments, assignment_submissions, quizzes, quiz_questions,
    │   │                     # quiz_attempts, quiz_attempt_answers
    │   ├── progress.py       # course_progress, lesson_progress*, certificate_templates, certificates
    │   ├── comms.py          # announcements, whatsapp_templates, whatsapp_messages
    │   └── ops.py            # system_settings, audit_logs, webhook_events
    ├── schemas/              # Pydantic v2 DTOs (camelCase aliases) mirroring studentApi.ts types
    │   ├── auth.py
    │   └── student.py
    └── routers/
        ├── auth.py           # POST /api/auth/login, /logout, GET /api/auth/me, GET /api/health
        └── student.py        # /api/student/* (fulfils studentApi.ts contract)
```
\* **`lesson_progress` is an intentional schema addition** — the 42-table registry has no per-lesson completion store, but the curriculum UI requires `completed / in_progress / locked` per lesson. Shape: `lesson_progress(lesson_progress_id bigint identity PK, brand_id FK, enrolment_id FK → enrolments, lesson_id FK → course_lessons, status 'not_started'|'in_progress'|'completed', completed_at timestamptz NULL, created_at, updated_at; UNIQUE(enrolment_id, lesson_id))`.

---

## 4. Data Model

Modeled 1:1 from `02_entity_extraction.md` (ownership: column intent) and `05_data_dictionary.md` (authoritative columns, indexes, constraints). Conventions enforced by `04_architecture_overview.md` §3:

- PKs: `bigint` identity (SQLAlchemy `Identity(always=True)`); public UUIDs `server_default=text("gen_random_uuid()")`.
- Money: `Numeric(12,2)`; timestamps `DateTime(timezone=True)` server_default `now()`; phones stored normalized (seed uses E.164).
- `CHECK` constraints via `CheckConstraint(...)` mirroring the doc enums.
- Composite tenancy FKs where docs specify them (e.g. `class_sessions (brand_id, batch_id) → batches (brand_id, batch_id)`).
- **Explicit deviations** (documented DE-1…DE-3 in §11): `citext` emails → lowercase-normalized `String` + unique indexes; `inet` → `String`; partial indexes omitted in MVP;_partitioned `audit_logs` rendered as a plain table (partitioning deferred).

`app/models/__init__.py` re-exports every model so Alembic autogenerate sees full metadata.

---

## 5. Authentication & Brand-Scoping Design

### 5.1 Endpoints
| Method | Path | Body / Headers | Behaviour |
|---|---|---|---|
| `POST` | `/api/auth/login` | `{ email, password, brand? }` | bcrypt verify → load `user_roles`/`user_brand_access` for the user → resolve `brand` (from body, else the single brand the user can access, else 403 `no_brand_access`) → insert `user_sessions` (SHA-256 of the JWT, client IP, UA, expires_at = now + 7d) → set HttpOnly cookie `lms_session` → return `{ user { email, name, role, brand { id, slug, name } }, accessibleBrands[] }` (401 on bad credentials / inactive user) |
| `POST` | `/api/auth/logout` | cookie | delete `user_sessions` row by token hash, clear cookie |
| `GET` | `/api/auth/me` | cookie | decode JWT → user + active brand info + accessible brands (used on page load) |
| `GET` | `/api/health` | – | `{ status: 'ok' }` (already consumed by frontend) |

### 5.2 Dependencies (`app/core/deps.py`)
- `get_current_user` — reads cookie, `jwt.decode` (HS256, `JWT_SECRET`), loads `users` row; 401 unless `status='active'`.
- `get_brand_context` — reads `X-Brand-Id` header, loads `brands` row by slug, 404 unknown slug, 403 if `user_brand_access` lacks a row for `(user, brand)` (super_admin bypass not needed in student phase).
- `get_student_enrolment` — loads the student's `enrolments` row (`student_id, brand_id, status='active'`) with course + batch; 404 if none (drives the "offline banner" → proper data states).

### 5.3 Frontend session flow (replacement for the fake login)
1. `CommonLogin.tsx` — form posts real email+password to `/api/auth/login`; demo buttons only **prefill** email/password and submit through the same endpoint; error banner on 401/403. `detectRoleAndBrand`, local role parsing, and the fabricated session object are deleted.
2. `page.tsx` — stores the login response `{ user, accessibleBrands }`; brand switcher (`onSwitchBrand`) is limited to `accessibleBrands` and triggers `GET /api/auth/me` revalidation rather than fabricating sessions; logout calls `/api/auth/logout` then clears state.
3. `studentApi.ts` — deletes `studentQs` (`?student=`); every student call sends `X-Brand-Id: <activeBrand>` and `credentials: 'include'`; API function signatures drop the `student` parameter (components stop passing `studentEmail` into fetchers; the prop remains only where displayed, e.g. header).

---

## 6. Student API Contract (fulfils `frontend/src/lib/studentApi.ts`)

Error model for all endpoints: `401 {"error": "..."}` unauthenticated · 403 brand/role not permitted · 404 no enrolment/resource · 422 validation. Every list endpoint is scoped by `(user_id, brand_id)` from the dependencies. Response field names match the frontend types **exactly** (camelCase; ids are strings of DB ids/uuids).

| `studentApi` method | HTTP | Response body | Server logic (tables) |
|---|---|---|---|
| `health()` | GET `/api/health` | `{status}` | – |
| `getProfile()` | GET `/api/student/profile` | `StudentProfile` (id, email, name, brandId, phone, courseTitle, batchName, instructor) | `users` + `student_profiles` + `enrolments`→`courses`,`batches` (+batch trainer name) |
| `getDashboard()` | GET `/api/student/dashboard` | `StudentDashboard` | `enrolments`+`courses`+`batches`; KPIs from `course_progress` (progress %, attendanceRate, assignment counts, quizAvg, feeStatus); `nextSession` = earliest `class_sessions` where `scheduled_start >= now AND status IN ('upcoming','live')`; `completed/totalSessions` counts; latest 3 `announcements` for the brand/cohort |
| `getCurriculum()` | GET `/api/student/curriculum` | `{modules[]}` (module + ordered lessons + status) | `course_modules` + `course_lessons` ordered; lesson status = `lesson_progress` for this enrolment, else `not_started`. Status derivation sent as completed/in_progress/locked: completed ⇒ row completed; else next lesson after the last completed ⇒ `in_progress`; lessons beyond ⇒ `locked` (matching existing semantics) |
| `completeLesson(lessonId)` | POST `/api/student/curriculum/lessons/{lessonId}/complete` | `{modules[]}` | Upsert `lesson_progress(status='completed')`; recompute `course_progress` (lesson-based progress %); return refreshed curriculum |
| `getLiveClasses()` | GET `/api/student/live-classes` | `{sessions[]}` | `class_sessions` for the batch (upcoming & past); join `class_attendance` for this student (attendanceStatus); `isToday` computed from `scheduled_start` |
| `getMaterials()` | GET `/api/student/materials` | `{materials[]}` | `learning_materials` where batch/course matches; `updatedDate` formatted ISO date, `size` from `file_size_text`, `url` from `storage_key` |
| `getAttendance()` | GET `/api/student/attendance` | `AttendanceSummary` | `class_attendance` × `class_sessions` for the student; counts (present/late/absent/total), rate = present+late over held |
| `getAssignments()` | GET `/api/student/assignments` | `{assignments[]}` | `assignments` for batch ⨝ this student's latest `assignment_submissions` (submittedRepoUrl, notes, score, feedback, status) |
| `submitAssignment(id)` | POST `/api/student/assignments/{id}/submit` | `{assignment}` | Validate repo URL; upsert `assignment_submissions(status='pending', submitted_at=now())`; recompute nothing else |
| `getQuizzes()` | GET `/api/student/quizzes` | `{quizzes[]}` | `quizzes`(active) for batch + question count + my best attempt (`quiz_attempts.score_percent`) — **no questions/answers** in list |
| `submitQuizAttempt(quizId, answers)` | POST `/api/student/quizzes/{id}/attempts` | `{result}` | Load active quiz + questions; grades **server-side** against `correct_option_index`; inserts `quiz_attempts` + `quiz_attempt_answers` (frozen answers, `is_correct`); returns `QuizAttemptResult` incl. per-question review (selected vs correct); `quiz_average` recomputed into `course_progress`. Questions with `correct_option_index` are **never** exposed before submit |
| `getFees()` | GET `/api/student/fees` | `FeeAccount` | `invoices` for enrolment → summary (totalCourseFee=billed, discountApplied from fee plan delta, netPayable, amountPaid, balanceRemaining, status PAID_IN_FULL/PARTIAL_DUE/OVERDUE, plan name from `fee_plans`); receipts from `payments` (+`payment_transactions.gateway_payment_id`) |
| `getCertificate()` | GET `/api/student/certificates` | `{certificate}` | Existing `certificates` row → `Issued & Verified` (name/course/date/instructor/skills from `skills_certified`); else benchmark checklist from `course_progress` (attendance ≥80, assignments ≥80%, quizAvg ≥75, `tuition_paid_in_full`) → `In Progress` with earned status flags |

Supporting aggregate: `course_progress` recompute helper (`progress/derive.py`) invoked after `completeLesson`, quiz submit, grading, and payment events — mirroring `04_architecture_overview.md` Decision 3 (hybrid summary table; SQL view deferred).

---

## 7. Seed Plan (`seed.py`)

Idempotent (`--reset` truncates tenant data first). Password for **all seeded demo users**: `admin123` (bcrypt-hashed at seed time; matches the login-screen autofill). Content mirrors the previously hardcoded demo values so screens look unchanged:

- **Brands**: `teluguai` (INR, emerald), `genai99` (USD, sky).
- **Users**: 10 demo accounts (5 roles × 2 brands) — emails exactly as today (`superadmin@teluguai.com`, `student@genai99.com`, …) with `user_brand_access` + `user_roles` (students only ever see their own brand).
- **Catalogue**: 4 courses (FullStack Python & Vernacular AI 16 wk ₹24,999 · GenAI Engineering 12 wk ₹19,999 · Prompt Engineering Express 6 wk ₹9,999 · Enterprise GenAI 12 wk $499) with modules + lessons (incl. `code_snippet` Telugu strings) + `learning_materials`.
- **Batches**: 2 per brand w/ trainers, schedules, meeting URLs; `enrolments` for both student users + `course_progress` (TeluguAI partial fees / GenAI99 paid-in-full), `lesson_progress` (module 1 completed, module 2 in progress).
- **Classes**: past sessions (completed + attendance present/late/absent, recordings) + upcoming sessions today.
- **Assessments**: assignments (due/graded/pending + submissions for both students, one graded with feedback), quizzes (active; 3-4 questions w/ correct indices) + past attempts.
- **Finance**: fee plans, invoices (Paid / Partial), payments + receipt numbers (`REC-TAI-2026-081` style), `payment_transactions`.
- **Credentials**: `certificate_templates` + 1 issued certificate (GenAI99 student benchmarks complete) + announcements (2 per brand).

---

## 8. Frontend Changes (Student Module Only)

| File | Change |
|---|---|
| `src/lib/studentApi.ts` | Remove `studentQs` + `student` params; add `X-Brand-Id` header + `credentials: 'include'`; keep all types/endpoints otherwise identical |
| `src/components/shared/CommonLogin.tsx` | Real login POST; demo buttons prefill-and-submit; delete `detectRoleAndBrand` / hardcoded session fabrications; loading/error states; on success `onLoginSuccess({user, accessibleBrands})` |
| `src/app/page.tsx` | Session type = login response; brand switch restricted to `accessibleBrands` (no email-rewrite); logout via API |
| `src/components/student/StudentLayout.tsx` | Thread `user` object instead of fabricated `userEmail`; brand switcher; unchanged tabs |
| `src/components/student/*.tsx` (9 screens) | Drop `studentEmail` fetcher args; keep existing `useStudentResource` patterns, loading/error/retry |
| `frontend/.env.example` / `.env.local` | `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` (unchanged) |

**Constraint from `frontend/AGENTS.md`:** Next.js 16.4.0 has breaking changes vs. known conventions — consult `frontend/node_modules/next/dist/docs/` before touching app-router files (`page.tsx`, `layout.tsx`); keep edits client-component-scoped (all changes are in `'use client'` files).

---

## 9. Implementation Order

| # | Task | Files |
|---|---|---|
| 1 | Backend scaffold: compose, env, pyproject (`uv`), settings, DB session, main.py + health/CORS | `backend/docker-compose.yml`, `.env*`, `app/core/*`, `app/main.py` |
| 2 | All 42 models + `lesson_progress`; alembic init + initial migration; migrate up | `app/models/*`, `alembic/` |
| 3 | Seed script (§7); run against migrated DB | `seed.py` |
| 4 | Auth core (security.py, deps.py) + auth router; verify cookie flow with curl | `app/core/security.py`, `deps.py`, `routers/auth.py`, `schemas/auth.py` |
| 5 | Student schemas + student router (§6); endpoint-by-endpoint against curl + the real DB | `routers/student.py`, `schemas/student.py` |
| 6 | Frontend: studentApi header/auth rework; CommonLogin rewrite; page.tsx session; components prop cleanup | §8 |
| 7 | End-to-end verification (§10) in both brands; fix discrepancies | – |

## 10. Acceptance Criteria

1. `docker compose up -d` → healthy Postgres; `alembic upgrade head` succeeds; `uv run seed.py` seeds both brands.
2. `uvicorn app.main:app --port 4000` + `npm run dev` → login with any seeded demo account works; wrong password → visible 401 error; no fake role/brand detection.
3. All 9 student screens render live data for `student@teluguai.com` (partial fees, upcoming class, module 2 in progress) and `student@genai99.com` (USD, paid-in-full, certificate available).
4. Mark-lesson-complete, assignment submit, and quiz attempt all persist — data survives frontend reload and DB restart.
5. Brand isolation: a TeluguAI student calling with `X-Brand-Id: genai99` → 403; unauthenticated student calls → 401 (screens show their error/retry state, not old dummy data).
6. **Zero** `student=`/`?brand=` identity strings in the URL; student components contain no hardcoded entity arrays; grep for demo names (`Sai Kiran`, `₹ 24,999`, `INV-TA-2026-081`, …) over `frontend/src` returns only UI-independent references (none prefetched data).

## 11. Documented Deviations (DE-1…DE-4)
- **DE-1** `citext` emails → `String` + lowercase normalization at input boundaries (citext extension avoided for MVP; index behavior identical after normalization).
- **DE-2** `audit_logs.ip_address inet` → `String(45)`; monthly partitioning deferred.
- **DE-3** Partial indexes (`idx_invoices_brand_due`, attendance partials) omitted in the initial migration.
- **DE-4** `lesson_progress` table added (§3.1) — required for per-lesson curriculum state.

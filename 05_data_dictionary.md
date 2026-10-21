# PostgreSQL Data Dictionary & Schema Specification
**Project:** Shared Multi-Brand LMS & Admissions CRM (`TeluguAI.com` & `GenAI99.com`)  
**Scope:** Exhaustive Column Specifications, Primary Keys, Foreign Keys, Constraints, Indexes, PII, and Soft-Delete Policies  
**Target Engine:** PostgreSQL 16+  
**Document Code:** `/database/05_data_dictionary.md`

---

## Domain 01: Core Identity, Multi-Tenancy & RBAC

### 1. `brands`
- **Purpose:** Multi-tenant brand definition (`TeluguAI` vs `GenAI99`).
- **Soft-Delete Policy:** Prohibited. (Tenants can only be set to `status = 'maintenance'`).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `brand_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Internal surrogate primary key |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Non-enumerable public UUID |
| `slug` | `varchar(50)` | `NOT NULL` | None | None | `UNIQUE`, CHECK `IN ('teluguai', 'genai99')` | URL brand identifier slug |
| `name` | `varchar(100)` | `NOT NULL` | None | None | None | Display brand name (`TeluguAI`, `GenAI99`) |
| `domain` | `varchar(255)` | `NOT NULL` | None | None | `UNIQUE` | Fully qualified domain URL |
| `logo_text` | `varchar(50)` | `NOT NULL` | None | None | None | Abbreviated logo mark (`TA`, `G99`) |
| `tagline` | `text` | `NOT NULL` | None | None | None | Marketing slogan / mission statement |
| `support_email` | `citext` | `NOT NULL` | None | None | None | Tenant customer service email |
| `primary_color` | `varchar(30)` | `NOT NULL` | `'#059669'` | None | None | Tailwind / Hex primary theme color |
| `accent_color` | `varchar(30)` | `NOT NULL` | `'#0284c7'` | None | None | Tailwind / Hex accent color |
| `status` | `varchar(30)` | `NOT NULL` | `'active'` | None | CHECK `IN ('active', 'maintenance')` | Operational tenant status |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp in UTC |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Last update timestamp in UTC |

- **Indexes:**
  - `idx_brands_slug` on `(slug)` (Unique B-tree)
  - `idx_brands_domain` on `(domain)` (Unique B-tree)

---

### 2. `users`
- **Purpose:** Global user authentication credentials.
- **Soft-Delete Policy:** Prohibited. Deactivation via `status = 'inactive' | 'suspended'`.
- **PII:** High (`email`, `phone`, `full_name`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `user_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Global user primary key |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Exposed public identity |
| `email` | `citext` | `NOT NULL` | None | None | `UNIQUE` | Case-insensitive login email |
| `phone` | `varchar(20)` | `NULL` | None | None | E.164 format | Primary mobile phone |
| `password_hash` | `varchar(255)` | `NOT NULL` | None | None | Argon2id hash | Secure password hash |
| `full_name` | `varchar(150)` | `NOT NULL` | None | None | None | Legal / display user name |
| `avatar_bg` | `varchar(30)` | `NULL` | `'bg-slate-700'` | None | None | Fallback UI avatar background color |
| `is_super_admin`| `boolean` | `NOT NULL` | `false` | None | None | Platform-wide administrative superuser |
| `status` | `varchar(30)` | `NOT NULL` | `'active'` | None | CHECK `IN ('active', 'inactive', 'suspended')` | Global account status |
| `last_active_at`| `timestamptz` | `NULL` | None | None | None | Last login or API activity timestamp |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Registration timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Account update timestamp |

- **Indexes:**
  - `idx_users_email` on `(email)` (Unique B-tree)
  - `idx_users_phone` on `(phone)` (B-tree) WHERE phone IS NOT NULL

---

### 3. `user_brand_access`
- **Purpose:** Tenant membership junction determining which brands a user can enter.
- **Soft-Delete Policy:** Hard delete on membership revocation.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `user_id` | `bigint` | `NOT NULL` | None | `PK`, `FK` | `-> users(user_id) ON DELETE CASCADE` | User account |
| `brand_id` | `bigint` | `NOT NULL` | None | `PK`, `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand tenant |
| `granted_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Access grant timestamp |

---

### 4. `user_roles`
- **Purpose:** Brand-scoped role assignments. Enables one user to have distinct roles per brand.
- **Soft-Delete Policy:** Hard delete on role revocation.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `user_role_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Surrogate role PK |
| `user_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE CASCADE` | Linked user |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Linked brand tenant |
| `role` | `varchar(30)` | `NOT NULL` | None | None | CHECK `IN ('super_admin', 'admin', 'counselor', 'trainer', 'student')` | Functional platform role |
| `department` | `varchar(100)` | `NULL` | None | None | None | Staff branch or department name |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Role assignment timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(user_id, brand_id, role)`
  - `idx_user_roles_brand_role` on `(brand_id, role)`

---

### 5. `permissions`
- **Purpose:** Master catalog of granular capabilities.
- **Soft-Delete Policy:** Prohibited.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `permission_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Permission PK |
| `code` | `varchar(100)` | `NOT NULL` | None | None | `UNIQUE` | Programmatic capability key |
| `module` | `varchar(100)` | `NOT NULL` | None | None | None | Functional group |
| `action_name` | `varchar(150)` | `NOT NULL` | None | None | None | Display action name |
| `description` | `text` | `NOT NULL` | None | None | None | Detailed capability scope |

---

### 6. `role_permissions`
- **Purpose:** Configurable RBAC matrix mapping roles to permissions.
- **Soft-Delete Policy:** Hard delete on permission revocation.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `role` | `varchar(30)` | `NOT NULL` | None | `PK` | CHECK `IN ('super_admin', 'admin', 'counselor', 'trainer', 'student')` | System role |
| `permission_id` | `bigint` | `NOT NULL` | None | `PK`, `FK` | `-> permissions(permission_id) ON DELETE CASCADE` | Permission link |
| `is_granted` | `boolean` | `NOT NULL` | `false` | None | None | Capability toggle state |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Matrix update timestamp |

---

### 7. `staff_profiles`
- **Purpose:** Operational staff data (faculty trainers, admission counselors, branch admins).
- **Soft-Delete Policy:** Prohibited. State tracked via `is_active`.
- **PII:** Medium (`specialization`, `bio_summary`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `staff_profile_id`| `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Profile surrogate PK |
| `user_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE CASCADE` | User account reference |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `staff_type` | `varchar(30)` | `NOT NULL` | None | None | CHECK `IN ('trainer', 'counselor', 'admin')` | Functional staff category |
| `specialization` | `varchar(200)` | `NOT NULL` | None | None | None | Academic or technical domain |
| `instructor_title`| `varchar(150)`| `NULL` | None | None | None | Title on certificates |
| `bio_summary` | `text` | `NULL` | None | None | None | Vernacular / professional bio |
| `is_active` | `boolean` | `NOT NULL` | `true` | None | None | Active staff status |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Onboarding timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Profile modification timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(user_id, brand_id)`
  - `idx_staff_profiles_brand_type` on `(brand_id, staff_type)`

---

### 8. `student_profiles`
- **Purpose:** Learner academic profiles, roll numbers, and emergency contact details.
- **Soft-Delete Policy:** Prohibited.
- **PII:** High (`whatsapp_number`, `city_or_region`, `education_bg`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `student_profile_id`| `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Profile PK |
| `user_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE CASCADE` | Linked user account |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `student_roll_no`| `varchar(50)` | `NULL` | None | None | None | Official admission roll number |
| `whatsapp_number`| `varchar(20)` | `NOT NULL` | None | None | E.164 format | WhatsApp notification destination |
| `city_or_region` | `varchar(100)` | `NULL` | None | None | None | Geographical location / state |
| `education_bg` | `varchar(150)` | `NULL` | None | None | None | Degree / prior coding background |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Admission timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Update timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(user_id, brand_id)`
  - `UNIQUE(brand_id, student_roll_no)` WHERE student_roll_no IS NOT NULL

---

### 9. `user_sessions`
- **Purpose:** Active JWT / login session tokens with activity timeouts.
- **Soft-Delete Policy:** Hard delete on logout or expiration purge.
- **PII:** Medium (Client IP, User Agent).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `session_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Session surrogate PK |
| `user_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE CASCADE` | Authenticated user |
| `token_hash` | `varchar(255)` | `NOT NULL` | None | None | `UNIQUE` | SHA-256 hash of refresh token |
| `ip_address` | `inet` | `NOT NULL` | None | None | None | Client IP address |
| `user_agent` | `text` | `NULL` | None | None | None | Client browser/device string |
| `expires_at` | `timestamptz` | `NOT NULL` | None | None | None | Absolute session expiration |
| `last_activity_at`| `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Inactivity timeout tracker |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Login timestamp |

- **Indexes:**
  - `idx_user_sessions_token` on `(token_hash)` (Unique B-tree)
  - `idx_user_sessions_user_expires` on `(user_id, expires_at)`

---

## Domain 02: Course Catalogue & Materials

### 10. `courses`
- **Purpose:** Master programs offered by brands.
- **Soft-Delete Policy:** Soft-delete via `status = 'inactive'`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `course_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Internal course PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Non-enumerable public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `slug` | `varchar(100)` | `NOT NULL` | None | None | None | URL slug |
| `title` | `varchar(200)` | `NOT NULL` | None | None | UTF-8 enabled | Full course title |
| `category` | `varchar(100)` | `NOT NULL` | None | None | None | Domain classification |
| `duration_weeks`| `integer` | `NOT NULL` | `12` | None | CHECK `duration_weeks > 0` | Academic duration |
| `base_fee` | `numeric(12,2)`| `NOT NULL` | `0.00` | None | CHECK `base_fee >= 0` | Master catalog tuition fee |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | None | CHECK `IN ('INR', 'USD')` | Monetary denomination |
| `description` | `text` | `NULL` | None | None | UTF-8 enabled | Program overview |
| `usps` | `jsonb` | `NOT NULL` | `'[]'::jsonb` | None | None | Array of value propositions |
| `status` | `varchar(20)` | `NOT NULL` | `'active'` | None | CHECK `IN ('active', 'inactive')` | Course publishing status |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Last edit timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(brand_id, slug)`
  - `idx_courses_brand_status` on `(brand_id, status)`

---

### 11. `course_modules`
- **Purpose:** Syllabus chapter units.
- **Soft-Delete Policy:** Cascade deleted if draft course removed; restrict if enrolled.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `module_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Module PK |
| `course_id` | `bigint` | `NOT NULL` | None | `FK` | `-> courses(course_id) ON DELETE CASCADE` | Course parent link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Tenancy consistency |
| `module_number` | `integer` | `NOT NULL` | None | None | CHECK `module_number > 0` | Sequence index |
| `title` | `varchar(200)` | `NOT NULL` | None | None | UTF-8 enabled | Module title |
| `total_duration`| `varchar(50)` | `NULL` | None | None | None | e.g. `'8 Hours'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(course_id, module_number)`
  - `idx_course_modules_course` on `(course_id)`

---

### 12. `course_lessons`
- **Purpose:** Individual instructional units, video lectures, and code samples.
- **Soft-Delete Policy:** Cascade deleted with module.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `lesson_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Lesson PK |
| `module_id` | `bigint` | `NOT NULL` | None | `FK` | `-> course_modules(module_id) ON DELETE CASCADE`| Module parent link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Tenancy consistency |
| `lesson_order` | `integer` | `NOT NULL` | `1` | None | CHECK `lesson_order > 0` | Sequence within module |
| `title` | `varchar(200)` | `NOT NULL` | None | None | UTF-8 enabled | Lesson title |
| `duration_mins` | `integer` | `NOT NULL` | `45` | None | CHECK `duration_mins > 0` | Video duration in minutes |
| `summary` | `text` | `NOT NULL` | None | None | UTF-8 enabled | Vernacular lesson summary |
| `video_url` | `text` | `NULL` | None | None | None | S3 / CloudFront streaming link |
| `code_snippet` | `text` | `NULL` | None | None | None | Sample source code |
| `notes_pdf_url` | `text` | `NULL` | None | None | None | Accompanying PDF slides link |
| `is_preview` | `boolean` | `NOT NULL` | `false` | None | None | Accessible to prospective leads |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(module_id, lesson_order)`
  - `idx_course_lessons_module` on `(module_id)`

---

### 13. `learning_materials`
- **Purpose:** S3 file asset metadata (slides, notebooks, cheatsheets, code repos).
- **Soft-Delete Policy:** Soft delete via `is_active = false`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `material_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Material PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `course_id` | `bigint` | `NULL` | None | `FK` | `-> courses(course_id) ON DELETE CASCADE` | Optional course link |
| `module_id` | `bigint` | `NULL` | None | `FK` | `-> course_modules(module_id) ON DELETE SET NULL`| Optional module link |
| `batch_id` | `bigint` | `NULL` | None | `FK` | `-> batches(batch_id) ON DELETE SET NULL` | Optional cohort link |
| `title` | `varchar(255)` | `NOT NULL` | None | None | None | Asset display title |
| `material_type` | `varchar(30)` | `NOT NULL` | None | None | CHECK `IN ('slides', 'notebook', 'video', 'cheatsheet', 'code')` | Asset type |
| `storage_key` | `text` | `NOT NULL` | None | None | None | S3 object key or external repo URL |
| `file_size_bytes`| `bigint` | `NULL` | None | None | None | Exact file size in bytes |
| `file_size_text`| `varchar(50)` | `NULL` | None | None | None | Formatted text (`4.8 MB (PDF)`) |
| `mime_type` | `varchar(100)` | `NULL` | None | None | None | MIME type string |
| `uploaded_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Staff uploader |
| `is_active` | `boolean` | `NOT NULL` | `true` | None | None | Active asset visibility |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Upload timestamp |

- **Indexes:**
  - `idx_learning_materials_brand_type` on `(brand_id, material_type)`
  - `idx_learning_materials_batch` on `(batch_id)` WHERE batch_id IS NOT NULL

---

## Domain 03: Cohorts, Classes & Timetable

### 14. `batches`
- **Purpose:** Academic cohorts.
- **Soft-Delete Policy:** Prohibited. Batches transition to `status = 'completed' | 'archived'`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `batch_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Batch PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `course_id` | `bigint` | `NOT NULL` | None | `FK` | `-> courses(course_id) ON DELETE RESTRICT`| Course program |
| `primary_trainer_id`| `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Assigned instructor |
| `name` | `varchar(150)` | `NOT NULL` | None | None | None | Cohort name |
| `schedule_days` | `varchar(100)` | `NOT NULL` | None | None | None | Days of class (`Mon - Fri`, `Sat & Sun`) |
| `timing_slot` | `varchar(100)` | `NOT NULL` | None | None | None | Display time slot |
| `start_date` | `date` | `NOT NULL` | None | None | None | First class date |
| `end_date` | `date` | `NULL` | None | None | None | Target graduation date |
| `max_capacity` | `integer` | `NOT NULL` | `50` | None | CHECK `max_capacity > 0` | Student seat limit |
| `meeting_room_url`| `text` | `NULL` | None | None | None | Persistent Google Meet / Zoom link |
| `status` | `varchar(20)` | `NOT NULL` | `'pending'` | None | CHECK `IN ('pending', 'active', 'completed', 'archived')` | Batch lifecycle state |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Last update |

- **Constraints & Indexes:**
  - `UNIQUE(brand_id, batch_id)` (Composite key for child RLS consistency)
  - `idx_batches_brand_status` on `(brand_id, status)`
  - `idx_batches_trainer` on `(primary_trainer_id)`

---

### 15. `class_sessions`
- **Purpose:** Scheduled live lectures, workshop sessions, and replays.
- **Soft-Delete Policy:** Prohibited. Sessions are marked `status = 'cancelled'`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `class_session_id`| `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Class session PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `batch_id` | `bigint` | `NOT NULL` | None | `FK` | `-> batches(batch_id) ON DELETE CASCADE`| Cohort parent link |
| `trainer_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Host faculty |
| `topic` | `varchar(255)` | `NOT NULL` | None | None | UTF-8 enabled | Lecture topic |
| `mode` | `varchar(30)` | `NOT NULL` | `'live_lecture'` | None | CHECK `IN ('live_lecture', 'workshop', 'doubt_clearing', 'lab')` | Lecture mode |
| `scheduled_start`| `timestamptz` | `NOT NULL` | None | None | None | Scheduled start timestamp (UTC) |
| `scheduled_end` | `timestamptz` | `NOT NULL` | None | None | CHECK `scheduled_end > scheduled_start` | Scheduled end timestamp (UTC) |
| `duration_mins` | `integer` | `NOT NULL` | `90` | None | CHECK `duration_mins > 0` | Duration in minutes |
| `meeting_url` | `text` | `NOT NULL` | None | None | None | Meeting URL |
| `recording_url` | `text` | `NULL` | None | None | None | Video replay stream URL |
| `notes_url` | `text` | `NULL` | None | None | None | PDF lecture notes URL |
| `expected_attendees`| `integer`| `NOT NULL` | `0` | None | None | Cohort learner count |
| `status` | `varchar(20)` | `NOT NULL` | `'upcoming'` | None | CHECK `IN ('upcoming', 'live', 'completed', 'cancelled')` | Session status |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Scheduling timestamp |

- **Exclusion Constraints & Indexes:**
  - `prevent_trainer_double_booking`: `EXCLUDE USING gist (trainer_id WITH =, tstzrange(scheduled_start, scheduled_end) WITH &&) WHERE (status != 'cancelled')`
  - `idx_class_sessions_batch_start` on `(batch_id, scheduled_start)`
  - `idx_class_sessions_trainer_status` on `(trainer_id, status)`

---

### 16. `class_attendance`
- **Purpose:** Student presence ledger per class session.
- **Soft-Delete Policy:** Prohibited. Corrections logged via `updated_at`.
- **PII:** Low (`remarks`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `attendance_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Attendance PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `class_session_id`| `bigint` | `NOT NULL` | None | `FK` | `-> class_sessions(class_session_id) ON DELETE CASCADE`| Class session |
| `student_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Learner user |
| `status` | `varchar(20)` | `NOT NULL` | None | None | CHECK `IN ('present', 'late', 'absent')` | Presence status |
| `joined_at` | `timestamptz` | `NULL` | None | None | None | Actual entry timestamp |
| `marked_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Trainer who marked |
| `remarks` | `text` | `NULL` | None | None | None | Trainer observations |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Marking timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Modification timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(class_session_id, student_id)`
  - `idx_class_attendance_student_status` on `(student_id, status)`

---

## Domain 04: Admissions CRM & Inquiries

### 17. `leads`
- **Purpose:** Prospective candidate inquiry records.
- **Soft-Delete Policy:** Retention policy: leads in `'lost'` or `'new'` stage older than 180 days without interaction are soft-deleted via `is_archived = true`.
- **PII:** High (`name`, `phone`, `email`, `discussion_notes`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `lead_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Lead PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `name` | `varchar(150)` | `NOT NULL` | None | None | None | Candidate full name |
| `phone` | `varchar(20)` | `NOT NULL` | None | None | E.164 format | Normalized contact phone |
| `email` | `citext` | `NULL` | None | None | None | Candidate email address |
| `interested_course_id`| `bigint`| `NULL` | None | `FK` | `-> courses(course_id) ON DELETE SET NULL` | Program of interest |
| `assigned_counselor_id`| `bigint`| `NULL` | None | `FK` | `-> users(user_id) ON DELETE SET NULL` | Assigned staff counselor |
| `source` | `varchar(50)` | `NOT NULL` | `'Website'` | None | CHECK `IN ('Website', 'WhatsApp Inbound', 'Referral', 'Meta Ads', 'Google Search', 'LinkedIn')` | Lead acquisition channel |
| `funnel_stage` | `varchar(30)` | `NOT NULL` | `'new'` | None | CHECK `IN ('new', 'discussion', 'counseling_done', 'payment_pending', 'enrolled', 'lost')` | Kanban funnel stage |
| `fee_quoted` | `numeric(12,2)`| `NULL` | None | None | None | Quoted tuition fee |
| `discussion_notes`| `text` | `NULL` | None | None | UTF-8 enabled | Latest notes from candidate discussions |
| `converted_student_id`| `bigint`| `NULL` | None | `FK` | `-> users(user_id) ON DELETE SET NULL` | Conversion traceability |
| `is_archived` | `boolean` | `NOT NULL` | `false` | None | None | Soft-delete / DPDP archive flag |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Influx timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Last update |

- **Constraints & Indexes:**
  - `idx_leads_brand_phone` on `(brand_id, phone)` (Unique for active leads `WHERE is_archived = false`)
  - `idx_leads_counselor_stage` on `(assigned_counselor_id, funnel_stage)`
  - `idx_leads_brand_stage_created` on `(brand_id, funnel_stage, created_at)`

---

### 18. `lead_stage_history`
- **Purpose:** Audit log of CRM funnel stage transitions.
- **Soft-Delete Policy:** Prohibited. (Append-only).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `stage_history_id`| `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | History PK |
| `lead_id` | `bigint` | `NOT NULL` | None | `FK` | `-> leads(lead_id) ON DELETE CASCADE` | Lead link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `from_stage` | `varchar(30)` | `NULL` | None | None | Stage enum | Previous funnel stage |
| `to_stage` | `varchar(30)` | `NOT NULL` | None | None | Stage enum | Next funnel stage |
| `changed_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Counselor who advanced |
| `transition_notes`| `text` | `NULL` | None | None | None | Disposition remarks |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Transition timestamp |

- **Indexes:**
  - `idx_lead_stage_history_lead` on `(lead_id, created_at)`

---

### 19. `lead_notes`
- **Purpose:** Threaded communication notes and counselor call history per lead.
- **Soft-Delete Policy:** Prohibited. (Append-only).
- **PII:** Medium (`note_text`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `note_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Note PK |
| `lead_id` | `bigint` | `NOT NULL` | None | `FK` | `-> leads(lead_id) ON DELETE CASCADE` | Associated lead |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `author_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Staff counselor |
| `note_text` | `text` | `NOT NULL` | None | None | UTF-8 enabled | Conversation summary |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Logging timestamp |

- **Indexes:**
  - `idx_lead_notes_lead` on `(lead_id, created_at)`

---

## Domain 05: Student Enrolment Lifecycle

### 20. `enrolments`
- **Purpose:** Official academic binding between a student, a course, and an academic cohort.
- **Soft-Delete Policy:** Prohibited. States are managed via `status = 'dropped' | 'suspended'`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `enrolment_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Enrolment PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `student_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Enrolled learner |
| `course_id` | `bigint` | `NOT NULL` | None | `FK` | `-> courses(course_id) ON DELETE RESTRICT`| Academic program |
| `batch_id` | `bigint` | `NOT NULL` | None | `FK` | `-> batches(batch_id) ON DELETE RESTRICT` | Assigned cohort |
| `enrolled_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Counselor / Admin |
| `enrolment_date` | `date` | `NOT NULL` | `CURRENT_DATE` | None | None | Date of admission |
| `status` | `varchar(20)` | `NOT NULL` | `'active'` | None | CHECK `IN ('active', 'completed', 'dropped', 'suspended')` | Enrollment state |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Modification timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(student_id, batch_id)` (One active enrollment per student per cohort)
  - `idx_enrolments_student` on `(student_id)`
  - `idx_enrolments_batch_status` on `(batch_id, status)`

---

### 21. `enrolment_status_history`
- **Purpose:** Audit ledger for academic enrollment status changes (dropouts, suspensions, completions).
- **Soft-Delete Policy:** Prohibited. (Append-only).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `history_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | History PK |
| `enrolment_id` | `bigint` | `NOT NULL` | None | `FK` | `-> enrolments(enrolment_id) ON DELETE CASCADE`| Enrolment link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `from_status` | `varchar(20)` | `NULL` | None | None | Status enum | Previous enrollment state |
| `to_status` | `varchar(20)` | `NOT NULL` | None | None | Status enum | New enrollment state |
| `reason` | `text` | `NULL` | None | None | None | Explanation for status change |
| `changed_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Admin actor |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Change timestamp |

---

## Domain 06: Tuition Finance & Invoicing

### 22. `fee_plans`
- **Purpose:** Predefined pricing structures (Full Upfront vs Installments).
- **Soft-Delete Policy:** Soft delete via `is_active = false`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `fee_plan_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Fee plan PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `course_id` | `bigint` | `NOT NULL` | None | `FK` | `-> courses(course_id) ON DELETE RESTRICT`| Program link |
| `plan_name` | `varchar(100)` | `NOT NULL` | None | None | None | Display plan title |
| `plan_type` | `varchar(20)` | `NOT NULL` | `'full'` | None | CHECK `IN ('full', 'installment')` | Pricing type |
| `total_amount` | `numeric(12,2)`| `NOT NULL` | None | None | CHECK `total_amount > 0` | Total plan fee |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | None | CHECK `IN ('INR', 'USD')` | Currency code |
| `installments_count`| `integer` | `NOT NULL` | `1` | None | CHECK `installments_count >= 1` | Number of payments |
| `is_active` | `boolean` | `NOT NULL` | `true` | None | None | Active catalog toggle |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp |

---

### 23. `fee_plan_instalments`
- **Purpose:** Breakdown rules for multi-part installment plans.
- **Soft-Delete Policy:** Cascade deleted with fee plan.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `instalment_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Instalment PK |
| `fee_plan_id` | `bigint` | `NOT NULL` | None | `FK` | `-> fee_plans(fee_plan_id) ON DELETE CASCADE`| Parent fee plan |
| `instalment_no` | `integer` | `NOT NULL` | None | None | CHECK `instalment_no > 0` | Installment sequence |
| `percentage` | `numeric(5,2)` | `NULL` | None | None | CHECK `percentage BETWEEN 1 AND 100` | Percentage of total fee |
| `fixed_amount` | `numeric(12,2)`| `NULL` | None | None | CHECK `fixed_amount > 0` | Or fixed currency amount |
| `due_offset_days`| `integer` | `NOT NULL` | `0` | None | CHECK `due_offset_days >= 0` | Days after admission due |

---

### 24. `invoices`
- **Purpose:** Billed tuition claims with snapshot pricing.
- **Soft-Delete Policy:** Prohibited. (Audit immutable).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `invoice_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Invoice PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `enrolment_id` | `bigint` | `NOT NULL` | None | `FK` | `-> enrolments(enrolment_id) ON DELETE RESTRICT`| Student enrolment |
| `student_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Billed student |
| `invoice_number`| `varchar(50)` | `NOT NULL` | None | None | None | Human readable number (`INV-TA-2026-081`) |
| `billed_amount` | `numeric(12,2)`| `NOT NULL` | None | None | CHECK `billed_amount > 0` | Total claimed tuition |
| `paid_amount` | `numeric(12,2)`| `NOT NULL` | `0.00` | None | CHECK `paid_amount >= 0` | Sum of payments received |
| `balance_due` | `numeric(12,2)`| `NOT NULL` | None | None | CHECK `balance_due >= 0` | Remaining unpaid balance |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | None | CHECK `IN ('INR', 'USD')` | Currency code |
| `due_date` | `date` | `NOT NULL` | None | None | None | Payment due date |
| `status` | `varchar(20)` | `NOT NULL` | `'Pending'` | None | CHECK `IN ('Paid', 'Partial', 'Pending', 'Overdue')` | Invoice payment status |
| `issued_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Admin/Counselor issuer |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Issue timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Update timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(brand_id, invoice_number)`
  - `idx_invoices_student_status` on `(student_id, status)`
  - `idx_invoices_brand_due` on `(brand_id, due_date)` WHERE status != 'Paid'

---

### 25. `payments`
- **Purpose:** Append-only ledger of confirmed funds received.
- **Soft-Delete Policy:** Prohibited. (Audit immutable).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `payment_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Payment PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `invoice_id` | `bigint` | `NOT NULL` | None | `FK` | `-> invoices(invoice_id) ON DELETE RESTRICT`| Invoice reference |
| `receipt_number`| `varchar(50)` | `NOT NULL` | None | None | None | Human readable receipt (`REC-TAI-2026-081`) |
| `amount` | `numeric(12,2)`| `NOT NULL` | None | None | CHECK `amount > 0` | Money received |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | None | CHECK `IN ('INR', 'USD')` | Currency code |
| `payment_mode` | `varchar(30)` | `NOT NULL` | None | None | CHECK `IN ('UPI', 'Credit Card', 'NetBanking', 'Stripe', 'Bank NEFT', 'Cash')` | Payment instrument |
| `recorded_by` | `bigint` | `NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Admin who logged offline pay |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Money arrival timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(brand_id, receipt_number)`
  - `idx_payments_invoice` on `(invoice_id)`

---

### 26. `payment_transactions`
- **Purpose:** Raw gateway events, webhooks, and idempotency tracking.
- **Soft-Delete Policy:** Prohibited. (Append-only).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `transaction_id`| `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Transaction PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `payment_id` | `bigint` | `NULL` | None | `FK` | `-> payments(payment_id) ON DELETE SET NULL`| Confirmed payment link |
| `gateway` | `varchar(30)` | `NOT NULL` | None | None | CHECK `IN ('razorpay', 'stripe', 'manual')` | Gateway provider |
| `gateway_order_id`| `varchar(150)`| `NULL` | None | None | None | Gateway order ID |
| `gateway_payment_id`| `varchar(150)`| `NOT NULL`| None | None | `UNIQUE` (Idempotency) | Gateway transaction reference |
| `raw_payload` | `jsonb` | `NOT NULL` | None | None | None | Full gateway webhook payload |
| `status` | `varchar(30)` | `NOT NULL` | `'SUCCESS'` | None | CHECK `IN ('PENDING', 'SUCCESS', 'FAILED')` | Transaction result |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Gateway event arrival time |

---

### 27. `payment_adjustments`
- **Purpose:** Audit-compliant refunds, scholarship waivers, and fee reductions.
- **Soft-Delete Policy:** Prohibited. (Append-only).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `adjustment_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Adjustment PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `invoice_id` | `bigint` | `NOT NULL` | None | `FK` | `-> invoices(invoice_id) ON DELETE RESTRICT`| Adjusted invoice |
| `adjustment_type`| `varchar(30)` | `NOT NULL` | None | None | CHECK `IN ('refund', 'scholarship_waiver', 'discount_override', 'chargeback')` | Reason category |
| `amount` | `numeric(12,2)`| `NOT NULL` | None | None | CHECK `amount != 0` | Signed adjustment value |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | None | CHECK `IN ('INR', 'USD')` | Currency code |
| `reason` | `text` | `NOT NULL` | None | None | None | Administrative justification |
| `approved_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Approving Super Admin / Admin |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Adjustment timestamp |

---

## Domain 07: Assessments & Evaluation

### 28. `assignments`
- **Purpose:** Homework tasks, capstone projects, and coding assignments.
- **Soft-Delete Policy:** Soft delete via `status = 'closed'`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `assignment_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Assignment PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public UUID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `batch_id` | `bigint` | `NOT NULL` | None | `FK` | `-> batches(batch_id) ON DELETE CASCADE`| Cohort parent |
| `title` | `varchar(200)` | `NOT NULL` | None | None | UTF-8 enabled | Assignment title |
| `instructions` | `text` | `NOT NULL` | None | None | UTF-8 enabled | Detailed markdown requirements |
| `starter_repo_url`| `text` | `NULL` | None | None | None | GitHub template repository link |
| `max_score` | `integer` | `NOT NULL` | `100` | None | CHECK `max_score > 0` | Maximum possible marks |
| `due_date` | `timestamptz` | `NOT NULL` | None | None | None | Submission deadline (UTC) |
| `status` | `varchar(20)` | `NOT NULL` | `'active'` | None | CHECK `IN ('active', 'reviewing', 'closed')` | Task status |
| `created_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Trainer author |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Authoring timestamp |

- **Indexes:**
  - `idx_assignments_batch_status` on `(batch_id, status)`

---

### 29. `assignment_submissions`
- **Purpose:** Student GitHub repo submissions, evaluation scores, and trainer feedback.
- **Soft-Delete Policy:** Prohibited. Resubmissions update record state to `status = 'resubmit'`.
- **PII:** Low (`student_notes`, `feedback`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `submission_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Submission PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `assignment_id` | `bigint` | `NOT NULL` | None | `FK` | `-> assignments(assignment_id) ON DELETE CASCADE`| Parent assignment |
| `student_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Student author |
| `repo_url` | `text` | `NOT NULL` | None | None | None | Student GitHub project link |
| `student_notes` | `text` | `NULL` | None | None | UTF-8 enabled | Student implementation notes |
| `score` | `numeric(5,2)` | `NULL` | None | None | CHECK `score >= 0` | Awarded marks |
| `feedback` | `text` | `NULL` | None | None | UTF-8 enabled | Qualitative trainer critique |
| `status` | `varchar(20)` | `NOT NULL` | `'pending'` | None | CHECK `IN ('pending', 'graded', 'resubmit')` | Evaluation status |
| `graded_by` | `bigint` | `NULL` | None | `FK` | `-> users(user_id) ON DELETE SET NULL` | Grading trainer |
| `submitted_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Submission timestamp |
| `graded_at` | `timestamptz` | `NULL` | None | None | None | Evaluation timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(assignment_id, student_id)`
  - `idx_assignment_submissions_student` on `(student_id)`
  - `idx_assignment_submissions_status` on `(assignment_id, status)`

---

### 30. `quizzes`
- **Purpose:** Multiple choice assessment definitions.
- **Soft-Delete Policy:** Soft delete via `status = 'archived'`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `quiz_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Quiz PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `batch_id` | `bigint` | `NULL` | None | `FK` | `-> batches(batch_id) ON DELETE CASCADE`| Target cohort |
| `title` | `varchar(200)` | `NOT NULL` | None | None | UTF-8 enabled | Quiz title |
| `duration_minutes`| `integer` | `NOT NULL` | `30` | None | CHECK `duration_minutes > 0` | Time limit in minutes |
| `pass_percentage`| `integer` | `NOT NULL` | `70` | None | CHECK `pass_percentage BETWEEN 1 AND 100`| Minimum score to pass |
| `max_attempts` | `integer` | `NOT NULL` | `3` | None | CHECK `max_attempts >= 1` | Allowed student attempts |
| `status` | `varchar(20)` | `NOT NULL` | `'draft'` | None | CHECK `IN ('draft', 'active', 'archived')` | Publishing status |
| `created_by` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Faculty author |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Creation timestamp |

---

### 31. `quiz_questions`
- **Purpose:** Questions, JSON options, and correct answer keys.
- **Soft-Delete Policy:** Cascade deleted with quiz.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `question_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Question PK |
| `quiz_id` | `bigint` | `NOT NULL` | None | `FK` | `-> quizzes(quiz_id) ON DELETE CASCADE` | Parent quiz |
| `question_number`| `integer` | `NOT NULL` | None | None | CHECK `question_number > 0` | Sequence number |
| `question_text` | `text` | `NOT NULL` | None | None | UTF-8 enabled | Question body |
| `options` | `jsonb` | `NOT NULL` | None | None | Array of 4 string choices | JSON array of options |
| `correct_option_index`| `smallint`| `NOT NULL` | None | None | CHECK `correct_option_index BETWEEN 0 AND 3` | Index of correct answer |

- **Constraints & Indexes:**
  - `UNIQUE(quiz_id, question_number)`

---

### 32. `quiz_attempts`
- **Purpose:** Student exam attempt records and final percentage scores.
- **Soft-Delete Policy:** Prohibited. (Audit immutable).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `attempt_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Attempt PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `quiz_id` | `bigint` | `NOT NULL` | None | `FK` | `-> quizzes(quiz_id) ON DELETE RESTRICT` | Exam taken |
| `student_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Student candidate |
| `attempt_number`| `integer` | `NOT NULL` | `1` | None | CHECK `attempt_number >= 1` | Which attempt |
| `score_percent` | `numeric(5,2)` | `NOT NULL` | None | None | CHECK `score_percent BETWEEN 0 AND 100` | Percentage scored |
| `is_passed` | `boolean` | `NOT NULL` | None | None | None | Passed benchmark |
| `submitted_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Submission timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(quiz_id, student_id, attempt_number)`
  - `idx_quiz_attempts_student` on `(student_id)`

---

### 33. `quiz_attempt_answers`
- **Purpose:** Frozen student answer choices per question for review mode.
- **Soft-Delete Policy:** Cascade deleted with attempt.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `attempt_id` | `bigint` | `NOT NULL` | None | `PK`, `FK` | `-> quiz_attempts(attempt_id) ON DELETE CASCADE`| Parent attempt |
| `question_id` | `bigint` | `NOT NULL` | None | `PK`, `FK` | `-> quiz_questions(question_id) ON DELETE CASCADE`| Question answered |
| `selected_option_index`| `smallint`| `NOT NULL` | None | None | CHECK `selected_option_index BETWEEN 0 AND 3` | Student answer |
| `is_correct` | `boolean` | `NOT NULL` | None | None | None | Answer correctness |

---

## Domain 08: Progress & Digital Credentials

### 34. `course_progress`
- **Purpose:** Materialized student performance summary to maintain sub-50ms dashboard response times.
- **Soft-Delete Policy:** Prohibited. Updated on academic triggers.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `progress_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Progress PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `enrolment_id` | `bigint` | `NOT NULL` | None | `FK` | `-> enrolments(enrolment_id) ON DELETE CASCADE`| Enrolment link |
| `student_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Learner user |
| `attendance_rate`| `numeric(5,2)` | `NOT NULL` | `0.00` | None | CHECK `attendance_rate BETWEEN 0 AND 100` | Current attendance % |
| `assignments_done`| `integer` | `NOT NULL` | `0` | None | CHECK `assignments_done >= 0` | Projects completed |
| `assignments_total`| `integer` | `NOT NULL` | `0` | None | CHECK `assignments_total >= 0` | Total cohort projects |
| `quiz_average` | `numeric(5,2)` | `NOT NULL` | `0.00` | None | CHECK `quiz_average BETWEEN 0 AND 100` | Average quiz % |
| `tuition_paid_in_full`| `boolean`| `NOT NULL`| `false` | None | None | Financial clearance |
| `is_eligible_for_cert`| `boolean`| `NOT NULL`| `false` | None | None | All benchmarks met |
| `last_calculated_at`| `timestamptz`| `NOT NULL`| `clock_timestamp()`| None | None | Last calculation time |

- **Constraints & Indexes:**
  - `UNIQUE(enrolment_id)`
  - `idx_course_progress_student` on `(student_id)`

---

### 35. `certificate_templates`
- **Purpose:** Brand visual certificate designs, signatures, and titles.
- **Soft-Delete Policy:** Prohibited.
- **PII:** Low (Instructor signature metadata).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `template_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Template PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `course_id` | `bigint` | `NOT NULL` | None | `FK` | `-> courses(course_id) ON DELETE RESTRICT`| Program link |
| `authorized_signatory`| `varchar(150)`| `NOT NULL`| None | None | None | Instructor / Dean name |
| `signatory_title`| `varchar(150)`| `NOT NULL` | None | None | None | Signatory title |
| `signature_image_key`| `text` | `NULL` | None | None | None | S3 key for PNG signature |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Template creation timestamp |

- **Constraints:**
  - `UNIQUE(brand_id, course_id)`

---

### 36. `certificates`
- **Purpose:** Verifiable digital credentials.
- **Soft-Delete Policy:** Prohibited. (Audit immutable).
- **PII:** Low (`public_code`, `student_name`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `certificate_id`| `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Certificate PK |
| `public_code` | `varchar(50)` | `NOT NULL` | None | None | `UNIQUE` | Human readable ID (`CERT-TAI-8921`) |
| `verification_uuid`| `uuid` | `NOT NULL` | `gen_random_uuid()` | None | `UNIQUE` | Public verification URL token |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `enrolment_id` | `bigint` | `NOT NULL` | None | `FK` | `-> enrolments(enrolment_id) ON DELETE RESTRICT`| Enrolment link |
| `student_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Graduated learner |
| `course_id` | `bigint` | `NOT NULL` | None | `FK` | `-> courses(course_id) ON DELETE RESTRICT`| Completed course |
| `issue_date` | `date` | `NOT NULL` | `CURRENT_DATE` | None | None | Issuance date |
| `instructor_name`| `varchar(150)`| `NOT NULL` | None | None | None | Snapshot instructor name |
| `skills_certified`| `jsonb` | `NOT NULL` | `'[]'::jsonb` | None | None | Array of skills mastered |
| `pdf_storage_key`| `text` | `NULL` | None | None | None | S3 key for vector PDF credential |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Generation timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(enrolment_id)` (One certificate per enrolment)
  - `idx_certificates_verify` on `(verification_uuid)`

---

## Domain 09: Communications & Broadcasts

### 37. `announcements`
- **Purpose:** Campus broadcast notices.
- **Soft-Delete Policy:** Soft delete via `is_active = false`.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `announcement_id`| `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Announcement PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `author_id` | `bigint` | `NOT NULL` | None | `FK` | `-> users(user_id) ON DELETE RESTRICT` | Admin author |
| `title` | `varchar(255)` | `NOT NULL` | None | None | UTF-8 enabled | Notice headline |
| `content` | `text` | `NOT NULL` | None | None | UTF-8 enabled | Notice content |
| `target_audience`| `varchar(100)`| `NOT NULL` | `'All Active Batches'`| None | None | Target recipient tag |
| `batch_id` | `bigint` | `NULL` | None | `FK` | `-> batches(batch_id) ON DELETE CASCADE`| Optional cohort target |
| `via_whatsapp` | `boolean` | `NOT NULL` | `false` | None | None | Dispatched via WhatsApp |
| `is_active` | `boolean` | `NOT NULL` | `true` | None | None | Active banner toggle |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Broadcast timestamp |

- **Indexes:**
  - `idx_announcements_brand_created` on `(brand_id, created_at)`

---

### 38. `whatsapp_templates`
- **Purpose:** Meta Cloud API approved message templates.
- **Soft-Delete Policy:** Prohibited.
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `template_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Template PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `name` | `varchar(100)` | `NOT NULL` | None | None | None | Meta template name |
| `category` | `varchar(30)` | `NOT NULL` | None | None | CHECK `IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')` | Meta category |
| `language` | `varchar(20)` | `NOT NULL` | `'en'` | None | None | Language code (`en`, `te`) |
| `preview_text` | `text` | `NOT NULL` | None | None | None | Parameterized template body |
| `status` | `varchar(20)` | `NOT NULL` | `'PENDING'` | None | CHECK `IN ('APPROVED', 'PENDING', 'REJECTED')` | Approval status |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Last status check |

- **Constraints & Indexes:**
  - `UNIQUE(brand_id, name)`

---

### 39. `whatsapp_messages`
- **Purpose:** Outbound notification queue and delivery audit log.
- **Soft-Delete Policy:** Prohibited. (Audit immutable).
- **PII:** High (`recipient_phone`, `rendered_body`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `message_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Message PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `template_id` | `bigint` | `NULL` | None | `FK` | `-> whatsapp_templates(template_id) ON DELETE SET NULL`| Template reference |
| `recipient_phone`| `varchar(20)`| `NOT NULL` | None | None | E.164 format | Destination mobile number |
| `recipient_user_id`| `bigint` | `NULL` | None | `FK` | `-> users(user_id) ON DELETE SET NULL` | Linked recipient |
| `rendered_body` | `text` | `NOT NULL` | None | None | UTF-8 enabled | Fully interpolated message |
| `provider_message_id`| `varchar(100)`| `NULL`| None | None | None | Meta WAMID |
| `delivery_status`| `varchar(30)`| `NOT NULL` | `'SENT'` | None | CHECK `IN ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')` | Meta status |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Dispatch timestamp |

- **Indexes:**
  - `idx_whatsapp_messages_phone` on `(recipient_phone)`
  - `idx_whatsapp_messages_created` on `(created_at)`

---

## Domain 10: Platform Ops, Security & Audit

### 40. `system_settings`
- **Purpose:** Encrypted API keys, payment secrets, S3 bucket configurations, and 2FA policies.
- **Soft-Delete Policy:** Prohibited.
- **PII:** None (Secrets encrypted via `pgcrypto`).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `setting_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` | None | Setting PK |
| `brand_id` | `bigint` | `NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| `NULL` = Platform-wide |
| `setting_group` | `varchar(50)` | `NOT NULL` | None | None | CHECK `IN ('payments', 'storage', 'email', 'security', 'whatsapp')` | Settings group |
| `setting_key` | `varchar(100)` | `NOT NULL` | None | None | None | Unique key identifier |
| `setting_value` | `text` | `NOT NULL` | None | None | None | Value string / JSON |
| `is_secret` | `boolean` | `NOT NULL` | `false` | None | None | Sensitive key flag |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Last modified timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(brand_id, setting_group, setting_key)`

---

### 41. `audit_logs` (Partitioned Monthly)
- **Purpose:** Append-only security audit trail recording all privileged events.
- **Partitioning:** Range-partitioned by `created_at` (monthly partitions).
- **Soft-Delete Policy:** Prohibited.
- **PII:** Low (Actor name, IP address).

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `audit_log_id` | `bigint` (Identity) | `NOT NULL` | Auto | `PK` (Composite with `created_at`) | None | Audit log PK |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | `PK` (Partition key) | None | Event timestamp (UTC) |
| `brand_id` | `bigint` | `NULL` | None | `FK` | `-> brands(brand_id) ON DELETE SET NULL`| `NULL` = Platform |
| `actor_user_id`| `bigint` | `NULL` | None | `FK` | `-> users(user_id) ON DELETE SET NULL` | Performing user |
| `actor_name` | `varchar(150)` | `NOT NULL` | None | None | None | User name / System |
| `actor_role` | `varchar(30)` | `NOT NULL` | None | None | None | User role |
| `action` | `varchar(100)` | `NOT NULL` | None | None | None | Operation code (`CREATE_ADMIN`) |
| `entity_name` | `varchar(100)` | `NOT NULL` | None | None | None | Target entity (`users:kavitha`) |
| `ip_address` | `inet` | `NOT NULL` | None | None | None | Client IP address |
| `status` | `varchar(20)` | `NOT NULL` | `'SUCCESS'` | None | CHECK `IN ('SUCCESS', 'WARNING', 'FAILED')` | Execution status |
| `event_details` | `jsonb` | `NOT NULL` | `'{}'::jsonb` | None | None | Snapshot before/after JSON |

- **Indexes:**
  - `idx_audit_logs_actor` on `(actor_user_id, created_at)`
  - `idx_audit_logs_brand_action` on `(brand_id, action, created_at)`

---

### 42. `webhook_events`
- **Purpose:** Idempotent event inbox for asynchronous webhooks (Razorpay, Stripe, WhatsApp).
- **Soft-Delete Policy:** Prohibited. (Retention purge after 90 days).
- **PII:** None.

| Column Name | PostgreSQL Type | Nullable | Default | PK/FK | Constraints & Enums | Description |
|---|---|---|---|---|---|---|
| `webhook_event_id`| `bigint` (Identity)| `NOT NULL` | Auto | `PK` | None | Webhook event PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK` | `-> brands(brand_id) ON DELETE RESTRICT`| Brand isolation |
| `provider` | `varchar(50)` | `NOT NULL` | None | None | CHECK `IN ('razorpay', 'stripe', 'meta_whatsapp')` | Gateway provider |
| `idempotency_key`| `varchar(200)`| `NOT NULL` | None | None | None | Unique provider event ID |
| `event_type` | `varchar(100)` | `NOT NULL` | None | None | None | Event name (`payment.captured`) |
| `payload` | `jsonb` | `NOT NULL` | None | None | None | Raw JSON payload |
| `processing_status`| `varchar(30)`| `NOT NULL` | `'PENDING'` | None | CHECK `IN ('PENDING', 'PROCESSED', 'FAILED', 'IGNORED')` | Processing state |
| `error_message` | `text` | `NULL` | None | None | None | Failure details |
| `received_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | None | Reception timestamp |
| `processed_at` | `timestamptz` | `NULL` | None | None | None | Processing timestamp |

- **Constraints & Indexes:**
  - `UNIQUE(provider, idempotency_key)` (Idempotency guarantee)
  - `idx_webhook_events_status` on `(processing_status, received_at)`

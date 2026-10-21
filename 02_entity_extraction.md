# Entity Extraction & Schema Analysis
**Project:** Shared Multi-Brand LMS & Admissions CRM (`TeluguAI.com` & `GenAI99.com`)  
**Scope:** Reverse-Engineered Data Entities, Attributes, Types, Enums, Relationships, and Code Citations  
**Target:** PostgreSQL 16+ Database Schema  
**Document Code:** `/database/02_entity_extraction.md`

---

## 1. Domain Grouping & Extraction Index

| Domain # | Domain Name | Inferred Core Entities |
|---|---|---|
| **01** | **Identity, Multi-Tenancy & Access** | `brands`, `users`, `user_brand_access`, `user_roles`, `permissions`, `role_permissions`, `staff_profiles`, `student_profiles` |
| **02** | **Course Catalogue & Curriculum** | `courses`, `course_modules`, `course_lessons`, `learning_materials` |
| **03** | **Cohorts, Classes & Timetable** | `batches`, `class_sessions`, `class_attendance` |
| **04** | **Admissions CRM & Inquiries** | `leads`, `lead_stage_history`, `lead_notes` |
| **05** | **Student Enrolment Lifecycle** | `enrolments`, `enrolment_status_history` |
| **06** | **Tuition Finance & Invoicing** | `fee_plans`, `invoices`, `payments`, `payment_transactions` |
| **07** | **Assessments & Evaluation** | `assignments`, `assignment_submissions`, `quizzes`, `quiz_questions`, `quiz_attempts`, `quiz_attempt_answers` |
| **08** | **Progress & Digital Credentials**| `course_progress`, `certificates`, `certificate_templates` |
| **09** | **Communications & Broadcasts** | `announcements`, `whatsapp_templates`, `whatsapp_messages` |
| **10** | **Platform Ops, Security & Audit**| `system_settings`, `audit_logs`, `webhook_events` |

---

## 2. Detailed Entity Extractions

---

### Domain 01: Identity, Multi-Tenancy & Access

#### 1. `brands` (Tenants)
*Purpose:* Represents the isolated brand organizations operating on the shared platform (`TeluguAI` and `GenAI99`).
- **File Citations:**
  - Interface `Brand`: [`types.ts`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/types.ts#L14-L27)
  - Profile State: [`BrandManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/BrandManagement.tsx#L26-L35)
  - Badge Rendering: [`BrandBadge.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/BrandBadge.tsx#L1-L32)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `brand_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Internal ID |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | External reference ID |
| `slug` | `varchar(50)` | `NOT NULL` | None | `UNIQUE`, CHECK `slug IN ('teluguai', 'genai99')` | `id: 'teluguai' \| 'genai99'` |
| `name` | `varchar(100)` | `NOT NULL` | None | None | `'TeluguAI'`, `'GenAI99'` |
| `domain` | `varchar(255)` | `NOT NULL` | None | `UNIQUE` | `'https://teluguai.com'` |
| `logo_text` | `varchar(50)` | `NOT NULL` | None | None | `'TA'`, `'G99'` |
| `tagline` | `text` | `NOT NULL` | None | None | Vernacular/Enterprise taglines |
| `support_email` | `citext` | `NOT NULL` | None | None | `'support@teluguai.com'` |
| `primary_color` | `varchar(30)` | `NOT NULL` | `'#059669'` | None | `'emerald-600'`, `'sky-600'` |
| `accent_color` | `varchar(30)` | `NOT NULL` | `'#0284c7'` | None | Hex or Tailwind token |
| `status` | `varchar(30)` | `NOT NULL` | `'active'` | CHECK `status IN ('active', 'maintenance')` | `'active' \| 'maintenance'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | UI metadata date |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Auditing |

---

#### 2. `users` (Global Authentication Entity)
*Purpose:* Global user authentication and credential storage across all portals.
- **File Citations:**
  - Interface `PlatformUser`: [`types.ts`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/types.ts#L29-L40)
  - Login Session: [`CommonLogin.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/CommonLogin.tsx#L12-L28)
  - Staff Roster: [`PlatformUserManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/PlatformUserManagement.tsx#L24-L80)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `user_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Internal surrogate PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | UI string `usr-1`, `std-1` |
| `email` | `citext` | `NOT NULL` | None | `UNIQUE` | `email: string` |
| `phone` | `varchar(20)` | `NULL` | None | E.164 normalized | `phone: string` (e.g. `+91 98480 12345`) |
| `password_hash` | `varchar(255)` | `NOT NULL` | None | Argon2id / bcrypt hash | UI password fields in login/provisioning |
| `full_name` | `varchar(150)` | `NOT NULL` | None | None | `name: string` |
| `avatar_bg` | `varchar(30)` | `NULL` | `'bg-slate-700'` | None | `avatarBg: 'bg-emerald-600'` |
| `is_super_admin`| `boolean` | `NOT NULL` | `false` | None | Global platform override |
| `status` | `varchar(30)` | `NOT NULL` | `'active'` | CHECK `status IN ('active', 'inactive', 'suspended')` | `status: 'active' \| 'inactive' \| 'suspended'` |
| `last_active_at`| `timestamptz` | `NULL` | None | None | `lastActive: '5 mins ago'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |

---

#### 3. `user_brand_access` & `user_roles`
*Purpose:* Maps users to brands and grants role-based permissions per brand.
- **File Citations:**
  - Types `UserRole`, `BrandId`: [`types.ts`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/types.ts#L1-L10)
  - Multi-account demo list: [`CommonLogin.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/CommonLogin.tsx#L18-L35)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `user_role_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Internal ID |
| `user_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id) ON DELETE CASCADE` | User link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id) ON DELETE CASCADE` | Brand tenancy isolation |
| `role` | `varchar(30)` | `NOT NULL` | None | CHECK `role IN ('super_admin', 'admin', 'counselor', 'trainer', 'student')` | `UserRole` union type |
| `department` | `varchar(100)` | `NULL` | None | None | `'Leadership'`, `'Academics'`, `'Admissions'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Creation audit |
| *Composite* | Composite Unique | `NOT NULL` | None | `UNIQUE(user_id, brand_id, role)` | A user has distinct roles per brand |

---

#### 4. `staff_profiles`
*Purpose:* Specific operational attributes for staff members (faculty trainers, admission counselors, branch admins).
- **File Citations:**
  - Interface `StaffMember`: [`StaffManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/StaffManagement.tsx#L24-L35)
  - Dedicated Faculty View: [`TrainerLayout.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/TrainerLayout.tsx#L25-L42)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `staff_profile_id`| `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Profile surrogate PK |
| `user_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id) ON DELETE CASCADE` | Global user link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id) ON DELETE RESTRICT`| Brand tenancy |
| `staff_type` | `varchar(30)` | `NOT NULL` | None | CHECK `staff_type IN ('trainer', 'counselor', 'admin')` | `role: 'counselor' \| 'trainer'` |
| `specialization` | `varchar(200)` | `NOT NULL` | None | None | `'FullStack Python & Vernacular AI'` |
| `bio_summary` | `text` | `NULL` | None | None | Instructor profile details |
| `instructor_title`| `varchar(150)`| `NULL` | None | None | `'Head of Vernacular AI Curriculum'` |
| `is_available` | `boolean` | `NOT NULL` | `true` | None | Duty availability status |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |

---

#### 5. `student_profiles`
*Purpose:* Specific learner academic profile information, contact numbers, and parent/emergency contacts.
- **File Citations:**
  - Interface `StudentItem`: [`StudentManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/StudentManagement.tsx#L24-L37)
  - Enrolment Application: [`StudentEnrolment.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/StudentEnrolment.tsx#L33-L64)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `student_profile_id`| `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Student surrogate PK |
| `user_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id) ON DELETE CASCADE` | User account |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id) ON DELETE RESTRICT`| Tenant isolation |
| `student_roll_no`| `varchar(50)` | `NULL` | None | `UNIQUE(brand_id, student_roll_no)` | Roll/Admission number |
| `whatsapp_number`| `varchar(20)` | `NOT NULL` | None | E.164 format | Mobile / WhatsApp required |
| `city_or_region` | `varchar(100)` | `NULL` | None | None | Demographic location |
| `education_bg` | `varchar(150)` | `NULL` | None | None | Academic background |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Admission timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Profile updates |

---

#### 6. `permissions` & `role_permissions`
*Purpose:* Configurable role-permission access control matrix.
- **File Citations:**
  - Interface `PermissionItem`: [`types.ts`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/types.ts#L42-L52)
  - Matrix Component: [`RolePermissionManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/RolePermissionManagement.tsx#L13-L146)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `permission_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Surrogate PK |
| `code` | `varchar(100)` | `NOT NULL` | None | `UNIQUE` | `'MANAGE_ORGANIZATION_PROFILE'`, `'ISSUE_INVOICES'` |
| `module` | `varchar(100)` | `NOT NULL` | None | None | `'Platform Administration'`, `'Finance & Invoicing'` |
| `action_name` | `varchar(150)` | `NOT NULL` | None | None | `'Manage Organization Profile'` |
| `description` | `text` | `NOT NULL` | None | None | Full capability description |
| **`role_permissions`**| Junction Table | `NOT NULL` | None | `role_id/role_name`, `permission_id`, `is_granted` | Checkbox toggles in UI |

---

### Domain 02: Course Catalogue & Curriculum

#### 7. `courses`
*Purpose:* Academic programs offered by brands.
- **File Citations:**
  - Interface `CourseItem`: [`CourseManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/CourseManagement.tsx#L23-L34)
  - Interface `PitchCourse`: [`CoursePitchCatalogue.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/CoursePitchCatalogue.tsx#L19-L30)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `course_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Course internal PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | `crs-1`, `pc-1` |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | `brand: 'teluguai' \| 'genai99'` |
| `slug` | `varchar(100)` | `NOT NULL` | None | `UNIQUE(brand_id, slug)` | URL slug |
| `title` | `varchar(200)` | `NOT NULL` | None | None | `'FullStack Python & Vernacular AI Engineering'` |
| `category` | `varchar(100)` | `NOT NULL` | None | None | `'Full-Stack Development'`, `'Data Science & AI'` |
| `duration_weeks`| `integer` | `NOT NULL` | `12` | CHECK `duration_weeks > 0` | `'16 Weeks'`, `'12 Weeks'` |
| `base_fee` | `numeric(12,2)`| `NOT NULL` | `0.00` | CHECK `base_fee >= 0` | `fee: '₹ 24,999'`, `'$499'` |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | CHECK `currency IN ('INR', 'USD')` | `₹` for TeluguAI, `$` for GenAI99 |
| `status` | `varchar(20)` | `NOT NULL` | `'active'` | CHECK `status IN ('active', 'inactive')` | `status: 'active' \| 'inactive'` |
| `description` | `text` | `NULL` | None | None | Course prospectus description |
| `usps` | `jsonb` | `NOT NULL` | `'[]'::jsonb` | None | Array of bullet points in Pitch Guide |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |

---

#### 8. `course_modules`
*Purpose:* Structural syllabus chapters/units under a course.
- **File Citations:**
  - Interface `Module`: [`StudentCurriculum.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentCurriculum.tsx#L35-L41)
  - Sub-modules array: [`CourseManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/CourseManagement.tsx#L33)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `module_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Module PK |
| `course_id` | `bigint` | `NOT NULL` | None | `FK -> courses(course_id) ON DELETE CASCADE` | Course parent link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `module_number` | `integer` | `NOT NULL` | None | CHECK `module_number > 0` | `number: 1`, `number: 2` |
| `title` | `varchar(200)` | `NOT NULL` | None | None | `'Python Foundations & Computational Logic'` |
| `total_duration`| `varchar(50)` | `NULL` | None | None | `'8 Hours'`, `'10 Hours'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |
| *Composite* | Composite Unique | `NOT NULL` | None | `UNIQUE(course_id, module_number)` | Sequential module numbering |

---

#### 9. `course_lessons`
*Purpose:* Individual learning units, video lessons, and reading notes within a syllabus module.
- **File Citations:**
  - Interface `Lesson`: [`StudentCurriculum.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentCurriculum.tsx#L24-L33)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `lesson_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Lesson PK |
| `module_id` | `bigint` | `NOT NULL` | None | `FK -> course_modules(module_id) ON DELETE CASCADE`| Module parent link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `lesson_order` | `integer` | `NOT NULL` | `1` | CHECK `lesson_order > 0` | Lesson display order |
| `title` | `varchar(200)` | `NOT NULL` | None | None | `'Introduction to Python in Telugu'` |
| `duration_mins` | `integer` | `NOT NULL` | `45` | CHECK `duration_mins > 0` | `duration: '45 mins'` |
| `summary` | `text` | `NOT NULL` | None | UTF-8 Telugu supported | `'Conda environments explained in Telugu'` |
| `video_url` | `text` | `NULL` | None | None | `'https://play.teluguai.com/videos/python-intro'` |
| `code_snippet` | `text` | `NULL` | None | None | `print("నమస్కారం! Welcome to TeluguAI!")` |
| `notes_pdf_url` | `text` | `NULL` | None | None | `'https://storage.teluguai.com/notes/lesson-1.pdf'` |
| `is_preview` | `boolean` | `NOT NULL` | `false` | None | Free preview toggle |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |

---

#### 10. `learning_materials`
*Purpose:* Centralized files, slides, Jupyter notebooks, cheat sheets, and recordings linked to courses, modules, or batches.
- **File Citations:**
  - Interface `MaterialItem`: [`LearningMaterials.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/LearningMaterials.tsx#L24-L34)
  - Student Library: [`StudentMaterials.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentMaterials.tsx#L20-L30)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `material_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Material PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `course_id` | `bigint` | `NULL` | None | `FK -> courses(course_id)` | Associated course |
| `module_id` | `bigint` | `NULL` | None | `FK -> course_modules(module_id)` | Associated curriculum module |
| `batch_id` | `bigint` | `NULL` | None | `FK -> batches(batch_id)` | Target cohort |
| `title` | `varchar(255)` | `NOT NULL` | None | None | `'FastAPI Architecture & Telugu Code'` |
| `material_type` | `varchar(30)` | `NOT NULL` | None | CHECK `material_type IN ('slides', 'notebook', 'video', 'cheatsheet', 'code')` | UI Type filter |
| `storage_key` | `text` | `NOT NULL` | None | S3 Object Key or External URL | `linkUrl: 'https://storage...'` |
| `file_size_text`| `varchar(50)` | `NULL` | None | None | `'4.8 MB (PDF)'`, `'1.2 MB (.ipynb)'` |
| `uploaded_by` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Staff member uploader |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Upload date |

---

### Domain 03: Cohorts, Classes & Timetable

#### 11. `batches`
*Purpose:* Academic cohorts of students learning together on a timetable.
- **File Citations:**
  - Interface `BatchItem`: [`BatchManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/BatchManagement.tsx#L22-L34)
  - Interface `TrainerCohort`: [`TrainerBatches.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/TrainerBatches.tsx#L24-L38)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `batch_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Batch PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | `b-1`, `tc-1` |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `course_id` | `bigint` | `NOT NULL` | None | `FK -> courses(course_id)` | Associated course |
| `primary_trainer_id`| `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Faculty assigned (`trainer: 'Suresh Varma'`) |
| `name` | `varchar(150)` | `NOT NULL` | None | None | `'Python AI Evening Cohort #12'` |
| `schedule_days` | `varchar(100)` | `NOT NULL` | None | None | `'Mon - Fri'`, `'Sat & Sun'` |
| `timing_slot` | `varchar(100)` | `NOT NULL` | None | None | `'07:00 PM - 08:30 PM'` |
| `start_date` | `date` | `NOT NULL` | None | None | `startDate: '01 Oct 2026'` |
| `end_date` | `date` | `NULL` | None | None | Projected conclusion date |
| `max_capacity` | `integer` | `NOT NULL` | `50` | CHECK `max_capacity > 0` | `capacity: 50` |
| `meeting_room_url`| `text` | `NULL` | None | None | `roomUrl: 'https://meet.google.com/...'` |
| `status` | `varchar(20)` | `NOT NULL` | `'pending'` | CHECK `status IN ('pending', 'active', 'completed', 'archived')` | `status: 'active' \| 'pending'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Creation timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Update timestamp |

---

#### 12. `class_sessions`
*Purpose:* Scheduled live lecture sessions, online meeting links, and recorded replays.
- **File Citations:**
  - Interface `ClassSession`: [`ClassSchedule.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/ClassSchedule.tsx#L23-L37)
  - Interface `LiveSessionItem`: [`StudentLiveClasses.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentLiveClasses.tsx#L21-L34)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `class_session_id`| `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Session PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | `sess-101`, `ls-1` |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `batch_id` | `bigint` | `NOT NULL` | None | `FK -> batches(batch_id) ON DELETE CASCADE`| Cohort parent link |
| `trainer_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Hosting instructor |
| `topic` | `varchar(255)` | `NOT NULL` | None | None | `'FastAPI Integration & Telugu Prompts'` |
| `scheduled_start`| `timestamptz` | `NOT NULL` | None | None | Session date & start time |
| `scheduled_end` | `timestamptz` | `NOT NULL` | None | CHECK `scheduled_end > scheduled_start` | Session conclusion time |
| `duration_mins` | `integer` | `NOT NULL` | `90` | None | `duration: '90 mins'` |
| `meeting_url` | `text` | `NOT NULL` | None | None | `'https://meet.google.com/xyz-telugu-ai'` |
| `recording_url` | `text` | `NULL` | None | None | Replay video URL |
| `notes_url` | `text` | `NULL` | None | None | Session PDF notes |
| `expected_attendees`| `integer`| `NOT NULL` | `0` | None | `attendeesExpected: 48` |
| `status` | `varchar(20)` | `NOT NULL` | `'upcoming'` | CHECK `status IN ('upcoming', 'live', 'completed', 'cancelled')` | `status: 'upcoming' \| 'completed' \| 'cancelled'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |

---

#### 13. `class_attendance`
*Purpose:* Granular presence ledger tracking each student's attendance per class session.
- **File Citations:**
  - Interface `StudentAttendanceRecord`: [`AttendanceMarker.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/AttendanceMarker.tsx#L22-L29)
  - Interface `AttendanceRecord`: [`AttendanceManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/AttendanceManagement.tsx#L21-L27)
  - Interface `AttendanceSession`: [`StudentAttendance.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentAttendance.tsx#L21-L28)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `attendance_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Attendance PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `class_session_id`| `bigint` | `NOT NULL` | None | `FK -> class_sessions(class_session_id)`| Session reference |
| `student_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Learner user link |
| `status` | `varchar(20)` | `NOT NULL` | None | CHECK `status IN ('present', 'late', 'absent')` | `status: 'present' \| 'late' \| 'absent'` |
| `joined_at` | `timestamptz` | `NULL` | None | None | `joinedAt: '07:01 PM'` |
| `marked_by` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Trainer/Admin who marked |
| `remarks` | `text` | `NULL` | None | None | Notes on late entry/absence |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Marked timestamp |
| *Composite* | Composite Unique | `NOT NULL` | None | `UNIQUE(class_session_id, student_id)` | One entry per student per class |

---

### Domain 04: Admissions CRM & Inquiries

#### 14. `leads`
*Purpose:* Prospective candidate inquiries and admission CRM pipeline records.
- **File Citations:**
  - Interface `LeadRecord`: [`LeadManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/LeadManagement.tsx#L24-L35)
  - Interface `PipelineLead`: [`LeadPipeline.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/LeadPipeline.tsx#L21-L30)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `lead_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Lead PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | `ldr-1`, `p-1` |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `name` | `varchar(150)` | `NOT NULL` | None | None | Candidate full name |
| `phone` | `varchar(20)` | `NOT NULL` | None | E.164 format | Phone / WhatsApp |
| `email` | `citext` | `NULL` | None | None | Candidate email |
| `interested_course_id`| `bigint`| `NULL` | None | `FK -> courses(course_id)` | Course of interest |
| `assigned_counselor_id`| `bigint`| `NULL` | None | `FK -> users(user_id)` | Counselor assigned |
| `source` | `varchar(50)` | `NOT NULL` | `'Website'` | CHECK `source IN ('Website', 'WhatsApp Inbound', 'Referral', 'Meta Ads', 'Google Search', 'LinkedIn')` | UI Lead sources |
| `funnel_stage` | `varchar(30)` | `NOT NULL` | `'new'` | CHECK `funnel_stage IN ('new', 'discussion', 'counseling_done', 'payment_pending', 'enrolled', 'lost')` | Kanban stages |
| `fee_quoted` | `numeric(12,2)`| `NULL` | None | None | Fee interest amount |
| `discussion_notes`| `text` | `NULL` | None | None | Conversation notes |
| `converted_student_id`| `bigint`| `NULL` | None | `FK -> users(user_id)` | Conversion traceability |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Inquiry timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Last update |

---

#### 15. `lead_stage_history`
*Purpose:* Audit trail of funnel stage transitions for counselor performance metrics.
- **File Citations:**
  - Stage advance logic: [`LeadPipeline.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/LeadPipeline.tsx#L58-L67)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `stage_history_id`| `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | History PK |
| `lead_id` | `bigint` | `NOT NULL` | None | `FK -> leads(lead_id) ON DELETE CASCADE` | Lead link |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `from_stage` | `varchar(30)` | `NULL` | None | Stage enum | Previous funnel stage |
| `to_stage` | `varchar(30)` | `NOT NULL` | None | Stage enum | Advanced funnel stage |
| `changed_by` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Counselor actor |
| `transition_notes`| `text` | `NULL` | None | None | Disposition remarks |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Stage move timestamp |

---

### Domain 05: Student Enrolment Lifecycle

#### 16. `enrolments`
*Purpose:* Official binding between an admitted student, a course, and a specific cohort batch.
- **File Citations:**
  - Enrolment Application: [`StudentEnrolment.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/StudentEnrolment.tsx#L68-L90)
  - Student Directory: [`StudentManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/StudentManagement.tsx#L40-L75)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `enrolment_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Enrolment PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | `enr-1`, `std-1` |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `student_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Enrolled learner |
| `course_id` | `bigint` | `NOT NULL` | None | `FK -> courses(course_id)` | Program enrolled |
| `batch_id` | `bigint` | `NOT NULL` | None | `FK -> batches(batch_id)` | Cohort assigned |
| `enrolled_by` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Counselor/Admin processor |
| `enrolment_date` | `date` | `NOT NULL` | `CURRENT_DATE` | None | `enrolledDate: '28 Sep 2026'` |
| `status` | `varchar(20)` | `NOT NULL` | `'active'` | CHECK `status IN ('active', 'completed', 'dropped', 'suspended')` | Access status |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Transaction timestamp |
| *Constraint* | Unique Active Enrolment | `NOT NULL` | None | `UNIQUE(student_id, batch_id)` | Student cannot duplicate cohort |

---

### Domain 06: Tuition Finance & Invoicing

#### 17. `fee_plans`
*Purpose:* Pre-defined pricing models (Full Upfront with discount vs Multi-Part Installments).
- **File Citations:**
  - Fee Plan Selector: [`StudentEnrolment.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/StudentEnrolment.tsx#L201-L212)
  - Pitch Pricing: [`CoursePitchCatalogue.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/CoursePitchCatalogue.tsx#L25-L27)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `fee_plan_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Fee plan PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `course_id` | `bigint` | `NOT NULL` | None | `FK -> courses(course_id)` | Associated course |
| `plan_name` | `varchar(100)` | `NOT NULL` | None | None | `'Full Upfront (Discounted)'`, `'2 Installments'` |
| `plan_type` | `varchar(20)` | `NOT NULL` | `'full'` | CHECK `plan_type IN ('full', 'installment')` | `feePlan: 'full' \| 'installment'` |
| `total_amount` | `numeric(12,2)`| `NOT NULL` | None | CHECK `total_amount > 0` | Price value |
| `installments_count`| `integer` | `NOT NULL` | `1` | CHECK `installments_count >= 1` | Number of installments |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |

---

#### 18. `invoices`
*Purpose:* Billed tuition invoices with snapshot pricing at the time of issue.
- **File Citations:**
  - Interface `InvoiceItem`: [`FeeManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/FeeManagement.tsx#L22-L32)
  - Student Ledger: [`StudentFees.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentFees.tsx#L35-L54)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `invoice_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Invoice PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | External ID |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `enrolment_id` | `bigint` | `NOT NULL` | None | `FK -> enrolments(enrolment_id)` | Enrolment binding |
| `student_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Billed learner |
| `invoice_number`| `varchar(50)` | `NOT NULL` | None | `UNIQUE(brand_id, invoice_number)` | `INV-TA-2026-081`, `INV-G99-2026-042` |
| `billed_amount` | `numeric(12,2)`| `NOT NULL` | None | CHECK `billed_amount > 0` | `amount: '₹ 24,999'` |
| `paid_amount` | `numeric(12,2)`| `NOT NULL` | `0.00` | CHECK `paid_amount >= 0` | `paidAmount: '₹ 15,000'` |
| `balance_due` | `numeric(12,2)`| `NOT NULL` | None | CHECK `balance_due >= 0` | Calculated balance remaining |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | CHECK `currency IN ('INR', 'USD')` | Currency symbol mapping |
| `due_date` | `date` | `NOT NULL` | None | None | `dueDate: '25 Oct 2026'` |
| `status` | `varchar(20)` | `NOT NULL` | `'Pending'` | CHECK `status IN ('Paid', 'Partial', 'Pending', 'Overdue')` | `status: 'Paid' \| 'Partial' \| 'Pending'` |
| `issued_by` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Admin/Counselor issuer |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Issue timestamp |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | System timestamp |

---

#### 19. `payments` & `payment_transactions`
*Purpose:* Append-only financial ledger of money collected, receipts, and gateway webhook verification events.
- **File Citations:**
  - Interface `PaymentReceipt`: [`StudentFees.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentFees.tsx#L21-L30)
  - Interface `PaymentRecord`: [`PaymentStatus.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/PaymentStatus.tsx#L19-L30)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `payment_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Payment PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | `rc-1`, `pay-1` |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `invoice_id` | `bigint` | `NOT NULL` | None | `FK -> invoices(invoice_id)` | Invoice reference |
| `receipt_number`| `varchar(50)` | `NOT NULL` | None | `UNIQUE(brand_id, receipt_number)` | `REC-TAI-2026-081`, `REC-G99-2026-402` |
| `amount` | `numeric(12,2)`| `NOT NULL` | None | CHECK `amount > 0` | Money received |
| `currency` | `varchar(3)` | `NOT NULL` | `'INR'` | CHECK `currency IN ('INR', 'USD')` | Indian Rupee / US Dollar |
| `payment_mode` | `varchar(30)` | `NOT NULL` | None | CHECK `payment_mode IN ('UPI', 'Credit Card', 'NetBanking', 'Stripe', 'Bank NEFT', 'Cash')` | Payment methods in UI |
| `gateway_transaction_id`| `varchar(150)`| `NOT NULL` | None | `UNIQUE` (Idempotency) | `UPI/6291823901/PAYTM`, `pay_O8294719284` |
| `status` | `varchar(20)` | `NOT NULL` | `'SUCCESS'` | CHECK `status IN ('SUCCESS', 'FAILED', 'REFUNDED')` | `status: 'SUCCESS'` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Payment date |

---

### Domain 07: Assessments & Evaluation

#### 20. `assignments`
*Purpose:* Homework projects, coding tasks, and capstones published by trainers.
- **File Citations:**
  - Interface `AssignmentItem`: [`AssignmentManager.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/AssignmentManager.tsx#L23-L36)
  - Student Assignment View: [`StudentAssignments.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentAssignments.tsx#L21-L34)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `assignment_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Assignment PK |
| `public_id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | UI identifier |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `batch_id` | `bigint` | `NOT NULL` | None | `FK -> batches(batch_id) ON DELETE CASCADE`| Cohort parent |
| `title` | `varchar(200)` | `NOT NULL` | None | None | `'Telugu Voice Assistant with Whisper & FastAPI'` |
| `instructions` | `text` | `NOT NULL` | None | None | Markdown guidelines & requirements |
| `starter_repo_url`| `text` | `NULL` | None | None | GitHub template repository URL |
| `max_score` | `integer` | `NOT NULL` | `100` | CHECK `max_score > 0` | `maxScore: 100` |
| `due_date` | `timestamptz` | `NOT NULL` | None | None | `dueDate: string` |
| `status` | `varchar(20)` | `NOT NULL` | `'active'` | CHECK `status IN ('active', 'reviewing', 'closed')` | `status: 'active' \| 'reviewing' \| 'closed'` |
| `created_by` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Trainer author |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Authoring date |

---

#### 21. `assignment_submissions`
*Purpose:* Student repo submissions, code review marks, and qualitative feedback.
- **File Citations:**
  - Interface `StudentSubmission`: [`SubmissionsGrading.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/SubmissionsGrading.tsx#L24-L38)
  - Student Submission: [`StudentAssignments.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentAssignments.tsx#L21-L34)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `submission_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Submission PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `assignment_id` | `bigint` | `NOT NULL` | None | `FK -> assignments(assignment_id) ON DELETE CASCADE`| Assignment link |
| `student_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Student author |
| `repo_url` | `text` | `NOT NULL` | None | None | `'https://github.com/saikiran-dev/...'` |
| `student_notes` | `text` | `NULL` | None | None | Implementation notes submitted by student |
| `score` | `numeric(5,2)` | `NULL` | None | CHECK `score >= 0` | Graded marks (e.g. `96.00`) |
| `feedback` | `text` | `NULL` | None | None | Qualitative trainer critique |
| `status` | `varchar(20)` | `NOT NULL` | `'pending'` | CHECK `status IN ('pending', 'graded', 'resubmit')` | `status: 'pending' \| 'graded' \| 'resubmit'` |
| `graded_by` | `bigint` | `NULL` | None | `FK -> users(user_id)` | Grading trainer |
| `submitted_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Submission timestamp |
| `graded_at` | `timestamptz` | `NULL` | None | None | Evaluation timestamp |

---

#### 22. `quizzes`, `quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`
*Purpose:* Multiple choice assessment engine, question banks, student attempts, and frozen answer evaluation.
- **File Citations:**
  - Interfaces `QuizItem`, `Question`: [`QuizBuilder.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/QuizBuilder.tsx#L23-L42)
  - Student Taking Engine: [`StudentQuizzes.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentQuizzes.tsx#L20-L37)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| **`quizzes`** | | | | | |
| `quiz_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Quiz PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `batch_id` | `bigint` | `NULL` | None | `FK -> batches(batch_id)` | Target cohort |
| `title` | `varchar(200)` | `NOT NULL` | None | None | `'FastAPI & Pydantic Mid-Term'` |
| `duration_minutes`| `integer` | `NOT NULL` | `30` | CHECK `duration_minutes > 0` | `durationMinutes: 30` |
| `pass_percentage`| `integer` | `NOT NULL` | `70` | CHECK `pass_percentage BETWEEN 1 AND 100` | `passPercentage: 70` |
| `status` | `varchar(20)` | `NOT NULL` | `'draft'` | CHECK `status IN ('draft', 'active', 'archived')` | `status: 'active' \| 'draft'` |
| **`quiz_questions`**| | | | | |
| `question_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Question PK |
| `quiz_id` | `bigint` | `NOT NULL` | None | `FK -> quizzes(quiz_id) ON DELETE CASCADE` | Parent quiz |
| `question_text` | `text` | `NOT NULL` | None | UTF-8 supported | Multi-lingual question text |
| `options` | `jsonb` | `NOT NULL` | None | Array of 4 string options | `options: ['List', 'Dictionary', 'Set', 'Tuple']` |
| `correct_option_index`| `smallint`| `NOT NULL` | None | CHECK `correct_option_index BETWEEN 0 AND 3` | `correctOptionIndex: 2` |
| **`quiz_attempts`** | | | | | |
| `attempt_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Attempt PK |
| `quiz_id` | `bigint` | `NOT NULL` | None | `FK -> quizzes(quiz_id)` | Quiz taken |
| `student_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Student test taker |
| `score_percent` | `numeric(5,2)` | `NOT NULL` | None | CHECK `score_percent BETWEEN 0 AND 100` | Evaluated score percentage |
| `is_passed` | `boolean` | `NOT NULL` | None | None | `scorePercent >= passPercentage` |
| `submitted_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Exam submission time |
| **`quiz_attempt_answers`**| | | | | |
| `attempt_id` | `bigint` | `NOT NULL` | None | `FK -> quiz_attempts(attempt_id) ON DELETE CASCADE` | Attempt reference |
| `question_id` | `bigint` | `NOT NULL` | None | `FK -> quiz_questions(question_id)` | Question answered |
| `selected_option_index`| `smallint`| `NOT NULL` | None | CHECK `selected_option_index BETWEEN 0 AND 3` | Student choice |
| `is_correct` | `boolean` | `NOT NULL` | None | None | Computed correctness |

---

### Domain 08: Progress & Digital Credentials

#### 23. `certificates` & `certificate_templates`
*Purpose:* Official verifiable graduation certificates issued to students satisfying all benchmarks.
- **File Citations:**
  - Graduation Benchmark & SVG Certificate: [`StudentCertificates.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentCertificates.tsx#L28-L135)
  - Issue Certificate Button: [`StudentProgressReports.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/StudentProgressReports.tsx#L31-L33)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `certificate_id`| `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Certificate PK |
| `public_code` | `varchar(50)` | `NOT NULL` | None | `UNIQUE` | `CERT-TAI-8921`, `CERT-G99-4412` |
| `verification_uuid`| `uuid` | `NOT NULL` | `gen_random_uuid()` | `UNIQUE` | Cryptographic public verify URL |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `enrolment_id` | `bigint` | `NOT NULL` | None | `FK -> enrolments(enrolment_id)` | `UNIQUE(enrolment_id)` (1 cert per enrolment) |
| `student_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Graduated learner |
| `course_id` | `bigint` | `NOT NULL` | None | `FK -> courses(course_id)` | Completed program |
| `issue_date` | `date` | `NOT NULL` | `CURRENT_DATE` | None | `issueDate: '15 October 2026'` |
| `instructor_name`| `varchar(150)`| `NOT NULL` | None | None | `'Ravi Teja'`, `'Karthik Raman'` |
| `skills_certified`| `jsonb` | `NOT NULL` | `'[]'::jsonb` | None | `skills: ['Python 3.11', 'FastAPI', 'Whisper']` |
| `pdf_storage_key`| `text` | `NULL` | None | None | S3 storage key for vector PDF |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Issuance audit |

---

### Domain 09: Communications & Broadcasts

#### 24. `announcements`
*Purpose:* Branch and campus broadcast notices published to active batches and displayed on student dashboards.
- **File Citations:**
  - Interface `AnnouncementItem`: [`Announcements.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/Announcements.tsx#L18-L26)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `announcement_id`| `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Announcement PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `author_id` | `bigint` | `NOT NULL` | None | `FK -> users(user_id)` | Admin author |
| `title` | `varchar(255)` | `NOT NULL` | None | None | `'Guest Lecture on Scalable AI'` |
| `content` | `text` | `NOT NULL` | None | UTF-8 supported | Full announcement notice |
| `target_audience`| `varchar(100)`| `NOT NULL` | `'All Active Batches'`| None | `'All Active Batches'`, `'All Students & Trainers'` |
| `batch_id` | `bigint` | `NULL` | None | `FK -> batches(batch_id)` | Optional targeted cohort |
| `via_whatsapp` | `boolean` | `NOT NULL` | `false` | None | `viaWhatsApp: true` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Broadcast timestamp |

---

#### 25. `whatsapp_templates` & `whatsapp_messages`
*Purpose:* Meta Cloud API approved templates, outgoing SMS/WhatsApp message queue, and delivery logs.
- **File Citations:**
  - Interface `WhatsAppTemplate`: [`types.ts`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/types.ts#L54-L63)
  - Integration Console: [`WhatsAppIntegration.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/WhatsAppIntegration.tsx#L15-L56)
  - Absentee Alert Dispatcher: [`AttendanceMarker.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/AttendanceMarker.tsx#L83-L93)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| **`whatsapp_templates`**| | | | | |
| `template_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Template PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `name` | `varchar(100)` | `NOT NULL` | None | `UNIQUE(brand_id, name)` | `lead_welcome`, `fee_receipt`, `class_reminder` |
| `category` | `varchar(30)` | `NOT NULL` | None | CHECK `category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')` | Meta categories |
| `language` | `varchar(20)` | `NOT NULL` | `'en'` | None | `'English'`, `'te'` (Telugu) |
| `preview_text` | `text` | `NOT NULL` | None | Parameterized template text | `'Hello {{1}}! Your payment of {{2}} is confirmed.'` |
| `status` | `varchar(20)` | `NOT NULL` | `'PENDING'` | CHECK `status IN ('APPROVED', 'PENDING', 'REJECTED')` | `status: 'APPROVED'` |
| **`whatsapp_messages`**| | | | | |
| `message_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Message log PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `template_id` | `bigint` | `NULL` | None | `FK -> whatsapp_templates(template_id)`| Template referenced |
| `recipient_phone`| `varchar(20)`| `NOT NULL` | None | E.164 format | Destination phone number |
| `recipient_user_id`| `bigint` | `NULL` | None | `FK -> users(user_id)` | Optional linked user |
| `rendered_body` | `text` | `NOT NULL` | None | None | Fully interpolated message text |
| `provider_message_id`| `varchar(100)`| `NULL`| None | None | Meta WAMID |
| `delivery_status`| `varchar(30)`| `NOT NULL` | `'SENT'` | CHECK `delivery_status IN ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')` | Delivery tracking |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Dispatch timestamp |

---

### Domain 10: Platform Ops, Security & Audit

#### 26. `system_settings`
*Purpose:* Centralized brand-level and platform-wide API credentials, payment keys, storage buckets, and security settings.
- **File Citations:**
  - Settings State: [`PlatformSettings.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/PlatformSettings.tsx#L17-L23)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `setting_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` | Setting PK |
| `brand_id` | `bigint` | `NULL` | None | `FK -> brands(brand_id)` (NULL = platform-wide) | Tenant override |
| `setting_group` | `varchar(50)` | `NOT NULL` | None | CHECK `setting_group IN ('payments', 'storage', 'email', 'security', 'whatsapp')` | Tab categories |
| `setting_key` | `varchar(100)` | `NOT NULL` | None | None | `razorpay_key_id`, `stripe_public_key`, `s3_bucket` |
| `setting_value` | `text` | `NOT NULL` | None | Sensitive keys encrypted | Value string / JSON |
| `is_secret` | `boolean` | `NOT NULL` | `false` | None | Flags encryption necessity |
| `updated_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Modification timestamp |
| *Composite* | Composite Unique | `NOT NULL` | None | `UNIQUE(brand_id, setting_group, setting_key)` | Unique setting key per tenant |

---

#### 27. `audit_logs`
*Purpose:* Append-only security audit trail recording all privileged actions and administrative events across both brands.
- **File Citations:**
  - Interface `AuditLogEntry`: [`types.ts`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/types.ts#L65-L77)
  - Audit Trail Table: [`AuditLogsHealth.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/AuditLogsHealth.tsx#L19-L80)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `audit_log_id` | `bigint` (Identity) | `NOT NULL` | Auto-generated | `PRIMARY KEY` (Partition key composite) | Audit PK |
| `brand_id` | `bigint` | `NULL` | None | `FK -> brands(brand_id)` (NULL = Platform) | `'TeluguAI'`, `'GenAI99'`, `'Platform'` |
| `actor_user_id`| `bigint` | `NULL` | None | `FK -> users(user_id)` | Actor user account |
| `actor_name` | `varchar(150)` | `NOT NULL` | None | None | `'Suresh Varma'`, `'System Webhook'` |
| `actor_role` | `varchar(30)` | `NOT NULL` | None | Role string | `role: 'super_admin' \| 'admin'` |
| `action` | `varchar(100)` | `NOT NULL` | None | None | `'CREATE_ADMIN'`, `'PAYMENT_RECEIVED'` |
| `entity_name` | `varchar(100)` | `NOT NULL` | None | None | `'users:kavitha'`, `'settings:meta_api'` |
| `ip_address` | `inet` | `NOT NULL` | None | Valid IPv4/IPv6 | `'106.51.72.19'`, `'54.187.205.12'` |
| `status` | `varchar(20)` | `NOT NULL` | `'SUCCESS'` | CHECK `status IN ('SUCCESS', 'WARNING', 'FAILED')` | `status: 'SUCCESS' \| 'WARNING' \| 'FAILED'` |
| `event_details` | `jsonb` | `NOT NULL` | `'{}'::jsonb` | Formatted payload | `{"gateway": "meta_cloud", "waba_id": "..."}` |
| `created_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | Partition Boundary column | Timestamp of security event |

---

#### 28. `webhook_events`
*Purpose:* Idempotent ledger for incoming asynchronous events from payment gateways (Razorpay, Stripe) and WhatsApp webhooks.
- **File Citations:**
  - Webhook URL Config: [`WhatsAppIntegration.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/WhatsAppIntegration.tsx#L61)
  - System Webhook Audit: [`AuditLogsHealth.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/AuditLogsHealth.tsx#L59-L67)

| Attribute Name | Inferred PostgreSQL Type | Nullable | Default | Constraints & Enums | Source Evidence in Code |
|---|---|---|---|---|---|
| `webhook_event_id`| `bigint` (Identity)| `NOT NULL` | Auto-generated | `PRIMARY KEY` | Webhook event PK |
| `brand_id` | `bigint` | `NOT NULL` | None | `FK -> brands(brand_id)` | Tenant isolation |
| `provider` | `varchar(50)` | `NOT NULL` | None | CHECK `provider IN ('razorpay', 'stripe', 'meta_whatsapp')` | Gateway source |
| `idempotency_key`| `varchar(200)`| `NOT NULL` | None | `UNIQUE(provider, idempotency_key)` | Duplicate event prevention |
| `event_type` | `varchar(100)` | `NOT NULL` | None | None | `payment.captured`, `messages.delivered` |
| `payload` | `jsonb` | `NOT NULL` | None | Raw event body | Raw JSON payload |
| `processing_status`| `varchar(30)`| `NOT NULL` | `'PENDING'` | CHECK `processing_status IN ('PENDING', 'PROCESSED', 'FAILED', 'IGNORED')` | Processing state |
| `error_message` | `text` | `NULL` | None | None | Stack trace if processing failed |
| `received_at` | `timestamptz` | `NOT NULL` | `clock_timestamp()` | None | Webhook arrival timestamp |
| `processed_at` | `timestamptz` | `NULL` | None | None | Completion timestamp |

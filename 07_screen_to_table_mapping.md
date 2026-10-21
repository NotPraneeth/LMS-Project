# Screen-to-Table Mapping & Data Lineage
**Project:** Shared Multi-Brand LMS & Admissions CRM (`TeluguAI.com` & `GenAI99.com`)  
**Scope:** Exhaustive CRUD Lineage Mapping for Every UI Screen, Form, and Action  
**Target Engine:** PostgreSQL 16+  
**Document Code:** `/database/07_screen_to_table_mapping.md`

---

## 1. Screen-to-Table Mapping Matrix

### 1.1 Shared Portal Screens

| Screen Name | UI Component File | Read Operations (SELECT) | Write Operations (INSERT / UPDATE) | Notes & Data Flows |
|---|---|---|---|---|
| **Unified Login** | [`CommonLogin.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/shared/CommonLogin.tsx) | `users(user_id, email, password_hash, full_name, status)`<br>`user_brand_access(brand_id)`<br>`user_roles(role, brand_id)`<br>`brands(brand_id, slug, name, status)` | `users(last_active_at)` [UPDATE]<br>`user_sessions(session_id, user_id, token_hash, ip_address, expires_at)` [INSERT]<br>`audit_logs` [INSERT] | Validates credentials, verifies tenant access, generates session token, logs authentication event. |
| **Global Session Top Bar** | [`page.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/app/page.tsx) | `users(full_name)`<br>`user_roles(role)`<br>`brands(name, slug, primary_color)` | `user_sessions` [DELETE on logout]<br>`audit_logs` [INSERT on logout] | Renders breadcrumbs and manages active session destruction. |

---

### 1.2 Super Admin Portal Screens

| Screen Name | UI Component File | Read Operations (SELECT) | Write Operations (INSERT / UPDATE) | Notes & Data Flows |
|---|---|---|---|---|
| **Platform Dashboard** | [`PlatformDashboard.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/PlatformDashboard.tsx) | `brands(brand_id, name, slug)`<br>`users(COUNT by role)`<br>`batches(COUNT, status)`<br>`invoices(SUM(paid_amount))` | None (Read-only aggregation) | High-level KPI aggregations filtered by selected brand or platform-wide. |
| **Admins & Staff Management** | [`PlatformUserManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/PlatformUserManagement.tsx) | `users(user_id, full_name, email, phone, status, last_active_at)`<br>`user_roles(role, department, brand_id)`<br>`brands(name, slug)` | `users(user_id, email, phone, password_hash, full_name, status)` [INSERT / UPDATE]<br>`user_brand_access` [INSERT]<br>`user_roles` [INSERT / UPDATE]<br>`staff_profiles` [INSERT / UPDATE]<br>`audit_logs` [INSERT] | Provisions staff accounts, assigns roles, toggles account suspension, resets credentials. |
| **Roles & Permissions Matrix** | [`RolePermissionManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/RolePermissionManagement.tsx) | `permissions(permission_id, code, module, action_name, description)`<br>`role_permissions(role, permission_id, is_granted)` | `role_permissions(is_granted, updated_at)` [UPDATE / UPSERT]<br>`audit_logs` [INSERT] | Matrix updates for 12 system permissions across 5 roles. |
| **Brand Profile Management** | [`BrandManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/BrandManagement.tsx) | `brands(brand_id, slug, name, domain, logo_text, tagline, support_email, status)` | `brands(name, domain, tagline, support_email, status, updated_at)` [UPDATE]<br>`audit_logs` [INSERT] | Organization settings and domain configuration. |
| **WhatsApp & SMS Integration** | [`WhatsAppIntegration.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/WhatsAppIntegration.tsx) | `system_settings(setting_key, setting_value)` WHERE group = 'whatsapp'<br>`whatsapp_templates(template_id, name, category, language, preview_text, status)` | `system_settings` [UPDATE / UPSERT]<br>`whatsapp_templates` [INSERT / UPDATE]<br>`whatsapp_messages` [INSERT on test send]<br>`audit_logs` [INSERT] | Configures Meta Cloud API credentials, tests outbound messages, synchronizes templates. |
| **Platform Settings & API Keys** | [`PlatformSettings.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/PlatformSettings.tsx) | `system_settings(setting_group, setting_key, setting_value)` | `system_settings(setting_value, updated_at)` [UPDATE / UPSERT]<br>`audit_logs` [INSERT] | Stores encrypted Razorpay/Stripe keys, S3 buckets, SMTP relays, and 2FA policies. |
| **Audit Logs & Health Monitor** | [`AuditLogsHealth.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/superadmin/AuditLogsHealth.tsx) | `audit_logs(audit_log_id, created_at, actor_name, actor_role, action, entity_name, ip_address, status, event_details)` | None (Read-only audit inspector) | Security event monitoring and JSON modal payload inspection. |

---

### 1.3 Branch Admin Portal Screens

| Screen Name | UI Component File | Read Operations (SELECT) | Write Operations (INSERT / UPDATE) | Notes & Data Flows |
|---|---|---|---|---|
| **Branch Dashboard** | [`AdminDashboard.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/AdminDashboard.tsx) | `batches(COUNT, name, timing_slot)`<br>`enrolments(COUNT)`<br>`class_sessions(topic, scheduled_start, meeting_url)`<br>`invoices(SUM(paid_amount))` | None (Read-only dashboard) | Branch KPIs, today's lecture timetable, operational quick actions. |
| **Courses & Curriculum** | [`CourseManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/CourseManagement.tsx) | `courses(course_id, title, category, duration_weeks, base_fee, currency, status)`<br>`course_modules(module_id, module_number, title)`<br>`course_lessons(COUNT)` | `courses(title, slug, category, duration_weeks, base_fee, currency, status)` [INSERT / UPDATE]<br>`course_modules(title, module_number)` [INSERT]<br>`audit_logs` [INSERT] | Course authoring, module configuration, status toggles. |
| **Batches & Timetable** | [`BatchManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/BatchManagement.tsx) | `batches(batch_id, name, schedule_days, timing_slot, start_date, max_capacity, status)`<br>`courses(title)`<br>`users(full_name)` [trainer]<br>`enrolments(COUNT)` | `batches(name, course_id, primary_trainer_id, schedule_days, timing_slot, start_date, max_capacity, status)` [INSERT / UPDATE]<br>`audit_logs` [INSERT] | Cohort creation and trainer assignment. |
| **Student Directory** | [`StudentManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/StudentManagement.tsx) | `users(user_id, full_name, email, phone)`<br>`student_profiles(student_roll_no, whatsapp_number)`<br>`enrolments(enrolment_id, enrolment_date, status)`<br>`courses(title)`<br>`batches(name)`<br>`invoices(status, billed_amount, paid_amount)`<br>`course_progress(attendance_rate)` | `users` [INSERT / UPDATE]<br>`student_profiles` [INSERT / UPDATE]<br>`enrolments` [INSERT / UPDATE]<br>`invoices` [INSERT]<br>`audit_logs` [INSERT] | Student roster, fee status filtering, manual student provisioning. |
| **Staff & Faculty** | [`StaffManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/StaffManagement.tsx) | `users(user_id, full_name, email, phone)`<br>`staff_profiles(staff_type, specialization, is_active)`<br>`batches(COUNT assigned)`<br>`leads(COUNT assigned)` | `users` [INSERT / UPDATE]<br>`staff_profiles` [INSERT / UPDATE]<br>`audit_logs` [INSERT] | Staff roster, workload overview, faculty provisioning. |
| **Attendance Tracker** | [`AttendanceManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/AttendanceManagement.tsx) | `batches(batch_id, name)`<br>`class_sessions(class_session_id, scheduled_start)`<br>`class_attendance(attendance_id, student_id, status, joined_at)`<br>`users(full_name, email)` | `class_attendance(status, marked_by, updated_at)` [UPDATE / UPSERT]<br>`whatsapp_messages` [INSERT on absentee alert]<br>`audit_logs` [INSERT] | Presence monitoring, status override, absentee notification triggers. |
| **Fees & Invoicing Desk** | [`FeeManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/FeeManagement.tsx) | `invoices(invoice_id, invoice_number, billed_amount, paid_amount, due_date, status, currency)`<br>`users(full_name)` [student]<br>`courses(title)`<br>`payments(receipt_number, amount, payment_mode, created_at)` | `invoices` [INSERT manual bill]<br>`payments` [INSERT manual receipt]<br>`invoices(paid_amount, balance_due, status)` [UPDATE]<br>`audit_logs` [INSERT] | Invoice generation, offline payment recording, tax receipt preview. |
| **Announcements** | [`Announcements.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/admin/Announcements.tsx) | `announcements(announcement_id, title, content, target_audience, via_whatsapp, created_at)` | `announcements(title, content, target_audience, batch_id, via_whatsapp, author_id)` [INSERT]<br>`whatsapp_messages` [INSERT if via_whatsapp]<br>`audit_logs` [INSERT] | Notice authoring and automated WhatsApp broadcast dispatch. |

---

### 1.4 Admissions Counselor Portal Screens

| Screen Name | UI Component File | Read Operations (SELECT) | Write Operations (INSERT / UPDATE) | Notes & Data Flows |
|---|---|---|---|---|
| **Counselor Dashboard** | [`CounselorDashboard.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/CounselorDashboard.tsx) | `leads(COUNT by stage, assigned_counselor_id)`<br>`enrolments(COUNT closed MTD)`<br>`lead_notes(note_text, created_at)` | None (Read-only funnel metrics) | Daily follow-up calling list, conversion KPIs. |
| **Admissions Pipeline** | [`LeadPipeline.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/LeadPipeline.tsx) | `leads(lead_id, name, phone, interested_course_id, funnel_stage, source, fee_quoted)`<br>`courses(title)` | `leads(funnel_stage, updated_at)` [UPDATE]<br>`lead_stage_history(lead_id, from_stage, to_stage, changed_by)` [INSERT] | Kanban stage progression from inquiry to enrolled. |
| **Leads Directory & Log**| [`LeadManagement.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/LeadManagement.tsx) | `leads(lead_id, name, email, phone, interested_course_id, source, funnel_stage, created_at, discussion_notes)`<br>`courses(title)`<br>`lead_notes(note_text, created_at, author_id)` | `leads` [INSERT new lead]<br>`leads(discussion_notes, updated_at)` [UPDATE]<br>`lead_notes(lead_id, author_id, note_text)` [INSERT]<br>`audit_logs` [INSERT] | Candidate intake, disposition logging, transfer to enrolment. |
| **Course Pitch Guide** | [`CoursePitchCatalogue.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/CoursePitchCatalogue.tsx) | `courses(course_id, title, duration_weeks, base_fee, currency, usps)`<br>`batches(start_date, timing_slot)`<br>`fee_plans(plan_name, total_amount)` | None (Pitch guide reference) | Generates WhatsApp pitch copy and curriculum brochures. |
| **Student Enrolment Desk**| [`StudentEnrolment.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/StudentEnrolment.tsx) | `courses(course_id, title)`<br>`batches(batch_id, name)`<br>`fee_plans(fee_plan_id, plan_name, total_amount)` | `users` [INSERT student account]<br>`student_profiles` [INSERT]<br>`user_brand_access` [INSERT]<br>`user_roles` [INSERT 'student']<br>`enrolments` [INSERT]<br>`invoices` [INSERT]<br>`payments` [INSERT initial deposit]<br>`leads(funnel_stage='enrolled', converted_student_id)` [UPDATE]<br>`whatsapp_messages` [INSERT welcome kit]<br>`audit_logs` [INSERT] | Atomic 4-step admission transaction. |
| **Tuition & Payment Status**| [`PaymentStatus.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/counselor/PaymentStatus.tsx) | `invoices(invoice_id, invoice_number, billed_amount, paid_amount, balance_due, due_date, status)`<br>`users(full_name, phone)` [student]<br>`courses(title)` | `whatsapp_messages` [INSERT payment reminder] | Installment tracking and automated WhatsApp reminder triggers. |

---

### 1.5 Academic Trainer Portal Screens

| Screen Name | UI Component File | Read Operations (SELECT) | Write Operations (INSERT / UPDATE) | Notes & Data Flows |
|---|---|---|---|---|
| **Trainer Dashboard** | [`TrainerDashboard.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/TrainerDashboard.tsx) | `batches(batch_id, name)` WHERE primary_trainer_id = current_user<br>`class_sessions(topic, scheduled_start, meeting_url)`<br>`assignment_submissions(COUNT)` WHERE status = 'pending' | None (Read-only overview) | Daily lecture schedule, grading queue count. |
| **My Cohorts & Roster** | [`TrainerBatches.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/TrainerBatches.tsx) | `batches(batch_id, name, schedule_days, timing_slot, start_date, end_date, meeting_room_url, status)`<br>`enrolments(student_id)`<br>`users(full_name, email)`<br>`course_progress(attendance_rate, assignments_done)` | `batches(meeting_room_url, updated_at)` [UPDATE] | Cohort syllabus tracker, roster inspection, room link edit. |
| **Class Timetable** | [`ClassSchedule.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/ClassSchedule.tsx) | `class_sessions(class_session_id, topic, scheduled_start, scheduled_end, duration_mins, meeting_url, status)`<br>`batches(name)` | `class_sessions(batch_id, trainer_id, topic, mode, scheduled_start, scheduled_end, meeting_url, status)` [INSERT / UPDATE]<br>`audit_logs` [INSERT] | Schedules live lectures subject to exclusion constraints. |
| **Live Attendance Marker**| [`AttendanceMarker.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/AttendanceMarker.tsx) | `class_sessions(class_session_id, topic, scheduled_start)`<br>`enrolments(student_id)`<br>`users(full_name, email, phone)`<br>`class_attendance(status, joined_at)` | `class_attendance` [INSERT / UPDATE / UPSERT]<br>`course_progress(attendance_rate)` [UPDATE trigger]<br>`whatsapp_messages` [INSERT absentee alerts]<br>`audit_logs` [INSERT] | Marks roster, calculates attendance streaks, triggers alerts. |
| **Learning Materials** | [`LearningMaterials.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/LearningMaterials.tsx) | `learning_materials(material_id, title, material_type, storage_key, file_size_text, created_at)`<br>`course_modules(title)`<br>`batches(name)` | `learning_materials(course_id, module_id, batch_id, title, material_type, storage_key, uploaded_by)` [INSERT]<br>`learning_materials(is_active=false)` [UPDATE on delete] | Uploads and manages slides, notebooks, and video links. |
| **Assignment Manager** | [`AssignmentManager.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/AssignmentManager.tsx) | `assignments(assignment_id, title, max_score, due_date, status, starter_repo_url)`<br>`batches(name)`<br>`assignment_submissions(COUNT by status, AVG(score))` | `assignments(batch_id, title, instructions, starter_repo_url, max_score, due_date, status, created_by)` [INSERT / UPDATE]<br>`audit_logs` [INSERT] | Authors assignments and reviews submission metrics. |
| **Submissions & Grading**| [`SubmissionsGrading.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/SubmissionsGrading.tsx) | `assignment_submissions(submission_id, assignment_id, student_id, repo_url, student_notes, submitted_at, score, feedback, status)`<br>`assignments(title, max_score)`<br>`users(full_name, email)` [student] | `assignment_submissions(score, feedback, status, graded_by, graded_at)` [UPDATE]<br>`course_progress(assignments_done)` [UPDATE trigger]<br>`audit_logs` [INSERT] | Reviews student code repos, awards marks, enters feedback. |
| **Quiz Builder Console** | [`QuizBuilder.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/QuizBuilder.tsx) | `quizzes(quiz_id, title, duration_minutes, pass_percentage, status)`<br>`quiz_questions(question_id, question_number, question_text, options, correct_option_index)`<br>`quiz_attempts(COUNT, AVG(score_percent))` | `quizzes(batch_id, title, duration_minutes, pass_percentage, status, created_by)` [INSERT / UPDATE]<br>`quiz_questions` [INSERT / UPDATE / DELETE]<br>`audit_logs` [INSERT] | Multiple choice exam builder and answer key editor. |
| **Student Progress** | [`StudentProgressReports.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/trainer/StudentProgressReports.tsx) | `course_progress(attendance_rate, assignments_done, assignments_total, quiz_average, is_eligible_for_cert)`<br>`enrolments(enrolment_id, student_id, batch_id)`<br>`users(full_name, email, phone)`<br>`certificates(public_code, issue_date)` | `certificates` [INSERT upon trainer manual issuance]<br>`audit_logs` [INSERT] | Evaluates student graduation benchmarks and awards certificates. |

---

### 1.6 Student Learner Portal Screens

| Screen Name | UI Component File | Read Operations (SELECT) | Write Operations (INSERT / UPDATE) | Notes & Data Flows |
|---|---|---|---|---|
| **Learner Dashboard** | [`StudentDashboard.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentDashboard.tsx) | `enrolments(enrolment_id, course_id, batch_id)`<br>`courses(title)`<br>`batches(name)`<br>`course_progress(attendance_rate, assignments_done, quiz_average, tuition_paid_in_full)`<br>`class_sessions(topic, scheduled_start, meeting_url)` WHERE status = 'upcoming' | None (Read-only learner home) | Student KPI cards, upcoming class join button, progress bar. |
| **Curriculum & Lessons** | [`StudentCurriculum.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentCurriculum.tsx) | `course_modules(module_id, module_number, title, total_duration)`<br>`course_lessons(lesson_id, lesson_order, title, duration_mins, summary, video_url, code_snippet, notes_pdf_url)` | None (Video streaming & lesson notes) | Syllabus accordion tree, video player modal, code snippets. |
| **Live Lectures & Replays**| [`StudentLiveClasses.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentLiveClasses.tsx) | `class_sessions(class_session_id, topic, scheduled_start, meeting_url, recording_url, notes_url, status)`<br>`class_attendance(status)` WHERE student_id = current_user | None (Live class access & video stream) | Live lecture join room and replay library with presence badge. |
| **Study Materials** | [`StudentMaterials.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentMaterials.tsx) | `learning_materials(title, material_type, storage_key, file_size_text, created_at)`<br>`course_modules(title)` | None (Download PDF / open link) | Resource repository for slides, Jupyter notebooks, cheat sheets. |
| **Assignments Workspace** | [`StudentAssignments.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentAssignments.tsx) | `assignments(assignment_id, title, instructions, starter_repo_url, max_score, due_date)`<br>`assignment_submissions(repo_url, student_notes, score, feedback, status, submitted_at)` | `assignment_submissions(assignment_id, student_id, repo_url, student_notes, status='pending', submitted_at)` [INSERT / UPSERT] | Homework workspace, repo submission modal, grade/feedback viewer. |
| **Quizzes & Tests Arena** | [`StudentQuizzes.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentQuizzes.tsx) | `quizzes(quiz_id, title, duration_minutes, pass_percentage, status)`<br>`quiz_questions(question_id, question_text, options, correct_option_index)`<br>`quiz_attempts(score_percent, is_passed, submitted_at)` | `quiz_attempts(quiz_id, student_id, attempt_number, score_percent, is_passed, submitted_at)` [INSERT]<br>`quiz_attempt_answers(attempt_id, question_id, selected_option_index, is_correct)` [INSERT]<br>`course_progress(quiz_average)` [UPDATE trigger] | Timed assessment taking engine, radio options, exam review mode. |
| **Attendance Record** | [`StudentAttendance.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentAttendance.tsx) | `class_attendance(status, joined_at, remarks)`<br>`class_sessions(topic, scheduled_start)`<br>`course_progress(attendance_rate)` | None (Read-only ledger) | Personal presence ledger and graduation eligibility tracker. |
| **Tuition & Receipts** | [`StudentFees.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentFees.tsx) | `invoices(invoice_id, invoice_number, billed_amount, paid_amount, balance_due, status, currency)`<br>`fee_plans(plan_name)`<br>`payments(receipt_number, amount, payment_mode, created_at)`<br>`payment_transactions(gateway_payment_id)` | `payment_transactions` [INSERT pending checkout]<br>`payments` [INSERT on gateway capture]<br>`invoices(paid_amount, balance_due, status)` [UPDATE] | Tuition balance card, online payment checkout modal, receipt download. |
| **Certificates** | [`StudentCertificates.tsx`](file:///f:/LMS%20Project/LMS%20Project/frontend/src/components/student/StudentCertificates.tsx) | `course_progress(attendance_rate, assignments_done, assignments_total, quiz_average, tuition_paid_in_full, is_eligible_for_cert)`<br>`certificates(public_code, verification_uuid, issue_date, instructor_name, skills_certified, pdf_storage_key)`<br>`courses(title)` | None (PDF download & LinkedIn share) | Benchmark criteria verification and high-fidelity SVG/PDF preview. |

---

## 2. Gap Identification: UI Fields with No Direct Column

Every visible UI field was audited against the schema. Below are UI elements that do not correspond to standalone database columns, along with their derived data source:

| Screen Name | UI Field / Element | Source & Resolution in Schema |
|---|---|---|
| **Platform Dashboard** | Gateway Health Badge (`Operational` / `Degraded`) | Evaluated at runtime via health-check query pinging `SELECT 1` and checking latest `audit_logs` errors; not stored in a static column. |
| **Counselor Pipeline** | Stage Count Badge (`Total Leads in Funnel: 48`) | Computed dynamically via `COUNT(*)` grouped by `funnel_stage` on `leads`. |
| **Student Enrolment** | "Welcome WhatsApp packet dispatched" (Toast) | Handled by backend message worker inserting into `whatsapp_messages` during enrollment transaction. |
| **Student Attendance** | Attendance Percentage Badge (`96%`) | Stored in `course_progress.attendance_rate` and computed canonically via `v_student_course_progress`. |
| **Student Curriculum** | "నమస్కారం! Welcome to TeluguAI!" | Stored directly in `course_lessons.code_snippet` (UTF-8 `text` column). |
| **Certificate Viewer** | LinkedIn Share URL | Built dynamically on the client using `certificates.verification_uuid`: `https://{brand.domain}/verify/{verification_uuid}`. |
| **Attendance Marker** | "Attendance Streak: 12 days" | Computed dynamically via window query counting consecutive `'present'` rows in `class_attendance`. |

---

## 3. Gap Identification: Schema Columns with No Direct Front-End Use

Certain columns exist strictly for cryptographic security, financial compliance, and idempotency, and are intentionally not displayed on UI cards:

| Table Name | Column Name | Technical Purpose & Justification |
|---|---|---|
| `users` | `password_hash` | Security standard; raw hashes are never sent to or displayed on client screens. |
| `user_sessions` | `token_hash` | Cryptographic SHA-256 hash of refresh token used for session authentication. |
| `certificates` | `verification_uuid` | Cryptographically unguessable UUID for external public verification URLs. |
| `payment_transactions` | `raw_payload` | Full JSON webhook payload from payment gateways retained for forensic debugging. |
| `webhook_events` | `idempotency_key` | Internal deduplication key preventing double-processing of payment and Meta webhooks. |
| `audit_logs` | `event_details` | Detailed JSON snapshot of before/after state, accessed only within the raw JSON inspection modal. |
| `system_settings` | `is_secret` | Internal boolean flag instructing backend encryption workers to encrypt credentials via `pgcrypto`. |
| `courses` | `slug` | URL routing identifier for SEO-friendly course public landing pages. |

"""Seed demo data for both brands (plan §7 of studentmoduleimplementation.md).

All demo users share the password `admin123` (bcrypt-hashed at seed time),
matching the login-screen autofill.

Usage:
    uv run seed.py            # fails politely if data already exists
    uv run seed.py --reset    # truncates tenant data first, then reseeds
"""

from __future__ import annotations

import asyncio
import sys
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import (
    Announcement,
    Assignment,
    AssignmentSubmission,
    Batch,
    Brand,
    Certificate,
    CertificateTemplate,
    ClassAttendance,
    ClassSession,
    Course,
    CourseLesson,
    CourseModule,
    CourseProgress,
    Enrolment,
    FeePlan,
    FeePlanInstalment,
    Invoice,
    LearningMaterial,
    LessonProgress,
    Payment,
    PaymentTransaction,
    Permission,
    Quiz,
    QuizAttempt,
    QuizAttemptAnswer,
    QuizQuestion,
    RolePermission,
    StaffProfile,
    StudentProfile,
    User,
    UserBrandAccess,
    UserRole,
)

IST = timezone(timedelta(hours=5, minutes=30))
PASSWORD = "admin123"


def ist(day: int, month: int, hour: int, minute: int = 0, year: int = 2026) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=IST)


async def reset(db: AsyncSession) -> None:
    """Delete rows from all app tables (keep alembic_version)."""
    for table in reversed(Base.metadata.sorted_tables):
        if table.name == "alembic_version":
            continue
        await db.execute(table.delete())


async def seed(db: AsyncSession) -> None:
    # ------------------------------------------------------------- brands
    teluguai = Brand(
        slug="teluguai",
        name="TeluguAI.com",
        domain="teluguai.com",
        logo_text="TA",
        tagline="Learn Python & AI in Telugu",
        support_email="support@teluguai.com",
        primary_color="#059669",
        accent_color="#0284c7",
    )
    genai99 = Brand(
        slug="genai99",
        name="GenAI99.com",
        domain="genai99.com",
        logo_text="G99",
        tagline="Industry-grade GenAI engineering, in 99 days",
        support_email="support@genai99.com",
        primary_color="#0284c7",
        accent_color="#059669",
    )
    db.add_all([teluguai, genai99])
    await db.flush()

    # -------------------------------------------------------------- users
    pw_hash = hash_password(PASSWORD)

    users: dict[str, User] = {}
    for email, name, phone in [
        ("superadmin@lakes.dev", "Platform Owner", "+91 90000 00001"),
        ("admin@teluguai.com", "Kavya Reddy", "+91 90000 11002"),
        ("counselor@teluguai.com", "Praveen Kumar", "+91 90000 11003"),
        ("trainer@teluguai.com", "Ravi Shankar", "+91 90000 11004"),
        ("student@teluguai.com", "Sai Kiran", "+91 90000 11005"),
        ("admin@genai99.com", "Anita Desai", "+91 90000 22002"),
        ("counselor@genai99.com", "Vivek Joshi", "+91 90000 22003"),
        ("trainer@genai99.com", "Dr. Arun Mehta", "+91 90000 22004"),
        ("student@genai99.com", "Meghana Rao", "+91 90000 22005"),
        ("student2@teluguai.com", "Lakshmi Priya", "+91 90000 11006"),
    ]:
        users[email] = User(
            email=email, password_hash=pw_hash, full_name=name, phone=phone
        )
    db.add_all(users.values())
    await db.flush()

    u = users
    admin_ta = u["admin@teluguai.com"]
    trainer_ta = u["trainer@teluguai.com"]
    student_ta = u["student@teluguai.com"]
    admin_g99 = u["admin@genai99.com"]
    trainer_g99 = u["trainer@genai99.com"]
    student_g99 = u["student@genai99.com"]

    # --------------------------------------------- memberships & roles
    memberships = [
        (u["superadmin@lakes.dev"], teluguai, "super_admin"),
        (u["superadmin@lakes.dev"], genai99, "super_admin"),
        (admin_ta, teluguai, "admin"),
        (u["counselor@teluguai.com"], teluguai, "counselor"),
        (trainer_ta, teluguai, "trainer"),
        (student_ta, teluguai, "student"),
        (u["student2@teluguai.com"], teluguai, "student"),
        (admin_g99, genai99, "admin"),
        (u["counselor@genai99.com"], genai99, "counselor"),
        (trainer_g99, genai99, "trainer"),
        (student_g99, genai99, "student"),
    ]
    for user, brand, role in memberships:
        db.add(UserBrandAccess(user_id=user.user_id, brand_id=brand.brand_id))
        db.add(UserRole(user_id=user.user_id, brand_id=brand.brand_id, role=role))

    # ------------------------------------------------- staff/student profiles
    db.add_all([
        StaffProfile(user_id=trainer_ta.user_id, brand_id=teluguai.brand_id,
                     staff_type="trainer", specialization="Python, Django, Applied ML",
                     instructor_title="Lead Instructor, TeluguAI Academy"),
        StaffProfile(user_id=trainer_g99.user_id, brand_id=genai99.brand_id,
                     staff_type="trainer", specialization="LLMOps, RAG, Fine-Tuning",
                     instructor_title="Chief AI Instructor, GenAI99"),
        StudentProfile(user_id=student_ta.user_id,
                       brand_id=teluguai.brand_id, student_roll_no="TA-2026-0271",
                       whatsapp_number="+91 90000 11005", city_or_region="Hyderabad",
                       education_bg="B.Tech ECE, 2025"),
        StudentProfile(user_id=student_g99.user_id,
                       brand_id=genai99.brand_id, student_roll_no="G99-2026-0114",
                       whatsapp_number="+91 90000 22005", city_or_region="Bengaluru",
                       education_bg="B.E. CSE, 2024"),
    ])

    # -------------------------------------------------------- permissions
    perms_rows = [
        ("course.manage", "catalogue", "Create and edit courses"),
        ("batch.manage", "academics", "Create batches, assign trainers"),
        ("student.enrol", "enrolment", "Enrol students into cohorts"),
        ("payment.record", "finance", "Record tuition payments"),
        ("attendance.mark", "academics", "Mark class attendance"),
        ("quiz.grade", "assessments", "Grade quizzes and assignments"),
        ("announcement.publish", "comms", "Publish announcements"),
        ("certificate.issue", "progress", "Issue completion certificates"),
    ]
    perm_ids: dict[str, int] = {}
    for code, module, desc in perms_rows:
        perm = Permission(code=code, module=module,
                          action_name=code.split(".")[-1], description=desc)
        db.add(perm)
        perm_ids[code] = perm  # replaced with real ids after flush
    await db.flush()
    for p in (await db.execute(select(Permission))).scalars():
        perm_ids[p.code] = p.permission_id

    grants: dict[str, list[str]] = {
        "super_admin": list(perm_ids),
        "admin": ["course.manage", "batch.manage", "student.enrol", "payment.record",
                  "announcement.publish", "certificate.issue"],
        "counselor": ["student.enrol", "payment.record"],
        "trainer": ["attendance.mark", "quiz.grade"],
        "student": [],
    }
    for role, codes in grants.items():
        for code in codes:
            db.add(RolePermission(role=role, permission_id=perm_ids[code], is_granted=True))

    # ------------------------------------------------------------ courses
    course_py = Course(
        brand_id=teluguai.brand_id, slug="fullstack-python-vernacular-ai",
        title="Full-Stack Python & Vernacular AI",
        category="Career Track", duration_weeks=16, base_fee=24999.00, currency="INR",
        description="Build production web apps and Telugu-language AI features end to end.",
        usps=["Live Telugu instruction", "Job-ready portfolio", "1:1 career mentorship"],
    )
    course_genai = Course(
        brand_id=genai99.brand_id, slug="genai-engineering-bootcamp",
        title="GenAI Engineering Bootcamp",
        category="Bootcamp", duration_weeks=12, base_fee=499.00, currency="USD",
        description="Ship LLM products: prompting, RAG, fine-tuning and agent workflows.",
        usps=["12 real projects", "RAG & agents deep dive", "Hiring-partner showcase"],
    )
    course_prompt = Course(
        brand_id=genai99.brand_id, slug="prompt-engineering-express",
        title="Prompt Engineering Express",
        category="Short Course", duration_weeks=6, base_fee=149.00, currency="USD",
        description="Master prompt patterns and structured outputs in six weeks.",
        usps=["Evening schedule", "Certificate of completion"],
    )
    db.add_all([course_py, course_genai, course_prompt])
    await db.flush()

    # ------------------------------------------------- modules and lessons
    def module_for(course: Course, number: int, title: str, total: str) -> CourseModule:
        return CourseModule(course_id=course.course_id, brand_id=course.brand_id,
                            module_number=number, title=title, total_duration=total)

    def lessons_for(module: CourseModule,
                    items: list[tuple[str, int, str, str | None]]) -> list[CourseLesson]:
        out: list[CourseLesson] = []
        for order, (title, mins, summary, snippet) in enumerate(items, start=1):
            out.append(CourseLesson(
                module_id=module.module_id, brand_id=module.brand_id, lesson_order=order,
                title=title, duration_mins=mins, summary=summary, code_snippet=snippet,
                notes_pdf_url=f"https://notes.lms.dev/m{module.module_number}-l{order}.pdf",
            ))
        return out

    m1 = module_for(course_py, 1, "Python Foundations", "Weeks 1–4")
    m2 = module_for(course_py, 2, "Web Backend with FastAPI", "Weeks 5–8")
    m3 = module_for(course_py, 3, "AI Features in Telugu", "Weeks 9–12")
    m4 = module_for(course_py, 4, "Capstone & Career Prep", "Weeks 13–16")
    ga1 = module_for(course_genai, 1, "LLM Foundations", "Weeks 1–3")
    ga2 = module_for(course_genai, 2, "Retrieval-Augmented Generation", "Weeks 4–6")
    ga3 = module_for(course_genai, 3, "Agents & Capstone", "Weeks 7–12")
    gp1 = module_for(course_prompt, 1, "Prompt Patterns", "Weeks 1–6")
    db.add_all([m1, m2, m3, m4, ga1, ga2, ga3, gp1])
    await db.flush()

    db.add_all(
        lessons_for(m1, [
            ("Environment Setup & First Script", 45, "Set up VS Code, virtualenv, and run your first Python file.",
             "print('నమస్కారం, ప్రపంచం!')  # Namaskaram!"),
            ("Variables, Types & Telugu Strings", 50, "Unicode strings and f-strings with Telugu text.",
             "name = 'సాయి కిరణ్'\nprint(f'స్వాగతం, {name}!')"),
            ("Control Flow & Loops", 55, "if/else, for, while and common pitfalls.", None),
            ("Functions & Modules Deep Dive", 60, "Compose reusable functions and package code into modules.", None),
        ]) + lessons_for(m2, [
            ("FastAPI Hello World & Routing", 45, "Your first async API with path and query parameters.",
             "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/greet')\nasync def greet(name: str = 'మిత్రమా'):\n    return {'message': f'నమస్కారం, {name}!'}"),
            ("Pydantic Models & Validation", 50, "Request/response schemas with strict validation.", None),
            ("PostgreSQL with SQLAlchemy Async", 75, "Async engines, sessions and the 2.0 typed ORM.", None),
        ]) + lessons_for(m3, [
            ("Transliteration & Telugu NLP Basics", 55, "Tokenization challenges for Telugu script.", None),
            ("Building a Telugu Chatbot", 70, "Design a vernacular assistant with retrieval.", None),
            ("Deploying on Indian Cloud Regions", 50, "Latency, cost and compliance basics.", None),
        ]) + lessons_for(m4, [
            ("Capstone Kickoff & Scoping", 45, "Choose your final project and success metrics.", None),
            ("Interview Prep: System Design Basics", 60, "Design a URL shortener, live in Telugu.", None),
            ("Final Demo Day", 90, "Present your capstone to hiring partners.", None),
        ]) + lessons_for(ga1, [
            ("How LLMs Actually Work", 45, "Tokens, sampling and the illusion of understanding.", None),
            ("Prompting as Engineering", 50, "System prompts, few-shot and structured outputs.",
             'SYSTEM = "You are a precise API. Reply with valid JSON."'),
            ("OpenAI vs Open-Source Trade-offs", 60, "Cost, latency and data-residency decisions.", None),
        ]) + lessons_for(ga2, [
            ("Embeddings & Vector Search", 50, "Choose chunking strategies that survive scale.", None),
            ("RAG Pipeline Lab", 75, "Build a quoting RAG service over private docs.", None),
            ("Evaluation & Hallucination Control", 55, "Golden datasets and groundedness scoring.", None),
        ]) + lessons_for(ga3, [
            ("Tool-Calling Agents", 60, "Function calling, retries and guardrails.", None),
            ("Fine-Tuning for Domain Voice", 70, "LoRA fine-tune on your own corpus.", None),
            ("Capstone: Ship a GenAI Product", 90, "End-to-end demo with monitoring.", None),
        ]) + lessons_for(gp1, [
            ("Zero-shot vs Few-shot", 40, "Pick the cheapest technique that works.", None),
            ("Structured Outputs & JSON Mode", 45, "Deterministic schemas for production.", None),
            ("Guardrails & Safety", 40, "Reject jailbreaks and log incidents.", None),
        ])
    )
    await db.flush()

    # -------------------------------------------------------------- batches
    batch_ta = Batch(
        brand_id=teluguai.brand_id, course_id=course_py.course_id,
        primary_trainer_id=trainer_ta.user_id,
        name="TA-PY-2026-C2 · Evening", schedule_days="Mon / Wed / Fri",
        timing_slot="07:00 PM - 08:30 PM", start_date=date(2026, 9, 28),
        end_date=date(2027, 1, 16), max_capacity=50,
        meeting_room_url="https://meet.lms.dev/ta-py-c2", status="active",
    )
    batch_ta_b = Batch(
        brand_id=teluguai.brand_id, course_id=course_py.course_id,
        primary_trainer_id=trainer_ta.user_id,
        name="TA-PY-2026-C3 · Morning", schedule_days="Tue / Thu / Sat",
        timing_slot="10:00 AM - 11:30 AM", start_date=date(2026, 11, 3),
        end_date=date(2027, 2, 23), max_capacity=50,
        meeting_room_url="https://meet.lms.dev/ta-py-c3", status="pending",
    )
    batch_g99 = Batch(
        brand_id=genai99.brand_id, course_id=course_genai.course_id,
        primary_trainer_id=trainer_g99.user_id,
        name="G99-GENAI-2026-S1 · Late Evening", schedule_days="Tue / Thu / Sat",
        timing_slot="08:00 PM - 09:15 PM", start_date=date(2026, 10, 1),
        end_date=date(2026, 12, 24), max_capacity=40,
        meeting_room_url="https://meet.lms.dev/g99-s1", status="active",
    )
    batch_g99_b = Batch(
        brand_id=genai99.brand_id, course_id=course_prompt.course_id,
        primary_trainer_id=trainer_g99.user_id,
        name="G99-PROMPT-2026-W1 · Weekend", schedule_days="Sat / Sun",
        timing_slot="11:00 AM - 12:30 PM", start_date=date(2026, 11, 7),
        end_date=date(2026, 12, 13), max_capacity=30,
        meeting_room_url="https://meet.lms.dev/g99-prompt-w1", status="pending",
    )
    db.add_all([batch_ta, batch_ta_b, batch_g99, batch_g99_b])
    await db.flush()

    # ----------------------------------------------------------- enrolments
    enrol_ta = Enrolment(
        brand_id=teluguai.brand_id, student=student_ta, course=course_py,
        batch=batch_ta, enrolled_by=admin_ta.user_id, enrolment_date=date(2026, 9, 21),
        status="active",
    )
    enrol_g99 = Enrolment(
        brand_id=genai99.brand_id, student=student_g99, course=course_genai,
        batch=batch_g99, enrolled_by=admin_g99.user_id, enrolment_date=date(2026, 9, 26),
        status="active",
    )
    db.add_all([enrol_ta, enrol_g99])
    await db.flush()

    # ------------------------------------------------------ class sessions
    past_ta = [
        ClassSession(brand_id=teluguai.brand_id, batch_id=batch_ta.batch_id,
                     trainer_id=trainer_ta.user_id, topic=topic, mode="live_lecture",
                     scheduled_start=ist(d, m, 19), scheduled_end=ist(d, m, 20, 30),
                     duration_mins=90, meeting_url=batch_ta.meeting_room_url,
                     expected_attendees=32, status="completed",
                     recording_url=f"https://replays.lms.dev/ta-py-c2/{m:02d}{d:02d}.mp4",
                     notes_url=f"https://notes.lms.dev/ta-py-c2/{m:02d}{d:02d}.pdf")
        for (d, m), topic in zip(
            [(28, 9), (30, 9), (2, 10), (5, 10), (7, 10), (9, 10), (12, 10), (14, 10), (16, 10), (19, 10)],
            ["Orientation & How Web Apps Work", "Python Types & Telugu Strings Workshop",
             "Control Flow Lab", "Functions & Modules Deep Dive",
             "Comprehensions & Data Structures", "File I/O and JSON",
             "Intro to HTTP & APIs", "FastAPI Hello World Workshop",
             "Pydantic Models & Validation Lab", "PostgreSQL & SQLAlchemy Session"])
    ]
    ta_today = ClassSession(
        brand_id=teluguai.brand_id, batch_id=batch_ta.batch_id,
        trainer_id=trainer_ta.user_id,
        topic="Async SQLAlchemy Walkthrough + Q&A", mode="lab",
        scheduled_start=ist(21, 10, 19), scheduled_end=ist(21, 10, 20, 30),
        duration_mins=90, meeting_url=batch_ta.meeting_room_url,
        expected_attendees=30, status="upcoming")
    ta_upcoming = [
        ClassSession(brand_id=teluguai.brand_id, batch_id=batch_ta.batch_id,
                     trainer_id=trainer_ta.user_id, topic=topic, mode="live_lecture",
                     scheduled_start=ist(d, m, 19), scheduled_end=ist(d, m, 20, 30),
                     duration_mins=90, meeting_url=batch_ta.meeting_room_url,
                     expected_attendees=30, status="upcoming")
        for (d, m), topic in [((23, 10), "Migrations with Alembic"),
                              ((26, 10), "Auth: JWT Cookies in FastAPI"),
                              ((28, 10), "Project Workshop: LMS MVP")]
    ]
    past_g99 = [
        ClassSession(brand_id=genai99.brand_id, batch_id=batch_g99.batch_id,
                     trainer_id=trainer_g99.user_id, topic=topic, mode="live_lecture",
                     scheduled_start=ist(d, m, 20), scheduled_end=ist(d, m, 21, 15),
                     duration_mins=75, meeting_url=batch_g99.meeting_room_url,
                     expected_attendees=28, status="completed",
                     recording_url=f"https://replays.lms.dev/g99-s1/{m:02d}{d:02d}.mp4")
        for (d, m), topic in zip(
            [(1, 10), (3, 10), (6, 10), (8, 10), (10, 10), (13, 10), (15, 10), (17, 10)],
            ["GenAI Landscape & Course Roadmap", "Tokens & Sampling Lab",
             "Prompting as Engineering", "Structured Outputs Workshop",
             "Embeddings & Vector Search", "RAG Pipeline Lab I",
             "RAG Pipeline Lab II", "Evaluation & Groundedness"])
    ]
    g99_upcoming = [
        ClassSession(brand_id=genai99.brand_id, batch_id=batch_g99.batch_id,
                     trainer_id=trainer_g99.user_id, topic=topic, mode="live_lecture",
                     scheduled_start=ist(d, m, 20), scheduled_end=ist(d, m, 21, 15),
                     duration_mins=75, meeting_url=batch_g99.meeting_room_url,
                     expected_attendees=26, status="upcoming")
        for (d, m), topic in [((22, 10), "Hallucination Diagnostics"),
                              ((24, 10), "Tool-Calling Agents I"),
                              ((27, 10), "Tool-Calling Agents II"),
                              ((29, 10), "Fine-Tuning Strategy Review")]
    ]
    db.add_all(past_ta + [ta_today] + ta_upcoming + past_g99 + g99_upcoming)
    await db.flush()

    # ---------------------------------------------------------- attendance
    ta_attendance_plan = ["present"] * 8 + ["late", "absent"]
    for session, status in zip(past_ta, ta_attendance_plan):
        db.add(ClassAttendance(
            brand_id=teluguai.brand_id, class_session_id=session.class_session_id,
            student_id=student_ta.user_id, status=status,
            joined_at=session.scheduled_start + timedelta(minutes=2),
            marked_by=trainer_ta.user_id,
            remarks="Joined late — network issue" if status == "late" else None,
        ))
    for session in past_g99:
        db.add(ClassAttendance(
            brand_id=genai99.brand_id, class_session_id=session.class_session_id,
            student_id=student_g99.user_id, status="present",
            joined_at=session.scheduled_start, marked_by=trainer_g99.user_id,
        ))

    # --------------------------------------------------- learning materials
    db.add_all([
        LearningMaterial(brand_id=teluguai.brand_id, course_id=course_py.course_id,
                         module_id=m1.module_id, batch_id=batch_ta.batch_id,
                         title="Python Foundations — Slide Deck", material_type="slides",
                         storage_key="https://cdn.lms.dev/ta/py-m1-slides.pdf",
                         file_size_text="2.4 MB", mime_type="application/pdf",
                         uploaded_by=admin_ta.user_id),
        LearningMaterial(brand_id=teluguai.brand_id, course_id=course_py.course_id,
                         module_id=m2.module_id, batch_id=batch_ta.batch_id,
                         title="FastAPI Starter Notebook", material_type="notebook",
                         storage_key="https://cdn.lms.dev/ta/py-m2-notebook.ipynb",
                         file_size_text="640 KB", mime_type="application/x-ipynb+json",
                         uploaded_by=trainer_ta.user_id),
        LearningMaterial(brand_id=teluguai.brand_id, course_id=course_py.course_id,
                         module_id=m2.module_id, batch_id=batch_ta.batch_id,
                         title="HTTP Status Codes Cheatsheet", material_type="cheatsheet",
                         storage_key="https://cdn.lms.dev/ta/py-m2-cheatsheet.pdf",
                         file_size_text="180 KB", mime_type="application/pdf",
                         uploaded_by=admin_ta.user_id),
        LearningMaterial(brand_id=teluguai.brand_id, course_id=course_py.course_id,
                         module_id=m1.module_id, batch_id=batch_ta.batch_id,
                         title="fizzbuzz_lab.py Reference", material_type="code",
                         storage_key="https://cdn.lms.dev/ta/py-m1-fizzbuzz.py",
                         file_size_text="3 KB", mime_type="text/x-python",
                         uploaded_by=trainer_ta.user_id),
        LearningMaterial(brand_id=genai99.brand_id, course_id=course_genai.course_id,
                         module_id=ga1.module_id, batch_id=batch_g99.batch_id,
                         title="LLM Foundations — Slide Deck", material_type="slides",
                         storage_key="https://cdn.lms.dev/g99/ga1-slides.pdf",
                         file_size_text="3.1 MB", mime_type="application/pdf",
                         uploaded_by=admin_g99.user_id),
        LearningMaterial(brand_id=genai99.brand_id, course_id=course_genai.course_id,
                         module_id=ga2.module_id, batch_id=batch_g99.batch_id,
                         title="RAG Pipeline Colab", material_type="notebook",
                         storage_key="https://cdn.lms.dev/g99/rag-pipeline.ipynb",
                         file_size_text="1.2 MB", mime_type="application/x-ipynb+json",
                         uploaded_by=trainer_g99.user_id),
        LearningMaterial(brand_id=genai99.brand_id, course_id=course_genai.course_id,
                         module_id=ga2.module_id, batch_id=batch_g99.batch_id,
                         title="Chunking Strategies Cheatsheet", material_type="cheatsheet",
                         storage_key="https://cdn.lms.dev/g99/chunking.pdf",
                         file_size_text="220 KB", mime_type="application/pdf",
                         uploaded_by=trainer_g99.user_id),
        LearningMaterial(brand_id=genai99.brand_id, course_id=course_prompt.course_id,
                         module_id=gp1.module_id,
                         title="Prompt Patterns Cheatsheet", material_type="cheatsheet",
                         storage_key="https://cdn.lms.dev/g99/prompt-patterns.pdf",
                         file_size_text="150 KB", mime_type="application/pdf",
                         uploaded_by=admin_g99.user_id),
    ])

    # ---------------------------------------------------------- assignments
    asg_ta = [
        Assignment(brand_id=teluguai.brand_id, batch_id=batch_ta.batch_id,
                   created_by=trainer_ta.user_id, title=title, instructions=instructions,
                   starter_repo_url=repo, max_score=100, due_date=due, status="active")
        for title, instructions, repo, due in [
            ("Telugu FizzBuzz CLI",
             "Build a CLI that prints FizzBuzz 1–100 in Telugu and handle Unicode output.",
             "https://github.com/teluguai/fizzbuzz-starter", ist(5, 10, 23, 59)),
            ("Contact Book with JSON Storage",
             "CRUD CLI storing contacts in JSON; validate phone numbers.",
             "https://github.com/teluguai/contacts-starter", ist(14, 10, 23, 59)),
            ("Mini REST API: Library",
             "FastAPI service with Pydantic models and in-memory storage.",
             "https://github.com/teluguai/library-api-starter", ist(28, 10, 23, 59)),
        ]
    ]
    asg_g99 = [
        Assignment(brand_id=genai99.brand_id, batch_id=batch_g99.batch_id,
                   created_by=trainer_g99.user_id, title=title, instructions=instructions,
                   starter_repo_url=repo, max_score=100, due_date=due, status="active")
        for title, instructions, repo, due in [
            ("Structured extractor",
             "Extract invoice fields into strict JSON with 95% key accuracy.",
             "https://github.com/genai99/extractor-starter", ist(8, 10, 23, 59)),
            ("Semantic search over MF docs",
             "Embed and index mutual-fund documents; report recall@10.",
             "https://github.com/genai99/search-starter", ist(18, 10, 23, 59)),
            ("RAG capstone service",
             "Deploy a grounded Q&A API with citations and evaluation report.",
             "https://github.com/genai99/rag-capstone", ist(1, 11, 23, 59)),
        ]
    ]
    db.add_all(asg_ta + asg_g99)
    await db.flush()

    db.add_all([
        AssignmentSubmission(brand_id=teluguai.brand_id, assignment_id=asg_ta[0].assignment_id,
                             student_id=student_ta.user_id,
                             repo_url="https://github.com/saikiran/telugu-fizzbuzz",
                             student_notes="Handled Unicode on Windows via UTF-8 mode.",
                             score=92.00,
                             feedback="Excellent edge-case handling. Consider argparse next time.",
                             status="graded", graded_by=trainer_ta.user_id,
                             submitted_at=ist(4, 10, 21, 15), graded_at=ist(6, 10, 10, 0)),
        AssignmentSubmission(brand_id=teluguai.brand_id, assignment_id=asg_ta[1].assignment_id,
                             student_id=student_ta.user_id,
                             repo_url="https://github.com/saikiran/contact-book-json",
                             student_notes="Added search by city.",
                             status="pending", submitted_at=ist(14, 10, 19, 40)),
        AssignmentSubmission(brand_id=genai99.brand_id, assignment_id=asg_g99[0].assignment_id,
                             student_id=student_g99.user_id,
                             repo_url="https://github.com/meghana-rao/invoice-extractor",
                             score=96.00, feedback="Outstanding accuracy. Ship it.",
                             status="graded", graded_by=trainer_g99.user_id,
                             submitted_at=ist(7, 10, 22, 0), graded_at=ist(9, 10, 9, 30)),
        AssignmentSubmission(brand_id=genai99.brand_id, assignment_id=asg_g99[1].assignment_id,
                             student_id=student_g99.user_id,
                             repo_url="https://github.com/meghana-rao/mf-semantic-search",
                             student_notes="recall@10 = 0.91 with 512-token chunks.",
                             status="pending", submitted_at=ist(17, 10, 21, 30)),
    ])

    # ----------------------------------------------------------------- quizzes
    quiz_ta1 = Quiz(brand_id=teluguai.brand_id, batch_id=batch_ta.batch_id,
                    created_by=trainer_ta.user_id, title="Python Foundations Check",
                    duration_minutes=20, pass_percentage=70, max_attempts=3, status="active")
    quiz_ta2 = Quiz(brand_id=teluguai.brand_id, batch_id=batch_ta.batch_id,
                    created_by=trainer_ta.user_id, title="FastAPI & Pydantic Basics",
                    duration_minutes=15, pass_percentage=70, max_attempts=3, status="active")
    quiz_g99a = Quiz(brand_id=genai99.brand_id, batch_id=batch_g99.batch_id,
                     created_by=trainer_g99.user_id, title="LLM Foundations Quiz",
                     duration_minutes=20, pass_percentage=75, max_attempts=3, status="active")
    quiz_g99b = Quiz(brand_id=genai99.brand_id, batch_id=batch_g99.batch_id,
                     created_by=trainer_g99.user_id, title="RAG Fundamentals Quiz",
                     duration_minutes=15, pass_percentage=75, max_attempts=3, status="active")
    db.add_all([quiz_ta1, quiz_ta2, quiz_g99a, quiz_g99b])
    await db.flush()

    def add_questions(quiz: Quiz, rows: list[tuple[str, list[str], int]]) -> None:
        for num, (qtext, opts, correct) in enumerate(rows, start=1):
            db.add(QuizQuestion(quiz_id=quiz.quiz_id, question_number=num,
                                question_text=qtext, options=opts,
                                correct_option_index=correct))

    add_questions(quiz_ta1, [
        ("Which keyword defines a function in Python?", ["def", "func", "lambda", "define"], 0),
        ("What is the type of 'నమస్కారం'[0]?", ["str", "bytes", "char", "unicode"], 0),
        ("Which collection preserves insertion order and forbids duplicates?",
         ["list", "set", "tuple", "dict"], 1),
        ("What does len('abc') return?", ["2", "3", "bytes", "4"], 1),
    ])
    add_questions(quiz_ta2, [
        ("FastAPI path params are declared using…", ["{param}", "<param>", "(param)", "[param]"], 0),
        ("Which HTTP method is idempotent and used to fetch?",
         ["POST", "PATCH", "GET", "DELETE"], 2),
        ("Pydantic validation errors raise…",
         ["ValueError", "ValidationError", "KeyError", "TypeError"], 1),
        ("Decode JSON payloads via…",
         ["json.decode", "json.loads", "json.parse", "json.loadstr"], 1),
    ])
    add_questions(quiz_g99a, [
        ("LLM sampling temperature controls…",
         ["top-k size", "randomness", "context length", "batch size"], 1),
        ("A token is closest in meaning to…", ["word", "sentence", "text chunk", "paragraph"], 2),
        ("System prompts are best used for…",
         ["few-shot demos", "persistent instructions", "retrieval", "logging"], 1),
        ("JSON mode guarantees…",
         ["valid schema", "valid JSON string", "no hallucination", "cheap cost"], 1),
    ])
    add_questions(quiz_g99b, [
        ("RAG stands for…",
         ["Random-Access Generation", "Retrieval-Augmented Generation",
          "Recursive Agent Graph", "Rank-Aware GPT"], 1),
        ("Embedding models map text to…", ["tokens", "vectors", "keywords", "graphs"], 1),
        ("A grounded answer must include…", ["emojis", "citations", "summaries", "temperature"], 1),
        ("Chunk size trade-off mainly affects…",
         ["GPU clocks", "context precision vs coverage", "API keys", "token price"], 1),
    ])
    await db.flush()

    # seeded attempts: TA 3/4 (75%), G99a 3/4 (75%), G99b 4/4 (100%)
    attempt_ta = QuizAttempt(brand_id=teluguai.brand_id, quiz_id=quiz_ta1.quiz_id,
                             student_id=student_ta.user_id, attempt_number=1,
                             score_percent=75.00, is_passed=True,
                             submitted_at=ist(11, 10, 18, 30))
    attempt_g99a = QuizAttempt(brand_id=genai99.brand_id, quiz_id=quiz_g99a.quiz_id,
                               student_id=student_g99.user_id, attempt_number=1,
                               score_percent=75.00, is_passed=True,
                               submitted_at=ist(7, 10, 20, 45))
    attempt_g99b = QuizAttempt(brand_id=genai99.brand_id, quiz_id=quiz_g99b.quiz_id,
                               student_id=student_g99.user_id, attempt_number=1,
                               score_percent=100.00, is_passed=True,
                               submitted_at=ist(16, 10, 21, 10))
    db.add_all([attempt_ta, attempt_g99a, attempt_g99b])
    await db.flush()

    all_questions = (await db.execute(
        select(QuizQuestion).order_by(QuizQuestion.quiz_id, QuizQuestion.question_number)
    )).scalars().all()
    questions_by_quiz: dict[int, list[QuizQuestion]] = {}
    for qq in all_questions:
        questions_by_quiz.setdefault(qq.quiz_id, []).append(qq)

    for attempt, quiz, wrong_qnum in [
        (attempt_ta, quiz_ta1, 3),
        (attempt_g99a, quiz_g99a, 4),
        (attempt_g99b, quiz_g99b, None),
    ]:
        for qq in questions_by_quiz[quiz.quiz_id]:
            if wrong_qnum is not None and qq.question_number == wrong_qnum:
                wrong_index = (qq.correct_option_index + 1) % len(qq.options)
                db.add(QuizAttemptAnswer(attempt_id=attempt.attempt_id,
                                         question_id=qq.question_id,
                                         selected_option_index=wrong_index,
                                         is_correct=False))
            else:
                db.add(QuizAttemptAnswer(attempt_id=attempt.attempt_id,
                                         question_id=qq.question_id,
                                         selected_option_index=qq.correct_option_index,
                                         is_correct=True))

    # ------------------------------------------------------- course_progress
    db.add_all([
        CourseProgress(brand_id=teluguai.brand_id, enrolment_id=enrol_ta.enrolment_id,
                       student_id=student_ta.user_id,
                       attendance_rate=90.00, assignments_done=2, assignments_total=3,
                       quiz_average=75.00, tuition_paid_in_full=False,
                       is_eligible_for_cert=False),
        CourseProgress(brand_id=genai99.brand_id, enrolment_id=enrol_g99.enrolment_id,
                       student_id=student_g99.user_id,
                       attendance_rate=100.00, assignments_done=2, assignments_total=2,
                       quiz_average=87.50, tuition_paid_in_full=True,
                       is_eligible_for_cert=True),
    ])

    # -------------------------------------------------------- lesson_progress
    # TeluguAI: all of Module 1 + Lesson 1 of Module 2 completed
    ta_lessons = (await db.execute(
        select(CourseLesson)
        .where(CourseLesson.module_id.in_([m1.module_id, m2.module_id]))
        .order_by(CourseLesson.module_id, CourseLesson.lesson_order)
    )).scalars().all()
    ta_completed = [l for l in ta_lessons if l.module_id == m1.module_id] + \
                   [l for l in ta_lessons if l.module_id == m2.module_id][:1]
    for lesson in ta_completed:
        db.add(LessonProgress(brand_id=teluguai.brand_id, enrolment_id=enrol_ta.enrolment_id,
                              lesson_id=lesson.lesson_id, status="completed",
                              completed_at=ist(19, 10, 18, 0)))
    # GenAI99: Modules 1 + 2 + first of Module 3 completed
    g99_lessons = (await db.execute(
        select(CourseLesson)
        .where(CourseLesson.module_id.in_([ga1.module_id, ga2.module_id, ga3.module_id]))
        .order_by(CourseLesson.module_id, CourseLesson.lesson_order)
    )).scalars().all()
    g99_completed = [l for l in g99_lessons if l.module_id in (ga1.module_id, ga2.module_id)] + \
                    [l for l in g99_lessons if l.module_id == ga3.module_id][:1]
    for lesson in g99_completed:
        db.add(LessonProgress(brand_id=genai99.brand_id, enrolment_id=enrol_g99.enrolment_id,
                              lesson_id=lesson.lesson_id, status="completed",
                              completed_at=ist(18, 10, 20, 0)))

    # ---------------------------------------------------------------- finance
    plan_ta = FeePlan(brand_id=teluguai.brand_id, course_id=course_py.course_id,
                      plan_name="Two Installments", plan_type="installment",
                      total_amount=24999.00, currency="INR", installments_count=2)
    plan_g99 = FeePlan(brand_id=genai99.brand_id, course_id=course_genai.course_id,
                       plan_name="Full Payment", plan_type="full",
                       total_amount=499.00, currency="USD", installments_count=1)
    db.add_all([plan_ta, plan_g99])
    await db.flush()
    db.add_all([
        FeePlanInstalment(fee_plan_id=plan_ta.fee_plan_id, instalment_no=1,
                          percentage=40.00, fixed_amount=10000.00, due_offset_days=0),
        FeePlanInstalment(fee_plan_id=plan_ta.fee_plan_id, instalment_no=2,
                          percentage=60.00, fixed_amount=14999.00, due_offset_days=30),
    ])

    invoice_ta = Invoice(brand_id=teluguai.brand_id, enrolment_id=enrol_ta.enrolment_id,
                         student_id=student_ta.user_id, invoice_number="INV-TA-2026-081",
                         billed_amount=24999.00, paid_amount=10000.00, balance_due=14999.00,
                         currency="INR", due_date=date(2026, 10, 30), status="Partial",
                         issued_by=admin_ta.user_id)
    invoice_g99 = Invoice(brand_id=genai99.brand_id, enrolment_id=enrol_g99.enrolment_id,
                          student_id=student_g99.user_id, invoice_number="G99-INV-2026-014",
                          billed_amount=499.00, paid_amount=499.00, balance_due=0.00,
                          currency="USD", due_date=date(2026, 10, 2), status="Paid",
                          issued_by=admin_g99.user_id)
    db.add_all([invoice_ta, invoice_g99])
    await db.flush()

    pay_ta = Payment(brand_id=teluguai.brand_id, invoice_id=invoice_ta.invoice_id,
                     receipt_number="REC-TAI-2026-081", amount=10000.00, currency="INR",
                     payment_mode="UPI", recorded_by=admin_ta.user_id)
    pay_g99 = Payment(brand_id=genai99.brand_id, invoice_id=invoice_g99.invoice_id,
                      receipt_number="REC-G99-2026-014", amount=499.00, currency="USD",
                      payment_mode="Credit Card", recorded_by=admin_g99.user_id)
    db.add_all([pay_ta, pay_g99])
    await db.flush()
    db.add_all([
        PaymentTransaction(brand_id=teluguai.brand_id, payment_id=pay_ta.payment_id,
                           gateway="manual", gateway_order_id="order_manual_TA081",
                           gateway_payment_id="pay_manual_TA081UPI3001"),
        PaymentTransaction(brand_id=genai99.brand_id, payment_id=pay_g99.payment_id,
                           gateway="manual", gateway_order_id="order_manual_G99014",
                           gateway_payment_id="pay_manual_G99014CC4002"),
    ])

    # ----------------------------------------------------------- credentials
    db.add_all([
        CertificateTemplate(brand_id=teluguai.brand_id, course_id=course_py.course_id,
                            authorized_signatory="Ravi Shankar",
                            signatory_title="Lead Instructor, TeluguAI Academy"),
        CertificateTemplate(brand_id=genai99.brand_id, course_id=course_genai.course_id,
                            authorized_signatory="Dr. Arun Mehta",
                            signatory_title="Chief AI Instructor, GenAI99"),
        CertificateTemplate(brand_id=genai99.brand_id, course_id=course_prompt.course_id,
                            authorized_signatory="Dr. Arun Mehta",
                            signatory_title="Chief AI Instructor, GenAI99"),
    ])
    db.add(Certificate(
        brand_id=genai99.brand_id, enrolment_id=enrol_g99.enrolment_id,
        student_id=student_g99.user_id, course_id=course_genai.course_id,
        public_code="G99-CERT-2026-0042", issue_date=date(2026, 10, 15),
        instructor_name="Dr. Arun Mehta",
        skills_certified=["Prompt Engineering", "RAG Pipelines",
                          "Vector Databases", "Evaluation & Guardrails"]))

    # -------------------------------------------------------- announcements
    db.add_all([
        Announcement(brand_id=teluguai.brand_id, author_id=admin_ta.user_id,
                     title="Guest lecture: MLOps careers in Telugu states",
                     content="Industry guest on Friday 24 Oct, 7 PM IST. Attendance counts toward your 80% benchmark.",
                     target_audience="All Active Batches"),
        Announcement(brand_id=teluguai.brand_id, author_id=trainer_ta.user_id,
                     batch_id=batch_ta.batch_id,
                     title="Module 2 project submissions open",
                     content="Submit your Library REST API by 28 Oct 11:59 PM. Grading within 48 hours.",
                     target_audience="TA-PY-2026-C2 · Evening"),
        Announcement(brand_id=genai99.brand_id, author_id=admin_g99.user_id,
                     title="Hiring partners capstone showcase",
                     content="Top 10 capstones get fast-tracked interviews in December.",
                     target_audience="All Active Batches"),
        Announcement(brand_id=genai99.brand_id, author_id=trainer_g99.user_id,
                     batch_id=batch_g99.batch_id,
                     title="RAG capstone starter repo published",
                     content="Fork https://github.com/genai99/rag-capstone and submit before 1 Nov.",
                     target_audience="G99-GENAI-2026-S1 · Late Evening"),
    ])

    await db.commit()
    print("Seed complete:")
    print(f"  brands: {teluguai.slug}, {genai99.slug}")
    print("  student@teluguai.com / admin123  (partial fees, class today)")
    print("  student@genai99.com / admin123   (paid in full + certificate)")


async def main() -> None:
    async with SessionLocal() as db:
        existing = (
            await db.execute(text("select count(*) from users"))
        ).scalar_one()
        if existing and "--reset" not in sys.argv:
            print(f"Database already has {existing} users. Use --reset to reseed.")
            return
        if "--reset" in sys.argv:
            await reset(db)
            await db.commit()
            print("Reset done.")
        await seed(db)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())

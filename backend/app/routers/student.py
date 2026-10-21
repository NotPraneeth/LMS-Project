""" /api/student/* endpoints fulfilling frontend/src/lib/studentApi.ts.

Identity comes from the JWT cookie + X-Brand-Id header (validated in
app.core.deps); the email query-parameter pattern was removed.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_brand_context, get_student_enrolment
from app.models import (
    Announcement,
    Assignment,
    AssignmentSubmission,
    Batch,
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
    Invoice,
    LessonProgress,
    Payment,
    PaymentTransaction,
    Quiz,
    QuizAttempt,
    QuizAttemptAnswer,
    QuizQuestion,
    User,
)
from app.schemas.student import (
    Announcement as AnnouncementDTO,
    Assignment as AssignmentDTO,
    AssignmentsListResponse,
    AssignmentMutationResponse,
    AttendanceRecord,
    AttendanceSummary,
    Certificate as CertificateDTO,
    CertificateResponse,
    ClassSession as ClassSessionDTO,
    ClassSessionListResponse,
    CurriculumResponse,
    FeeAccount,
    FeeSummary,
    Lesson as LessonDTO,
    Material,
    MaterialsListResponse,
    Module as ModuleDTO,
    NextSession,
    PaymentReceipt,
    QuestionPublic,
    QuizAttemptResponse,
    QuizAttemptResult,
    QuizPublic,
    QuizQuestionReview,
    QuizzesListResponse,
    StudentDashboard,
    StudentProfile,
    SubmitAssignmentRequest,
    SubmitQuizAttemptRequest,
)

router = APIRouter(prefix="/api/student", tags=["student"])

IST = timezone(timedelta(hours=5, minutes=30))


# ----------------------------------------------------------------- helpers
def _ist(dt: datetime | None = None) -> datetime:
    return (dt or datetime.now(UTC)).astimezone(IST)


def _date_text(dt: datetime) -> str:
    return _ist(dt).strftime("%d %b %Y")


def _time_slot_text(start: datetime, end: datetime) -> str:
    s, e = _ist(start), _ist(end)
    return f"{s.strftime('%I:%M %p')} - {e.strftime('%I:%M %p')}"


def _fee_status_text(invoice_rows) -> str:
    if not invoice_rows:
        return "No dues"
    total_balance = sum(float(inv.balance_due) for inv in invoice_rows)
    if total_balance <= 0:
        return "Paid in full"
    today = _ist().date()
    overdue = any(
        inv.due_date < today and float(inv.balance_due) > 0 for inv in invoice_rows
    )
    return "Overdue" if overdue else "Partial payment due"


async def _trainer_name(db: AsyncSession, trainer_id: int | None) -> str:
    if trainer_id is None:
        return "Faculty"
    trainer = (
        await db.execute(select(User).where(User.user_id == trainer_id))
    ).scalar_one_or_none()
    return trainer.full_name if trainer else "Faculty"


async def _load_lesson_state(
    db: AsyncSession, enrolment: Enrolment
) -> tuple[list[ModuleDTO], dict[int, CourseLesson]]:
    """Ordered modules with derived per-lesson status (completed/in_progress/locked)."""
    modules = (
        await db.execute(
            select(CourseModule)
            .where(CourseModule.course_id == enrolment.course_id)
            .order_by(CourseModule.module_number)
        )
    ).scalars().all()

    module_ids = {m.module_id for m in modules}
    lessons = (
        await db.execute(
            select(CourseLesson)
            .where(CourseLesson.module_id.in_(module_ids))
            .order_by(CourseLesson.lesson_order)
        )
    ).scalars().all() if module_ids else []
    lesson_by_id = {l.lesson_id: l for l in lessons}

    progress_rows = (
        await db.execute(
            select(LessonProgress).where(
                LessonProgress.enrolment_id == enrolment.enrolment_id
            )
        )
    ).scalars().all()
    completed_ids = {p.lesson_id for p in progress_rows if p.status == "completed"}

    lesson_index_by_module: dict[int, list[CourseLesson]] = defaultdict(list)
    for l in lessons:
        lesson_index_by_module[l.module_id].append(l)

    # Derive statuses in course order: lessons already completed keep 'completed';
    # the first lesson after the last completed one is 'in_progress'; later are 'locked'.
    ordered: list[CourseLesson] = []
    for m in sorted(modules, key=lambda x: x.module_number):
        ordered.extend(sorted(lesson_index_by_module[m.module_id], key=lambda x: x.lesson_order))

    statuses: dict[int, str] = {}
    in_progress_assigned = False
    for lesson in ordered:
        if lesson.lesson_id in completed_ids:
            statuses[lesson.lesson_id] = "completed"
        elif not in_progress_assigned:
            statuses[lesson.lesson_id] = "in_progress"
            in_progress_assigned = True
        else:
            statuses[lesson.lesson_id] = "locked"

    modules_dto: list[ModuleDTO] = []
    for m in sorted(modules, key=lambda x: x.module_number):
        lessons_dto = [
            LessonDTO(
                id=str(l.lesson_id),
                title=l.title,
                duration=f"{l.duration_mins} mins",
                status=statuses.get(l.lesson_id, "locked"),
                summary=l.summary,
                video_url=l.video_url,
                code_snippet=l.code_snippet,
                notes_pdf_url=l.notes_pdf_url,
            )
            for l in sorted(lesson_index_by_module[m.module_id], key=lambda x: x.lesson_order)
        ]
        modules_dto.append(
            ModuleDTO(
                id=str(m.module_id),
                number=m.module_number,
                title=m.title,
                total_duration=m.total_duration,
                lessons=lessons_dto,
            )
        )
    return modules_dto, lesson_by_id


def _curriculum_progress_pct(modules: list[ModuleDTO]) -> int:
    all_lessons = [lesson for module in modules for lesson in module.lessons]
    if not all_lessons:
        return 0
    completed = sum(1 for lesson in all_lessons if lesson.status == "completed")
    return round(100 * completed / len(all_lessons))


async def _module_title_map(db: AsyncSession, enrolment: Enrolment) -> dict[int, str]:
    rows = (
        await db.execute(
            select(CourseModule)
            .where(CourseModule.course_id == enrolment.course_id)
            .order_by(CourseModule.module_number)
        )
    ).scalars().all()
    return {m.module_id: m.title for m in rows}


# ------------------------------------------------------------------- profile
@router.get("/profile", response_model=StudentProfile)
async def profile(
    ctx=Depends(get_brand_context),
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> StudentProfile:
    user_row, brand = ctx
    batch: Batch = enrolment.batch
    course: Course = enrolment.course
    instructor = await _trainer_name(db, batch.primary_trainer_id)
    return StudentProfile(
        id=str(enrolment.public_id),
        email=user_row.email,
        name=user_row.full_name,
        brand_id=brand.slug,
        phone=user_row.phone or "",
        course_title=course.title,
        batch_name=batch.name,
        instructor=instructor,
    )


# ----------------------------------------------------------------- dashboard
@router.get("/dashboard", response_model=StudentDashboard)
async def dashboard(
    ctx=Depends(get_brand_context),
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> StudentDashboard:
    user_row, brand = ctx
    course: Course = enrolment.course
    batch: Batch = enrolment.batch

    modules, _ = await _load_lesson_state(db, enrolment)
    progress = _curriculum_progress_pct(modules)

    # sessions for the batch
    session_rows = (
        await db.execute(
            select(ClassSession)
            .where(ClassSession.batch_id == batch.batch_id)
            .order_by(ClassSession.scheduled_start)
        )
    ).scalars().all()
    now = datetime.now(UTC)
    completed_count = sum(1 for s in session_rows if s.status == "completed")
    upcoming = [
        s for s in session_rows
        if s.status in ("upcoming", "live") and s.scheduled_start >= now
    ]
    next_row = upcoming[0] if upcoming else None

    # attendance across batch sessions
    attendance_rows = (
        await db.execute(
            select(ClassAttendance, ClassSession)
            .join(ClassSession, ClassAttendance.class_session_id == ClassSession.class_session_id)
            .where(
                ClassAttendance.student_id == user_row.user_id,
                ClassSession.batch_id == batch.batch_id,
            )
        )
    ).all()
    held = len(attendance_rows)
    present = sum(1 for a, _s in attendance_rows if a.status in ("present", "late"))
    attendance_rate = round(100 * present / held) if held else 0

    # assignments
    total_assignments = (
        await db.execute(
            select(func.count()).select_from(Assignment).where(
                Assignment.batch_id == batch.batch_id,
                Assignment.status != "closed",
            )
        )
    ).scalar_one()
    submissions = (
        await db.execute(
            select(AssignmentSubmission)
            .join(Assignment, AssignmentSubmission.assignment_id == Assignment.assignment_id)
            .where(
                AssignmentSubmission.student_id == user_row.user_id,
                Assignment.batch_id == batch.batch_id,
            )
        )
    ).scalars().all()
    assignments_done = len(submissions)

    # quiz average over this batch's quizzes
    attempts = (
        await db.execute(
            select(QuizAttempt)
            .join(Quiz, QuizAttempt.quiz_id == Quiz.quiz_id)
            .where(
                QuizAttempt.student_id == user_row.user_id,
                Quiz.batch_id == batch.batch_id,
            )
        )
    ).scalars().all()
    quiz_avg = (
        round(sum(float(a.score_percent) for a in attempts) / len(attempts))
        if attempts
        else 0
    )

    # fee status (invoices for this enrolment)
    invoice_rows = (
        await db.execute(
            select(Invoice)
            .where(Invoice.enrolment_id == enrolment.enrolment_id)
            .order_by(Invoice.created_at)
        )
    ).scalars().all()
    fee_status = _fee_status_text(invoice_rows)

    instructor = await _trainer_name(db, batch.primary_trainer_id)

    # three latest brand/cohort announcements
    announcement_rows = (
        await db.execute(
            select(Announcement)
            .where(
                Announcement.brand_id == brand.brand_id,
                Announcement.is_active.is_(True),
            )
            .where(
                (Announcement.batch_id.is_(None))
                | (Announcement.batch_id == batch.batch_id)
            )
            .order_by(Announcement.created_at.desc())
            .limit(3)
        )
    ).scalars().all()

    next_session_dto: NextSession | None = None
    if next_row is not None:
        next_session_dto = NextSession(
            id=str(next_row.class_session_id),
            topic=next_row.topic,
            instructor=instructor,
            date=_date_text(next_row.scheduled_start),
            time_slot=_time_slot_text(next_row.scheduled_start, next_row.scheduled_end),
            room_url=next_row.meeting_url,
            is_today=_ist(next_row.scheduled_start).date() == _ist().date(),
        )

    return StudentDashboard(
        progress=progress,
        completed_sessions=completed_count,
        total_sessions=len(session_rows),
        attendance_rate=attendance_rate,
        assignments_done=assignments_done,
        total_assignments=total_assignments,
        quiz_avg=quiz_avg,
        fee_status=fee_status,
        student_id=str(enrolment.public_id),
        student_name=user_row.full_name,
        brand_id=brand.slug,
        course_title=course.title,
        batch_name=batch.name,
        instructor=instructor,
        next_session=next_session_dto,
        announcements=[
            AnnouncementDTO(
                id=str(a.announcement_id),
                date=_date_text(a.created_at),
                title=a.title,
                message=a.content,
            )
            for a in announcement_rows
        ],
    )


# ------------------------------------------------------------------ curriculum
@router.get("/curriculum", response_model=CurriculumResponse)
async def curriculum(
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> CurriculumResponse:
    modules, _ = await _load_lesson_state(db, enrolment)
    return CurriculumResponse(modules=modules)


@router.post("/curriculum/lessons/{lesson_id}/complete", response_model=CurriculumResponse)
async def complete_lesson(
    lesson_id: int,
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> CurriculumResponse:
    _modules, lesson_by_id = await _load_lesson_state(db, enrolment)
    lesson = lesson_by_id.get(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found in your course")

    existing = (
        await db.execute(
            select(LessonProgress).where(
                LessonProgress.enrolment_id == enrolment.enrolment_id,
                LessonProgress.lesson_id == lesson_id,
            )
        )
    ).scalar_one_or_none()
    now = datetime.now(UTC)
    if existing is None:
        db.add(
            LessonProgress(
                brand_id=enrolment.brand_id,
                enrolment_id=enrolment.enrolment_id,
                lesson_id=lesson_id,
                status="completed",
                completed_at=now,
                updated_at=now,
            )
        )
    else:
        existing.status = "completed"
        existing.completed_at = now
        existing.updated_at = now
    await db.commit()

    refreshed, _ = await _load_lesson_state(db, enrolment)
    return CurriculumResponse(modules=refreshed)


# --------------------------------------------------------------- live classes
@router.get("/live-classes", response_model=ClassSessionListResponse)
async def live_classes(
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> ClassSessionListResponse:
    user_row, _brand = await _resolve_ctx(enrolment, db)
    batch: Batch = enrolment.batch

    session_rows = (
        await db.execute(
            select(ClassSession)
            .where(ClassSession.batch_id == batch.batch_id)
            .order_by(ClassSession.scheduled_start.desc())
        )
    ).scalars().all()

    attendance_by_session = {
        a.class_session_id: a.status
        for a in (
            await db.execute(
                select(ClassAttendance).where(ClassAttendance.student_id == user_row.user_id)
            )
        ).scalars().all()
    }

    instructor = await _trainer_name(db, batch.primary_trainer_id)
    today = _ist().date()

    sessions_dto = []
    for s in session_rows:
        if s.status == "cancelled":
            continue
        sessions_dto.append(
            ClassSessionDTO(
                id=str(s.class_session_id),
                topic=s.topic,
                instructor=instructor,
                date=_date_text(s.scheduled_start),
                time_slot=_time_slot_text(s.scheduled_start, s.scheduled_end),
                room_url=s.meeting_url,
                is_today=_ist(s.scheduled_start).date() == today,
                status="completed" if s.status == "completed" else "upcoming",
                attendance_status=attendance_by_session.get(s.class_session_id),
                recording_url=s.recording_url,
                notes_url=s.notes_url,
            )
        )
    return ClassSessionListResponse(sessions=sessions_dto)


async def _resolve_ctx(enrolment: Enrolment, db: AsyncSession):
    """Load the enrolment's student row (identity already validated upstream)."""
    student = (
        await db.execute(select(User).where(User.user_id == enrolment.student_id))
    ).scalar_one()
    return student, enrolment.brand_id


# ------------------------------------------------------------------ materials
@router.get("/materials", response_model=MaterialsListResponse)
async def materials(
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> MaterialsListResponse:
    from app.models import LearningMaterial

    rows = (
        await db.execute(
            select(LearningMaterial)
            .where(
                LearningMaterial.is_active.is_(True),
                (
                    (LearningMaterial.batch_id == enrolment.batch_id)
                    | (
                        LearningMaterial.batch_id.is_(None)
                        & (LearningMaterial.course_id == enrolment.course_id)
                    )
                ),
            )
            .order_by(LearningMaterial.created_at.desc())
        )
    ).scalars().all()

    module_titles = await _module_title_map(db, enrolment)
    course: Course = enrolment.course

    materials_dto = [
        Material(
            id=str(m.material_id),
            title=m.title,
            module=module_titles.get(m.module_id, "") or course.title,
            type=m.material_type,
            size=m.file_size_text or "",
            updated_date=_date_text(m.created_at),
            url=m.storage_key,
        )
        for m in rows
    ]
    return MaterialsListResponse(materials=materials_dto)


# ----------------------------------------------------------------- attendance
@router.get("/attendance", response_model=AttendanceSummary)
async def attendance(
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> AttendanceSummary:
    user_row, _brand_id = await _resolve_ctx(enrolment, db)

    rows = (
        await db.execute(
            select(ClassAttendance, ClassSession)
            .join(ClassSession, ClassAttendance.class_session_id == ClassSession.class_session_id)
            .where(
                ClassAttendance.student_id == user_row.user_id,
                ClassSession.batch_id == enrolment.batch_id,
            )
            .order_by(ClassSession.scheduled_start.desc())
        )
    ).all()

    records: list[AttendanceRecord] = []
    counts = {"present": 0, "late": 0, "absent": 0}
    for a, s in rows:
        counts[a.status] = counts.get(a.status, 0) + 1
        records.append(
            AttendanceRecord(
                id=str(a.attendance_id),
                date=_date_text(s.scheduled_start),
                topic=s.topic,
                time_slot=_time_slot_text(s.scheduled_start, s.scheduled_end),
                status=a.status,
                notes=a.remarks,
            )
        )

    total = len(rows)
    attended = counts["present"] + counts["late"]
    rate = round(100 * attended / total) if total else 0
    return AttendanceSummary(
        sessions=records,
        attendance_rate=rate,
        present_count=counts["present"],
        late_count=counts["late"],
        absent_count=counts["absent"],
        total_sessions=total,
    )


# ----------------------------------------------------------------- assignments
def _assignment_dto(
    a: Assignment, sub: AssignmentSubmission | None, module_label: str
) -> AssignmentDTO:
    if sub is None:
        status = "pending"
        score: float | None = None
    elif sub.status == "graded":
        status = "graded"
        score = float(sub.score) if sub.score is not None else None
    elif sub.status == "resubmit":
        status = "resubmit"
        score = float(sub.score) if sub.score is not None else None
    else:
        status = "submitted"
        score = sub.score if sub.score is not None else None
    return AssignmentDTO(
        id=str(a.assignment_id),
        title=a.title,
        module=module_label,
        due_date=_date_text(a.due_date),
        max_score=a.max_score,
        score=score,
        status=status,
        instructions=a.instructions,
        starter_repo_url=a.starter_repo_url,
        submitted_repo_url=sub.repo_url if sub else None,
        submission_notes=sub.student_notes if sub else None,
        submitted_at=_date_text(sub.submitted_at) if sub else None,
        instructor_feedback=sub.feedback if sub else None,
    )


@router.get("/assignments", response_model=AssignmentsListResponse)
async def assignments(
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> AssignmentsListResponse:
    user_row, _brand_id = await _resolve_ctx(enrolment, db)

    rows = (
        await db.execute(
            select(Assignment, AssignmentSubmission)
            .outerjoin(
                AssignmentSubmission,
                (AssignmentSubmission.assignment_id == Assignment.assignment_id)
                & (AssignmentSubmission.student_id == user_row.user_id),
            )
            .where(Assignment.batch_id == enrolment.batch_id)
            .order_by(Assignment.due_date.desc())
        )
    ).all()

    course: Course = enrolment.course
    dtos = [_assignment_dto(a, sub, course.title) for a, sub in rows]
    return AssignmentsListResponse(assignments=dtos)


@router.post(
    "/assignments/{assignment_id}/submit", response_model=AssignmentMutationResponse
)
async def submit_assignment(
    assignment_id: int,
    payload: SubmitAssignmentRequest,
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> AssignmentMutationResponse:
    user_row, _brand_id = await _resolve_ctx(enrolment, db)

    assignment = (
        await db.execute(
            select(Assignment).where(
                Assignment.assignment_id == assignment_id,
                Assignment.batch_id == enrolment.batch_id,
            )
        )
    ).scalar_one_or_none()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.status == "closed":
        raise HTTPException(status_code=403, detail="This assignment is closed for submissions")
    url = payload.repo_url.strip()
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=422, detail="Repo URL must start with http:// or https://")

    sub = (
        await db.execute(
            select(AssignmentSubmission).where(
                AssignmentSubmission.assignment_id == assignment_id,
                AssignmentSubmission.student_id == user_row.user_id,
            )
        )
    ).scalar_one_or_none()
    now = datetime.now(UTC)
    if sub is None:
        sub = AssignmentSubmission(
            brand_id=enrolment.brand_id,
            assignment_id=assignment_id,
            student_id=user_row.user_id,
            repo_url=url,
            student_notes=payload.notes,
            status="pending",
            submitted_at=now,
        )
        db.add(sub)
    else:
        sub.repo_url = url
        sub.student_notes = payload.notes
        sub.status = "pending"
        sub.submitted_at = now
        sub.graded_by = None
        sub.graded_at = None
    await db.commit()

    course: Course = enrolment.course
    return AssignmentMutationResponse(
        assignment=_assignment_dto(assignment, sub, course.title)
    )


# -------------------------------------------------------------------- quizzes
@router.get("/quizzes", response_model=QuizzesListResponse)
async def quizzes(
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> QuizzesListResponse:
    user_row, _brand_id = await _resolve_ctx(enrolment, db)

    quiz_rows = (
        await db.execute(
            select(Quiz)
            .where(
                Quiz.batch_id == enrolment.batch_id,
                Quiz.status == "active",
            )
            .order_by(Quiz.quiz_id)
        )
    ).scalars().all()

    quizzes_dto: list[QuizPublic] = []
    for q in quiz_rows:
        questions = (
            await db.execute(
                select(QuizQuestion)
                .where(QuizQuestion.quiz_id == q.quiz_id)
                .order_by(QuizQuestion.question_number)
            )
        ).scalars().all()
        attempts = (
            await db.execute(
                select(QuizAttempt)
                .where(
                    QuizAttempt.quiz_id == q.quiz_id,
                    QuizAttempt.student_id == user_row.user_id,
                )
                .order_by(QuizAttempt.attempt_number)
            )
        ).scalars().all()
        best = max((float(a.score_percent) for a in attempts), default=None)
        quizzes_dto.append(
            QuizPublic(
                id=str(q.quiz_id),
                title=q.title,
                duration_minutes=q.duration_minutes,
                pass_percentage=q.pass_percentage,
                question_count=len(questions),
                questions=[
                    QuestionPublic(
                        id=str(qq.question_id),
                        question_text=qq.question_text,
                        options=list(qq.options),
                    )
                    for qq in questions
                ],
                status="completed" if attempts else "available",
                last_score=best,
                attempts_count=len(attempts),
            )
        )
    return QuizzesListResponse(quizzes=quizzes_dto)


@router.post("/quizzes/{quiz_id}/attempts", response_model=QuizAttemptResponse)
async def submit_quiz_attempt(
    quiz_id: int,
    payload: SubmitQuizAttemptRequest,
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> QuizAttemptResponse:
    user_row, _brand_id = await _resolve_ctx(enrolment, db)

    quiz = (
        await db.execute(
            select(Quiz).where(
                Quiz.quiz_id == quiz_id,
                Quiz.batch_id == enrolment.batch_id,
                Quiz.status == "active",
            )
        )
    ).scalar_one_or_none()
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = (
        await db.execute(
            select(QuizQuestion)
            .where(QuizQuestion.quiz_id == quiz_id)
            .order_by(QuizQuestion.question_number)
        )
    ).scalars().all()
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz has no questions")

    previous_attempts = (
        await db.execute(
            select(QuizAttempt)
            .where(
                QuizAttempt.quiz_id == quiz_id,
                QuizAttempt.student_id == user_row.user_id,
            )
        )
    ).scalars().all()
    if len(previous_attempts) >= quiz.max_attempts:
        raise HTTPException(
            status_code=403,
            detail=f"Attempt limit reached ({quiz.max_attempts} attempts allowed)",
        )
    attempt_number = len(previous_attempts) + 1

    # validate answers: every question must be answered with a valid option index
    question_by_id = {str(qq.question_id): qq for qq in questions}
    if set(payload.answers.keys()) != set(question_by_id.keys()):
        raise HTTPException(status_code=422, detail="Answers must cover exactly all questions")
    selected: dict[int, int] = {}
    for qq in questions:
        key = str(qq.question_id)
        value = payload.answers[key]
        if not isinstance(value, int) or not (0 <= value < len(qq.options)):
            raise HTTPException(
                status_code=422, detail=f"Invalid option index for question {key}"
            )
        selected[qq.question_id] = value

    # grade server-side
    correct_count = sum(
        1 for qq in questions if selected[qq.question_id] == qq.correct_option_index
    )
    total = len(questions)
    score_percent = round(100.0 * correct_count / total, 2)
    passed = score_percent >= float(quiz.pass_percentage)

    attempt = QuizAttempt(
        brand_id=enrolment.brand_id,
        quiz_id=quiz_id,
        student_id=user_row.user_id,
        attempt_number=attempt_number,
        score_percent=score_percent,
        is_passed=passed,
        submitted_at=datetime.now(UTC),
    )
    db.add(attempt)
    await db.flush()  # obtain attempt.attempt_id

    now = datetime.now(UTC)
    for qq in questions:
        chosen = selected[qq.question_id]
        db.add(
            QuizAttemptAnswer(
                attempt_id=attempt.attempt_id,
                question_id=qq.question_id,
                selected_option_index=chosen,
                is_correct=chosen == qq.correct_option_index,
            )
        )

    # recompute quiz_average into course_progress
    course_progress = (
        await db.execute(
            select(CourseProgress).where(
                CourseProgress.enrolment_id == enrolment.enrolment_id
            )
        )
    ).scalar_one_or_none()
    if course_progress is not None:
        all_attempts = (
            await db.execute(
                select(QuizAttempt.score_percent)
                .join(Quiz, QuizAttempt.quiz_id == Quiz.quiz_id)
                .where(
                    Quiz.batch_id == enrolment.batch_id,
                    QuizAttempt.student_id == user_row.user_id,
                )
            )
        ).scalars().all()
        course_progress.quiz_average = round(
            sum(float(s) for s in all_attempts) / len(all_attempts), 2
        ) if all_attempts else 0.00
        course_progress.last_calculated_at = now

    await db.commit()

    review = [
        QuizQuestionReview(
            question_id=str(qq.question_id),
            question_text=qq.question_text,
            options=list(qq.options),
            selected_option_index=selected[qq.question_id],
            correct_option_index=qq.correct_option_index,
            is_correct=selected[qq.question_id] == qq.correct_option_index,
        )
        for qq in questions
    ]
    return QuizAttemptResponse(
        result=QuizAttemptResult(
            quiz_id=str(quiz_id),
            score_percent=score_percent,
            correct_count=correct_count,
            total_questions=total,
            passed=passed,
            pass_percentage=quiz.pass_percentage,
            submitted_at=_date_text(now),
            review=review,
        )
    )


# ----------------------------------------------------------------------- fees
@router.get("/fees", response_model=FeeAccount)
async def fees(
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> FeeAccount:
    invoice_rows = (
        await db.execute(
            select(Invoice)
            .where(Invoice.enrolment_id == enrolment.enrolment_id)
            .order_by(Invoice.created_at)
        )
    ).scalars().all()

    course: Course = enrolment.course
    currency = invoice_rows[0].currency if invoice_rows else course.currency
    billed = sum(float(inv.billed_amount) for inv in invoice_rows)
    paid = sum(float(inv.paid_amount) for inv in invoice_rows)
    balance = sum(float(inv.balance_due) for inv in invoice_rows)
    sticker = float(course.base_fee) if course.currency == currency else billed
    discount = max(0.0, sticker - billed)

    if invoice_rows and balance <= 0:
        status = "PAID_IN_FULL"
    elif invoice_rows and any(
        inv.due_date < _ist().date() and float(inv.balance_due) > 0 for inv in invoice_rows
    ):
        status = "OVERDUE"
    else:
        status = "PARTIAL_DUE"

    plan_name: str | None = None
    plan_rows = (
        await db.execute(
            select(FeePlan).where(FeePlan.course_id == course.course_id, FeePlan.is_active.is_(True))
        )
    ).scalars().all()
    for plan in plan_rows:
        if abs(float(plan.total_amount) - billed) < 0.01:
            plan_name = plan.plan_name
            break
    if plan_name is None:
        plan_name = plan_rows[0].plan_name if plan_rows else "Standard course fee"

    receipt_rows = (
        await db.execute(
            select(Payment, PaymentTransaction)
            .outerjoin(PaymentTransaction, PaymentTransaction.payment_id == Payment.payment_id)
            .where(Payment.invoice_id.in_([inv.invoice_id for inv in invoice_rows] or [0]))
            .order_by(Payment.created_at.desc())
        )
    ).all() if invoice_rows else []

    receipts = [
        PaymentReceipt(
            id=str(p.payment_id),
            receipt_number=p.receipt_number,
            date=_date_text(p.created_at),
            amount=float(p.amount),
            mode=p.payment_mode,
            status="SUCCESS",
            transaction_id=t.gateway_payment_id if t else p.receipt_number,
            description=f"{course.title} tuition — Invoice {inv.invoice_number}",
        )
        for p, t in receipt_rows
        for inv in [next((i for i in invoice_rows if i.invoice_id == p.invoice_id), None)]
        if inv is not None
    ]

    return FeeAccount(
        summary=FeeSummary(
            currency=currency,
            total_course_fee=sticker,
            discount_applied=discount,
            net_payable=billed,
            amount_paid=paid,
            balance_remaining=balance,
            status=status,
            plan=plan_name,
        ),
        receipts=receipts,
    )


# ---------------------------------------------------------------- certificates
@router.get("/certificates", response_model=CertificateResponse)
async def certificates(
    ctx=Depends(get_brand_context),
    enrolment: Enrolment = Depends(get_student_enrolment),
    db: AsyncSession = Depends(get_db),
) -> CertificateResponse:
    _user_row, brand = ctx
    course: Course = enrolment.course

    cert = (
        await db.execute(
            select(Certificate).where(Certificate.enrolment_id == enrolment.enrolment_id)
        )
    ).scalar_one_or_none()

    template = (
        await db.execute(
            select(CertificateTemplate).where(
                CertificateTemplate.course_id == course.course_id,
                CertificateTemplate.brand_id == brand.brand_id,
            )
        )
    ).scalar_one_or_none()

    if cert is not None:
        dto = CertificateDTO(
            brand_name=brand.name,
            course_name=course.title,
            cert_id=cert.public_code,
            issue_date=cert.issue_date.strftime("%d %B %Y"),
            instructor=cert.instructor_name,
            instructor_title=(
                template.signatory_title if template else "Lead Instructor"
            ),
            status="Issued & Verified",
            skills=list(cert.skills_certified),
        )
    else:
        dto = CertificateDTO(
            brand_name=brand.name,
            course_name=course.title,
            cert_id="PENDING",
            issue_date="Upon graduation",
            instructor=(
                template.authorized_signatory if template else "Program Director"
            ),
            instructor_title=(
                template.signatory_title if template else "Program Director"
            ),
            status="In Progress",
            skills=[],
        )
    return CertificateResponse(certificate=dto)

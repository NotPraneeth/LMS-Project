"""Response DTOs mirroring frontend/src/lib/studentApi.ts types 1:1."""

from app.schemas.base import CamelModel


# ---------------------------------------------------------------- curriculum
class Lesson(CamelModel):
    id: str
    title: str
    duration: str
    status: str  # 'completed' | 'in_progress' | 'locked'
    summary: str
    video_url: str | None = None
    code_snippet: str | None = None
    notes_pdf_url: str | None = None


class Module(CamelModel):
    id: str
    number: int
    title: str
    total_duration: str | None = None
    lessons: list[Lesson]


class CurriculumResponse(CamelModel):
    modules: list[Module]


# ------------------------------------------------------------- live classes
class ClassSession(CamelModel):
    id: str
    topic: str
    instructor: str
    date: str
    time_slot: str
    room_url: str
    is_today: bool
    status: str  # 'upcoming' | 'completed'
    attendance_status: str | None = None  # 'present' | 'absent'
    recording_url: str | None = None
    notes_url: str | None = None


# ---------------------------------------------------------------- materials
class Material(CamelModel):
    id: str
    title: str
    module: str
    type: str  # 'slides' | 'notebook' | 'cheatsheet' | 'code'
    size: str
    updated_date: str
    url: str


# --------------------------------------------------------------- assignments
class Assignment(CamelModel):
    id: str
    title: str
    module: str
    due_date: str
    max_score: int
    score: float | None = None
    status: str  # 'pending' | 'submitted' | 'graded' | 'resubmit'
    instructions: str
    starter_repo_url: str | None = None
    submitted_repo_url: str | None = None
    submission_notes: str | None = None
    submitted_at: str | None = None
    instructor_feedback: str | None = None


# ------------------------------------------------------------------- quizzes
class QuestionPublic(CamelModel):
    id: str
    question_text: str
    options: list[str]  # correct index intentionally NOT exposed


class QuizPublic(CamelModel):
    id: str
    title: str
    duration_minutes: int
    pass_percentage: int
    question_count: int
    questions: list[QuestionPublic]
    status: str  # 'available' | 'completed'
    last_score: float | None = None
    attempts_count: int


class QuizQuestionReview(CamelModel):
    question_id: str
    question_text: str
    options: list[str]
    selected_option_index: int | None = None
    correct_option_index: int
    is_correct: bool


class QuizAttemptResult(CamelModel):
    quiz_id: str
    score_percent: float
    correct_count: int
    total_questions: int
    passed: bool
    pass_percentage: int
    submitted_at: str
    review: list[QuizQuestionReview]


# ---------------------------------------------------------------- attendance
class AttendanceRecord(CamelModel):
    id: str
    date: str
    topic: str
    time_slot: str
    status: str  # 'present' | 'late' | 'absent'
    notes: str | None = None


class AttendanceSummary(CamelModel):
    sessions: list[AttendanceRecord]
    attendance_rate: float
    present_count: int
    late_count: int
    absent_count: int
    total_sessions: int


# --------------------------------------------------------------------- fees
class FeeSummary(CamelModel):
    currency: str  # 'INR' | 'USD'
    total_course_fee: float
    discount_applied: float
    net_payable: float
    amount_paid: float
    balance_remaining: float
    status: str  # 'PAID_IN_FULL' | 'PARTIAL_DUE' | 'OVERDUE'
    plan: str


class PaymentReceipt(CamelModel):
    id: str
    receipt_number: str
    date: str
    amount: float
    mode: str
    status: str  # 'SUCCESS'
    transaction_id: str
    description: str


class FeeAccount(CamelModel):
    summary: FeeSummary
    receipts: list[PaymentReceipt]


# -------------------------------------------------------------- certificates
class Certificate(CamelModel):
    brand_name: str
    course_name: str
    cert_id: str
    issue_date: str
    instructor: str
    instructor_title: str
    status: str  # 'Issued & Verified' | 'In Progress'
    skills: list[str]


# ---------------------------------------------------------------- dashboard
class Announcement(CamelModel):
    id: str
    date: str
    title: str
    message: str


class StudentProfile(CamelModel):
    id: str
    email: str
    name: str
    brand_id: str
    phone: str
    course_title: str
    batch_name: str
    instructor: str


class NextSession(CamelModel):
    id: str
    topic: str
    instructor: str
    date: str
    time_slot: str
    room_url: str
    is_today: bool


class StudentDashboard(CamelModel):
    progress: float
    completed_sessions: int
    total_sessions: int
    attendance_rate: float
    assignments_done: int
    total_assignments: int
    quiz_avg: float
    fee_status: str
    student_id: str
    student_name: str
    brand_id: str
    course_title: str
    batch_name: str
    instructor: str
    next_session: NextSession | None = None
    announcements: list[Announcement]


# ------------------------------------------------- list/mutation envelopes
# (frontend unwraps these: `.modules`, `.sessions`, `.materials`, …)
class ClassSessionListResponse(CamelModel):
    sessions: list[ClassSession]


class MaterialsListResponse(CamelModel):
    materials: list[Material]


class AssignmentsListResponse(CamelModel):
    assignments: list[Assignment]


class AssignmentMutationResponse(CamelModel):
    assignment: Assignment


class QuizzesListResponse(CamelModel):
    quizzes: list[QuizPublic]


class QuizAttemptResponse(CamelModel):
    result: QuizAttemptResult


class CertificateResponse(CamelModel):
    certificate: Certificate


# ------------------------------------------------------- mutation payloads
class SubmitAssignmentRequest(CamelModel):
    repo_url: str
    notes: str | None = None


class SubmitQuizAttemptRequest(CamelModel):
    answers: dict[str, int]  # question id (string) -> selected option index

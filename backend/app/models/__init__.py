"""SQLAlchemy models for all 42 schema tables + the `lesson_progress` addition.

Re-exported here so Alembic autogenerate and any `select(...)` sees the full
registry. Column specs: 05_data_dictionary.md; deviations: DE-1..DE-4 in
studentmoduleimplementation.md §11.
"""

from app.models.assessments import (
    Assignment,
    AssignmentSubmission,
    Quiz,
    QuizAttempt,
    QuizAttemptAnswer,
    QuizQuestion,
)
from app.models.academics import Batch, ClassAttendance, ClassSession
from app.models.comms import Announcement, WhatsAppMessage, WhatsAppTemplate
from app.models.crm import Lead, LeadNote, LeadStageHistory
from app.models.curriculum import Course, CourseLesson, CourseModule, LearningMaterial
from app.models.enrolment import Enrolment, EnrolmentStatusHistory
from app.models.finance import (
    FeePlan,
    FeePlanInstalment,
    Invoice,
    Payment,
    PaymentAdjustment,
    PaymentTransaction,
)
from app.models.identity import (
    Brand,
    Permission,
    RolePermission,
    StaffProfile,
    StudentProfile,
    User,
    UserBrandAccess,
    UserRole,
    UserSession,
)
from app.models.ops import AuditLog, SystemSetting, WebhookEvent
from app.models.progress import (
    Certificate,
    CertificateTemplate,
    CourseProgress,
    LessonProgress,
)

__all__ = [
    # Domain 01: Identity
    "Brand",
    "User",
    "UserBrandAccess",
    "UserRole",
    "Permission",
    "RolePermission",
    "StaffProfile",
    "StudentProfile",
    "UserSession",
    # Domain 02: Curriculum
    "Course",
    "CourseModule",
    "CourseLesson",
    "LearningMaterial",
    # Domain 03: Academics
    "Batch",
    "ClassSession",
    "ClassAttendance",
    # Domain 04: CRM
    "Lead",
    "LeadStageHistory",
    "LeadNote",
    # Domain 05: Enrolment
    "Enrolment",
    "EnrolmentStatusHistory",
    # Domain 06: Finance
    "FeePlan",
    "FeePlanInstalment",
    "Invoice",
    "Payment",
    "PaymentTransaction",
    "PaymentAdjustment",
    # Domain 07: Assessments
    "Assignment",
    "AssignmentSubmission",
    "Quiz",
    "QuizQuestion",
    "QuizAttempt",
    "QuizAttemptAnswer",
    # Domain 08: Progress
    "CourseProgress",
    "LessonProgress",
    "CertificateTemplate",
    "Certificate",
    # Domain 09: Communications
    "Announcement",
    "WhatsAppTemplate",
    "WhatsAppMessage",
    # Domain 10: Ops
    "SystemSetting",
    "AuditLog",
    "WebhookEvent",
]

"""Domain 08: Progress & Digital Credentials (tables 34-36 of 05_data_dictionary.md)
plus the documented `lesson_progress` addition (DE-4)."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CourseProgress(Base):
    __tablename__ = "course_progress"
    __table_args__ = (
        CheckConstraint("attendance_rate BETWEEN 0 AND 100", name="ck_course_progress_attendance"),
        CheckConstraint("assignments_done >= 0", name="ck_course_progress_assignments_done"),
        CheckConstraint("assignments_total >= 0", name="ck_course_progress_assignments_total"),
        CheckConstraint("quiz_average BETWEEN 0 AND 100", name="ck_course_progress_quiz_avg"),
        UniqueConstraint("enrolment_id", name="uq_course_progress_enrolment"),
        Index("idx_course_progress_student", "student_id"),
    )

    progress_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    enrolment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("enrolments.enrolment_id", ondelete="CASCADE")
    )
    student_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    attendance_rate: Mapped[float] = mapped_column(Numeric(5, 2), server_default=text("0.00"))
    assignments_done: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    assignments_total: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    quiz_average: Mapped[float] = mapped_column(Numeric(5, 2), server_default=text("0.00"))
    tuition_paid_in_full: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    is_eligible_for_cert: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    last_calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class LessonProgress(Base):
    """DE-4 addition: per-student lesson completion state for the curriculum UI."""

    __tablename__ = "lesson_progress"
    __table_args__ = (
        CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed')",
            name="ck_lesson_progress_status",
        ),
        UniqueConstraint("enrolment_id", "lesson_id", name="uq_lesson_progress_pair"),
        Index("idx_lesson_progress_enrolment", "enrolment_id"),
    )

    lesson_progress_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    enrolment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("enrolments.enrolment_id", ondelete="CASCADE")
    )
    lesson_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("course_lessons.lesson_id", ondelete="CASCADE")
    )
    status: Mapped[str] = mapped_column(String(20), server_default="'not_started'")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"
    __table_args__ = (
        UniqueConstraint("brand_id", "course_id", name="uq_certificate_templates_brand_course"),
    )

    template_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    course_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("courses.course_id", ondelete="RESTRICT")
    )
    authorized_signatory: Mapped[str] = mapped_column(String(150))
    signatory_title: Mapped[str] = mapped_column(String(150))
    signature_image_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Certificate(Base):
    __tablename__ = "certificates"
    __table_args__ = (
        UniqueConstraint("enrolment_id", name="uq_certificates_enrolment"),
        Index("idx_certificates_verify", "verification_uuid"),
    )

    certificate_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_code: Mapped[str] = mapped_column(String(50), unique=True)
    verification_uuid: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    enrolment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("enrolments.enrolment_id", ondelete="RESTRICT")
    )
    student_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    course_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("courses.course_id", ondelete="RESTRICT")
    )
    issue_date: Mapped[date] = mapped_column(Date, server_default=text("CURRENT_DATE"))
    instructor_name: Mapped[str] = mapped_column(String(150))
    skills_certified: Mapped[list] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    pdf_storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

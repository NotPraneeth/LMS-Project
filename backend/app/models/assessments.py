"""Domain 07: Assessments & Evaluation (tables 28-33 of 05_data_dictionary.md)."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        CheckConstraint("max_score > 0", name="ck_assignments_max_score"),
        CheckConstraint(
            "status IN ('active', 'reviewing', 'closed')", name="ck_assignments_status"
        ),
        Index("idx_assignments_batch_status", "batch_id", "status"),
    )

    assignment_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    batch_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("batches.batch_id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(200))
    instructions: Mapped[str] = mapped_column(String(255))
    starter_repo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    max_score: Mapped[int] = mapped_column(Integer, server_default=text("100"))
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), server_default="'active'")
    created_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    __table_args__ = (
        CheckConstraint("score >= 0", name="ck_assignment_submissions_score"),
        CheckConstraint(
            "status IN ('pending', 'graded', 'resubmit')", name="ck_assignment_submissions_status"
        ),
        UniqueConstraint("assignment_id", "student_id", name="uq_assignment_submissions_pair"),
        Index("idx_assignment_submissions_student", "student_id"),
        Index("idx_assignment_submissions_status", "assignment_id", "status"),
    )

    submission_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    assignment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assignments.assignment_id", ondelete="CASCADE")
    )
    student_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    repo_url: Mapped[str] = mapped_column(String(255))
    student_notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    feedback: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), server_default="'pending'")
    graded_by: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    graded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Quiz(Base):
    __tablename__ = "quizzes"
    __table_args__ = (
        CheckConstraint("duration_minutes > 0", name="ck_quizzes_duration"),
        CheckConstraint("pass_percentage BETWEEN 1 AND 100", name="ck_quizzes_pass_pct"),
        CheckConstraint("max_attempts >= 1", name="ck_quizzes_max_attempts"),
        CheckConstraint("status IN ('draft', 'active', 'archived')", name="ck_quizzes_status"),
    )

    quiz_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    batch_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("batches.batch_id", ondelete="CASCADE"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    duration_minutes: Mapped[int] = mapped_column(Integer, server_default=text("30"))
    pass_percentage: Mapped[int] = mapped_column(Integer, server_default=text("70"))
    max_attempts: Mapped[int] = mapped_column(Integer, server_default=text("3"))
    status: Mapped[str] = mapped_column(String(20), server_default="'draft'")
    created_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    __table_args__ = (
        CheckConstraint("question_number > 0", name="ck_quiz_questions_number"),
        CheckConstraint(
            "correct_option_index BETWEEN 0 AND 3", name="ck_quiz_questions_correct_index"
        ),
        UniqueConstraint("quiz_id", "question_number", name="uq_quiz_questions_quiz_number"),
    )

    question_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    quiz_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("quizzes.quiz_id", ondelete="CASCADE")
    )
    question_number: Mapped[int] = mapped_column(Integer)
    question_text: Mapped[str] = mapped_column(String(255))
    options: Mapped[list] = mapped_column(JSONB)
    correct_option_index: Mapped[int] = mapped_column(SmallInteger)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    __table_args__ = (
        CheckConstraint("attempt_number >= 1", name="ck_quiz_attempts_number"),
        CheckConstraint("score_percent BETWEEN 0 AND 100", name="ck_quiz_attempts_score"),
        UniqueConstraint(
            "quiz_id", "student_id", "attempt_number", name="uq_quiz_attempts_quiz_student_no"
        ),
        Index("idx_quiz_attempts_student", "student_id"),
    )

    attempt_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    quiz_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("quizzes.quiz_id", ondelete="RESTRICT")
    )
    student_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    attempt_number: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    score_percent: Mapped[float] = mapped_column(Numeric(5, 2))
    is_passed: Mapped[bool] = mapped_column()  # Boolean default inferred
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class QuizAttemptAnswer(Base):
    __tablename__ = "quiz_attempt_answers"
    __table_args__ = (
        CheckConstraint(
            "selected_option_index BETWEEN 0 AND 3",
            name="ck_quiz_attempt_answers_selected_index",
        ),
    )

    attempt_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("quiz_attempts.attempt_id", ondelete="CASCADE"),
        primary_key=True,
    )
    question_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("quiz_questions.question_id", ondelete="CASCADE"),
        primary_key=True,
    )
    selected_option_index: Mapped[int] = mapped_column(SmallInteger)
    is_correct: Mapped[bool] = mapped_column()

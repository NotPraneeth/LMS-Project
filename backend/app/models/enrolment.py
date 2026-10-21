"""Domain 05: Student Enrolment Lifecycle (tables 20-21 of 05_data_dictionary.md)."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Enrolment(Base):
    __tablename__ = "enrolments"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'completed', 'dropped', 'suspended')",
            name="ck_enrolments_status",
        ),
        UniqueConstraint("student_id", "batch_id", name="uq_enrolments_student_batch"),
        Index("idx_enrolments_student", "student_id"),
        Index("idx_enrolments_batch_status", "batch_id", "status"),
    )

    enrolment_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    student_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    course_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("courses.course_id", ondelete="RESTRICT")
    )
    batch_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("batches.batch_id", ondelete="RESTRICT")
    )
    enrolled_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    enrolment_date: Mapped[date] = mapped_column(Date, server_default=text("CURRENT_DATE"))
    status: Mapped[str] = mapped_column(String(20), server_default="'active'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", lazy="selectin")
    batch = relationship("Batch", lazy="selectin")
    student = relationship(
        "User",
        lazy="selectin",
        foreign_keys=[student_id],
    )


class EnrolmentStatusHistory(Base):
    __tablename__ = "enrolment_status_history"

    history_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    enrolment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("enrolments.enrolment_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    from_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    to_status: Mapped[str] = mapped_column(String(20))
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    changed_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

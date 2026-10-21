"""Domain 03: Cohorts, Classes & Timetable (tables 14-16 of 05_data_dictionary.md)."""

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
    Integer,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Batch(Base):
    __tablename__ = "batches"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'active', 'completed', 'archived')", name="ck_batches_status"
        ),
        CheckConstraint("max_capacity > 0", name="ck_batches_capacity"),
        UniqueConstraint("brand_id", "batch_id", name="uq_batches_brand_batch"),
        Index("idx_batches_brand_status", "brand_id", "status"),
        Index("idx_batches_trainer", "primary_trainer_id"),
    )

    batch_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    course_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("courses.course_id", ondelete="RESTRICT")
    )
    primary_trainer_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    name: Mapped[str] = mapped_column(String(150))
    schedule_days: Mapped[str] = mapped_column(String(100))
    timing_slot: Mapped[str] = mapped_column(String(100))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    max_capacity: Mapped[int] = mapped_column(Integer, server_default=text("50"))
    meeting_room_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), server_default="'pending'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ClassSession(Base):
    __tablename__ = "class_sessions"
    __table_args__ = (
        CheckConstraint("scheduled_end > scheduled_start", name="ck_class_sessions_range"),
        CheckConstraint("duration_mins > 0", name="ck_class_sessions_duration"),
        CheckConstraint(
            "mode IN ('live_lecture', 'workshop', 'doubt_clearing', 'lab')",
            name="ck_class_sessions_mode",
        ),
        CheckConstraint(
            "status IN ('upcoming', 'live', 'completed', 'cancelled')",
            name="ck_class_sessions_status",
        ),
        ExcludeConstraint(
            ("trainer_id", "="),
            (text("tstzrange(scheduled_start, scheduled_end)"), "&&"),
            name="prevent_trainer_double_booking",
            where=text("status != 'cancelled'"),
        ),
        Index("idx_class_sessions_batch_start", "batch_id", "scheduled_start"),
        Index("idx_class_sessions_trainer_status", "trainer_id", "status"),
    )

    class_session_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    batch_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("batches.batch_id", ondelete="CASCADE")
    )
    trainer_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    topic: Mapped[str] = mapped_column(String(255))
    mode: Mapped[str] = mapped_column(String(30), server_default="'live_lecture'")
    scheduled_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    scheduled_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duration_mins: Mapped[int] = mapped_column(Integer, server_default=text("90"))
    meeting_url: Mapped[str] = mapped_column(String(255))
    recording_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expected_attendees: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    status: Mapped[str] = mapped_column(String(20), server_default="'upcoming'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ClassAttendance(Base):
    __tablename__ = "class_attendance"
    __table_args__ = (
        CheckConstraint(
            "status IN ('present', 'late', 'absent')", name="ck_class_attendance_status"
        ),
        UniqueConstraint("class_session_id", "student_id", name="uq_class_attendance_session_student"),
        Index("idx_class_attendance_student_status", "student_id", "status"),
    )

    attendance_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    class_session_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("class_sessions.class_session_id", ondelete="CASCADE")
    )
    student_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    status: Mapped[str] = mapped_column(String(20))
    joined_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    marked_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    remarks: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

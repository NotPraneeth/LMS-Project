"""Domain 02: Course Catalogue & Curriculum (tables 10-13 of 05_data_dictionary.md)."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
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


class Course(Base):
    __tablename__ = "courses"
    __table_args__ = (
        CheckConstraint("duration_weeks > 0", name="ck_courses_duration"),
        CheckConstraint("base_fee >= 0", name="ck_courses_base_fee"),
        CheckConstraint("currency IN ('INR', 'USD')", name="ck_courses_currency"),
        CheckConstraint("status IN ('active', 'inactive')", name="ck_courses_status"),
        UniqueConstraint("brand_id", "slug", name="uq_courses_brand_slug"),
        Index("idx_courses_brand_status", "brand_id", "status"),
    )

    course_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    slug: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(100))
    duration_weeks: Mapped[int] = mapped_column(Integer, server_default=text("12"))
    base_fee: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0.00"))
    currency: Mapped[str] = mapped_column(String(3), server_default="'INR'")
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    usps: Mapped[list] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    status: Mapped[str] = mapped_column(String(20), server_default="'active'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CourseModule(Base):
    __tablename__ = "course_modules"
    __table_args__ = (
        CheckConstraint("module_number > 0", name="ck_course_modules_number"),
        UniqueConstraint("course_id", "module_number", name="uq_course_modules_course_number"),
        Index("idx_course_modules_course", "course_id"),
    )

    module_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    course_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("courses.course_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    module_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    total_duration: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CourseLesson(Base):
    __tablename__ = "course_lessons"
    __table_args__ = (
        CheckConstraint("lesson_order > 0", name="ck_course_lessons_order"),
        CheckConstraint("duration_mins > 0", name="ck_course_lessons_duration"),
        UniqueConstraint("module_id", "lesson_order", name="uq_course_lessons_module_order"),
        Index("idx_course_lessons_module", "module_id"),
    )

    lesson_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    module_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("course_modules.module_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    lesson_order: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    title: Mapped[str] = mapped_column(String(200))
    duration_mins: Mapped[int] = mapped_column(Integer, server_default=text("45"))
    summary: Mapped[str] = mapped_column(String(255))
    video_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    code_snippet: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes_pdf_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_preview: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LearningMaterial(Base):
    __tablename__ = "learning_materials"
    __table_args__ = (
        CheckConstraint(
            "material_type IN ('slides', 'notebook', 'video', 'cheatsheet', 'code')",
            name="ck_learning_materials_type",
        ),
        Index("idx_learning_materials_brand_type", "brand_id", "material_type"),
        Index("idx_learning_materials_batch", "batch_id"),
    )

    material_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    course_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("courses.course_id", ondelete="CASCADE"), nullable=True
    )
    module_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("course_modules.module_id", ondelete="SET NULL"), nullable=True
    )
    batch_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("batches.batch_id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255))
    material_type: Mapped[str] = mapped_column(String(30))
    storage_key: Mapped[str] = mapped_column(String(255))
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    file_size_text: Mapped[str | None] = mapped_column(String(50), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    uploaded_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

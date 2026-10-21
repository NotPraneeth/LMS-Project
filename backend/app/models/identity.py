"""Domain 01: Identity, Multi-Tenancy & Access (tables 1-9 of 05_data_dictionary.md)."""

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
    String,
    Uuid,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Brand(Base):
    __tablename__ = "brands"
    __table_args__ = (
        CheckConstraint("slug IN ('teluguai', 'genai99')", name="ck_brands_slug"),
        CheckConstraint("status IN ('active', 'maintenance')", name="ck_brands_status"),
    )

    brand_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    slug: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    domain: Mapped[str] = mapped_column(String(255), unique=True)
    logo_text: Mapped[str] = mapped_column(String(50))
    tagline: Mapped[str] = mapped_column(String(255))
    support_email: Mapped[str] = mapped_column(String(255))
    primary_color: Mapped[str] = mapped_column(String(30), server_default="'#059669'")
    accent_color: Mapped[str] = mapped_column(String(30), server_default="'#0284c7'")
    status: Mapped[str] = mapped_column(String(30), server_default="'active'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'inactive', 'suspended')", name="ck_users_status"
        ),
        Index("idx_users_phone", "phone", unique=False),
    )

    user_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )  # DE-1: citext -> normalized lowercase String
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(150))
    avatar_bg: Mapped[str | None] = mapped_column(String(30), server_default="'bg-slate-700'")
    is_super_admin: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    status: Mapped[str] = mapped_column(String(30), server_default="'active'")
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserBrandAccess(Base):
    __tablename__ = "user_brand_access"

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT"), primary_key=True
    )
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = (
        CheckConstraint(
            "role IN ('super_admin', 'admin', 'counselor', 'trainer', 'student')",
            name="ck_user_roles_role",
        ),
        UniqueConstraint("user_id", "brand_id", "role", name="uq_user_roles_user_brand_role"),
        Index("idx_user_roles_brand_role", "brand_id", "role"),
    )

    user_role_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    role: Mapped[str] = mapped_column(String(30))
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Permission(Base):
    __tablename__ = "permissions"

    permission_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    code: Mapped[str] = mapped_column(String(100), unique=True)
    module: Mapped[str] = mapped_column(String(100))
    action_name: Mapped[str] = mapped_column(String(150))
    description: Mapped[str] = mapped_column(String(255))


class RolePermission(Base):
    __tablename__ = "role_permissions"
    __table_args__ = (
        CheckConstraint(
            "role IN ('super_admin', 'admin', 'counselor', 'trainer', 'student')",
            name="ck_role_permissions_role",
        ),
    )

    role: Mapped[str] = mapped_column(String(30), primary_key=True)
    permission_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("permissions.permission_id", ondelete="CASCADE"),
        primary_key=True,
    )
    is_granted: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StaffProfile(Base):
    __tablename__ = "staff_profiles"
    __table_args__ = (
        CheckConstraint(
            "staff_type IN ('trainer', 'counselor', 'admin')", name="ck_staff_profiles_type"
        ),
        UniqueConstraint("user_id", "brand_id", name="uq_staff_profiles_user_brand"),
        Index("idx_staff_profiles_brand_type", "brand_id", "staff_type"),
    )

    staff_profile_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    staff_type: Mapped[str] = mapped_column(String(30))
    specialization: Mapped[str] = mapped_column(String(200))
    instructor_title: Mapped[str | None] = mapped_column(String(150), nullable=True)
    bio_summary: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    __table_args__ = (
        UniqueConstraint("user_id", "brand_id", name="uq_student_profiles_user_brand"),
        UniqueConstraint("brand_id", "student_roll_no", name="uq_student_profiles_roll_no"),
    )

    student_profile_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    student_roll_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    whatsapp_number: Mapped[str] = mapped_column(String(20))
    city_or_region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    education_bg: Mapped[str | None] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserSession(Base):
    __tablename__ = "user_sessions"
    __table_args__ = (Index("idx_user_sessions_user_expires", "user_id", "expires_at"),)

    session_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="CASCADE")
    )
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    ip_address: Mapped[str] = mapped_column(
        String(45)
    )  # DE-2: inet -> String(45) (IPv4/IPv6)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_activity_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

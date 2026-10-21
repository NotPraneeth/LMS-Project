"""Domain 10: Platform Ops, Security & Audit (tables 40-42 of 05_data_dictionary.md)."""

from __future__ import annotations

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
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SystemSetting(Base):
    __tablename__ = "system_settings"
    __table_args__ = (
        CheckConstraint(
            "setting_group IN ('payments', 'storage', 'email', 'security', 'whatsapp')",
            name="ck_system_settings_group",
        ),
        UniqueConstraint(
            "brand_id", "setting_group", "setting_key", name="uq_system_settings_brand_group_key"
        ),
    )

    setting_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("brands.brand_id", ondelete="RESTRICT"),
        nullable=True,  # NULL = platform-wide setting
    )
    setting_group: Mapped[str] = mapped_column(String(50))
    setting_key: Mapped[str] = mapped_column(String(100))
    setting_value: Mapped[str] = mapped_column(String(255))
    is_secret: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    """DE-2: monthly range partitioning deferred; rendered as a regular table."""

    __tablename__ = "audit_logs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('SUCCESS', 'WARNING', 'FAILED')", name="ck_audit_logs_status"
        ),
        Index("idx_audit_logs_actor", "actor_user_id", "created_at"),
        Index("idx_audit_logs_brand_action", "brand_id", "action", "created_at"),
    )

    audit_log_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    brand_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("brands.brand_id", ondelete="SET NULL"),
        nullable=True,  # NULL = platform-level event
    )
    actor_user_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    actor_name: Mapped[str] = mapped_column(String(150))
    actor_role: Mapped[str] = mapped_column(String(30))
    action: Mapped[str] = mapped_column(String(100))
    entity_name: Mapped[str] = mapped_column(String(100))
    ip_address: Mapped[str] = mapped_column(String(45))  # DE-2: inet -> String(45)
    status: Mapped[str] = mapped_column(String(20), server_default="'SUCCESS'")
    event_details: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"))


class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    __table_args__ = (
        CheckConstraint(
            "provider IN ('razorpay', 'stripe', 'meta_whatsapp')", name="ck_webhook_events_provider"
        ),
        CheckConstraint(
            "processing_status IN ('PENDING', 'PROCESSED', 'FAILED', 'IGNORED')",
            name="ck_webhook_events_status",
        ),
        UniqueConstraint("provider", "idempotency_key", name="uq_webhook_events_idempotency"),
        Index("idx_webhook_events_status", "processing_status", "received_at"),
    )

    webhook_event_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    provider: Mapped[str] = mapped_column(String(50))
    idempotency_key: Mapped[str] = mapped_column(String(200))
    event_type: Mapped[str] = mapped_column(String(100))
    payload: Mapped[dict] = mapped_column(JSONB)
    processing_status: Mapped[str] = mapped_column(String(30), server_default="'PENDING'")
    error_message: Mapped[str | None] = mapped_column(String(255), nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

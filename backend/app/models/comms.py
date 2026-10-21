"""Domain 09: Communications & Broadcasts (tables 37-39 of 05_data_dictionary.md)."""

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
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Announcement(Base):
    __tablename__ = "announcements"
    __table_args__ = (Index("idx_announcements_brand_created", "brand_id", "created_at"),)

    announcement_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    author_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(String(255))
    target_audience: Mapped[str] = mapped_column(String(100), server_default="'All Active Batches'")
    batch_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("batches.batch_id", ondelete="CASCADE"),
        nullable=True,
    )
    via_whatsapp: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class WhatsAppTemplate(Base):
    __tablename__ = "whatsapp_templates"
    __table_args__ = (
        CheckConstraint(
            "category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')",
            name="ck_whatsapp_templates_category",
        ),
        CheckConstraint(
            "status IN ('APPROVED', 'PENDING', 'REJECTED')", name="ck_whatsapp_templates_status"
        ),
        UniqueConstraint("brand_id", "name", name="uq_whatsapp_templates_brand_name"),
    )

    template_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(30))
    language: Mapped[str] = mapped_column(String(20), server_default="'en'")
    preview_text: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), server_default="'PENDING'")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"
    __table_args__ = (
        CheckConstraint(
            "delivery_status IN ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')",
            name="ck_whatsapp_messages_delivery_status",
        ),
        Index("idx_whatsapp_messages_phone", "recipient_phone"),
        Index("idx_whatsapp_messages_created", "created_at"),
    )

    message_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    template_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("whatsapp_templates.template_id", ondelete="SET NULL"),
        nullable=True,
    )
    recipient_phone: Mapped[str] = mapped_column(String(20))
    recipient_user_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    rendered_body: Mapped[str] = mapped_column(String(255))
    provider_message_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    delivery_status: Mapped[str] = mapped_column(String(30), server_default="'SENT'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

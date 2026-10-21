"""Domain 04: Admissions CRM (tables 17-19 of 05_data_dictionary.md)."""

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
    Numeric,
    String,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"
    __table_args__ = (
        CheckConstraint(
            "source IN ('Website', 'WhatsApp Inbound', 'Referral', 'Meta Ads', 'Google Search', 'LinkedIn')",
            name="ck_leads_source",
        ),
        CheckConstraint(
            "funnel_stage IN ('new', 'discussion', 'counseling_done', 'payment_pending', 'enrolled', 'lost')",
            name="ck_leads_funnel_stage",
        ),
        Index("idx_leads_brand_stage", "brand_id", "funnel_stage"),
    )

    lead_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    name: Mapped[str] = mapped_column(String(150))
    phone: Mapped[str] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)  # DE-1
    interested_course_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("courses.course_id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_counselor_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    source: Mapped[str] = mapped_column(String(50), server_default="'Website'")
    funnel_stage: Mapped[str] = mapped_column(String(30), server_default="'new'")
    fee_quoted: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    discussion_notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    converted_student_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LeadStageHistory(Base):
    __tablename__ = "lead_stage_history"
    __table_args__ = (Index("idx_lead_stage_history_lead", "lead_id", "created_at"),)

    stage_history_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    lead_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("leads.lead_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    from_stage: Mapped[str | None] = mapped_column(String(30), nullable=True)
    to_stage: Mapped[str] = mapped_column(String(30))
    changed_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    transition_notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LeadNote(Base):
    __tablename__ = "lead_notes"
    __table_args__ = (Index("idx_lead_notes_lead", "lead_id", "created_at"),)

    note_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    lead_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("leads.lead_id", ondelete="CASCADE")
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    author_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    note_text: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

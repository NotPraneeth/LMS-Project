"""Domain 06: Tuition Finance & Invoicing (tables 22-27 of 05_data_dictionary.md)."""

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


class FeePlan(Base):
    __tablename__ = "fee_plans"
    __table_args__ = (
        CheckConstraint("plan_type IN ('full', 'installment')", name="ck_fee_plans_type"),
        CheckConstraint("total_amount > 0", name="ck_fee_plans_total"),
        CheckConstraint("currency IN ('INR', 'USD')", name="ck_fee_plans_currency"),
        CheckConstraint("installments_count >= 1", name="ck_fee_plans_installments"),
    )

    fee_plan_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    course_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("courses.course_id", ondelete="RESTRICT")
    )
    plan_name: Mapped[str] = mapped_column(String(100))
    plan_type: Mapped[str] = mapped_column(String(20), server_default="'full'")
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), server_default="'INR'")
    installments_count: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class FeePlanInstalment(Base):
    __tablename__ = "fee_plan_instalments"
    __table_args__ = (
        CheckConstraint("instalment_no > 0", name="ck_fee_plan_instalments_no"),
        CheckConstraint("percentage BETWEEN 1 AND 100", name="ck_fee_plan_instalments_pct"),
        CheckConstraint("fixed_amount > 0", name="ck_fee_plan_instalments_amount"),
        CheckConstraint("due_offset_days >= 0", name="ck_fee_plan_instalments_offset"),
    )

    instalment_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    fee_plan_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("fee_plans.fee_plan_id", ondelete="CASCADE")
    )
    instalment_no: Mapped[int] = mapped_column(Integer)
    percentage: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    fixed_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    due_offset_days: Mapped[int] = mapped_column(Integer, server_default=text("0"))


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        CheckConstraint(
            "status IN ('Paid', 'Partial', 'Pending', 'Overdue')", name="ck_invoices_status"
        ),
        CheckConstraint("billed_amount > 0", name="ck_invoices_billed"),
        CheckConstraint("paid_amount >= 0", name="ck_invoices_paid"),
        CheckConstraint("balance_due >= 0", name="ck_invoices_balance"),
        CheckConstraint("currency IN ('INR', 'USD')", name="ck_invoices_currency"),
        UniqueConstraint("brand_id", "invoice_number", name="uq_invoices_brand_number"),
        Index("idx_invoices_student_status", "student_id", "status"),
    )

    invoice_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
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
    invoice_number: Mapped[str] = mapped_column(String(50))
    billed_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0.00"))
    balance_due: Mapped[float] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), server_default="'INR'")
    due_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), server_default="'Pending'")
    issued_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint(
            "payment_mode IN ('UPI', 'Credit Card', 'NetBanking', 'Stripe', 'Bank NEFT', 'Cash')",
            name="ck_payments_mode",
        ),
        CheckConstraint("amount > 0", name="ck_payments_amount"),
        CheckConstraint("currency IN ('INR', 'USD')", name="ck_payments_currency"),
        UniqueConstraint("brand_id", "receipt_number", name="uq_payments_brand_receipt"),
        Index("idx_payments_invoice", "invoice_id"),
    )

    payment_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, server_default=text("gen_random_uuid()"), unique=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    invoice_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("invoices.invoice_id", ondelete="RESTRICT")
    )
    receipt_number: Mapped[str] = mapped_column(String(50))
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), server_default="'INR'")
    payment_mode: Mapped[str] = mapped_column(String(30))
    recorded_by: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    __table_args__ = (
        CheckConstraint(
            "gateway IN ('razorpay', 'stripe', 'manual')", name="ck_payment_transactions_gateway"
        ),
        CheckConstraint(
            "status IN ('PENDING', 'SUCCESS', 'FAILED')", name="ck_payment_transactions_status"
        ),
    )

    transaction_id: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    payment_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("payments.payment_id", ondelete="SET NULL"),
        nullable=True,
    )
    gateway: Mapped[str] = mapped_column(String(30))
    gateway_order_id: Mapped[str | None] = mapped_column(String(150), nullable=True)
    gateway_payment_id: Mapped[str] = mapped_column(String(150), unique=True)
    raw_payload: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"))
    status: Mapped[str] = mapped_column(String(30), server_default="'SUCCESS'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PaymentAdjustment(Base):
    __tablename__ = "payment_adjustments"
    __table_args__ = (
        CheckConstraint(
            "adjustment_type IN ('refund', 'scholarship_waiver', 'discount_override', 'chargeback')",
            name="ck_payment_adjustments_type",
        ),
        CheckConstraint("amount != 0", name="ck_payment_adjustments_amount"),
        CheckConstraint("currency IN ('INR', 'USD')", name="ck_payment_adjustments_currency"),
    )

    adjustment_id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    brand_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("brands.brand_id", ondelete="RESTRICT")
    )
    invoice_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("invoices.invoice_id", ondelete="RESTRICT")
    )
    adjustment_type: Mapped[str] = mapped_column(String(30))
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), server_default="'INR'")
    reason: Mapped[str] = mapped_column(String(255))
    approved_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

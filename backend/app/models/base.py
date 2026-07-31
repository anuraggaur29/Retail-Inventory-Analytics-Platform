"""
Base model class shared by all SQLAlchemy models.

WHY A BASE CLASS WITH MIXINS?
- DRY: Every table needs id, created_at, updated_at
- Consistency: All timestamps use timezone-aware datetimes
- Convention: Auto-generates table names from class names

INTERVIEW TALKING POINT:
"I created a TimestampMixin so every table automatically gets created_at
and updated_at columns. The server_default=func.now() means PostgreSQL
generates the timestamp, not Python — this is important because in a
distributed system, server clocks may differ from DB clocks."
"""

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    SQLAlchemy 2.0 declarative base.
    All models inherit from this class.
    """
    pass


class TimestampMixin:
    """
    Mixin that adds created_at and updated_at columns to any model.

    server_default=func.now() — PostgreSQL generates the timestamp
    onupdate=func.now() — SQLAlchemy sets updated_at on every UPDATE
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

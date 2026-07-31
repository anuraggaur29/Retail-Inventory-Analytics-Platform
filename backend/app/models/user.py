"""
User model — authentication and authorization.

KEY DESIGN DECISIONS:
1. hashed_password stored, never plain text (bcrypt)
2. role_id is a FK to roles table (RBAC)
3. is_active enables soft-disable without deleting accounts
4. email has UNIQUE constraint + index for fast login lookups

INTERVIEW TALKING POINT:
"Passwords are hashed with bcrypt before storage — we never store or log
plain text passwords. The is_active flag allows disabling accounts without
deleting them, which preserves audit trails and foreign key integrity."
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationship: each user belongs to one role
    role: Mapped["Role"] = relationship("Role", back_populates="users")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"

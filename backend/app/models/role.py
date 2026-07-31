"""
Role model — defines the 4 RBAC roles.

WHY A SEPARATE ROLES TABLE (instead of an enum on users)?
- Extensibility: Add new roles without altering the users table
- Permissions: Can store granular permissions per role (future enhancement)
- Normalization: Role name stored once, referenced by FK
- Trade-off: Extra JOIN on auth queries, but roles table is tiny (4 rows)

INTERVIEW TALKING POINT:
"I normalized roles into a separate table instead of using a VARCHAR column
on users. This means adding a new role is an INSERT, not a schema migration.
It also enables storing per-role permissions as a JSON column in the future."
"""

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationship: one role has many users
    users: Mapped[list["User"]] = relationship("User", back_populates="role")

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name='{self.name}')>"

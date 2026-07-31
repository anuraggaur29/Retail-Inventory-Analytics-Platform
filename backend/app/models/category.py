"""
Category model — product classification.

WHY A SEPARATE CATEGORIES TABLE?
The raw dataset stores category as a string like "Fruits & Vegetables" on
every row (~3700 times). Normalizing this into a separate table:
1. Eliminates data redundancy (store the string once, reference by FK)
2. Prevents inconsistency (typo in one row doesn't create a new category)
3. Enables category-level queries without GROUP BY on strings
4. Supports slugs for URL-friendly routes (/categories/fruits-vegetables)

INTERVIEW TALKING POINT:
"I extracted categories into a normalized table to eliminate storing the same
string 3700 times. This is textbook 2NF — removing partial dependencies.
The slug column enables clean URLs, and is_active supports soft-delete."
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False, index=True
    )
    slug: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False, index=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship: one category has many products
    products: Mapped[list["Product"]] = relationship(
        "Product", back_populates="category"
    )

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name='{self.name}')>"

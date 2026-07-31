"""
Inventory model — tracks stock levels separately from the product catalog.

WHY SEPARATE FROM PRODUCTS?
Products table = catalog data (name, price, category) — changes rarely.
Inventory table = operational data (stock count, restock dates) — changes frequently.

Separating them follows the Single Responsibility Principle:
- Different update frequencies (inventory updates hourly, products update weekly)
- Different access patterns (warehouse team vs catalog team)
- Different write contention (stock changes are high-frequency)
- One-to-one relationship enforced by UNIQUE constraint on product_id

INTERVIEW TALKING POINT:
"I separated inventory from products because they have different change rates
and are owned by different teams in a real company. The catalog team manages
product details while the warehouse team manages stock. This avoids write
contention — frequent inventory updates don't lock the products table.
The UNIQUE constraint on product_id enforces the 1:1 relationship."
"""

from datetime import datetime

from sqlalchemy import (
    Boolean, CheckConstraint, DateTime, ForeignKey, Integer, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = (
        CheckConstraint(
            "available_quantity >= 0",
            name="ck_inventory_quantity_non_negative"
        ),
        CheckConstraint(
            "reorder_level >= 0",
            name="ck_inventory_reorder_non_negative"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        unique=True,  # Enforces 1:1 relationship
        nullable=False,
        index=True,
    )
    available_quantity: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    reorder_level: Mapped[int] = mapped_column(
        Integer, nullable=False, default=10
    )
    is_out_of_stock: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    last_restocked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationship: each inventory record belongs to one product
    product: Mapped["Product"] = relationship(
        "Product", back_populates="inventory"
    )

    def __repr__(self) -> str:
        return (
            f"<Inventory(product_id={self.product_id}, "
            f"qty={self.available_quantity})>"
        )

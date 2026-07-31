"""
Product model — core entity representing each SKU in the inventory.

KEY DESIGN DECISIONS:
1. mrp_paise (INTEGER): Stores original price in paise for precision.
   Financial systems avoid floats because 0.1 + 0.2 != 0.3 in IEEE 754.
   Integers are exact.

2. mrp (NUMERIC): Computed rupee value for display (mrp_paise / 100).
   NUMERIC type is arbitrary-precision decimal — no floating point errors.

3. discount_percent (NUMERIC): Stored from dataset, CHECK constraint 0-100.

4. selling_price (NUMERIC): Pre-computed (mrp - discount). Avoids
   recomputing on every query.

5. is_active (BOOLEAN): Soft delete — keeps FK integrity and audit trail.

INTERVIEW TALKING POINT:
"I store prices in paise as integers for precision, and also store the rupee
value as NUMERIC(10,2) for query convenience. I chose NUMERIC over FLOAT
because financial calculations require exact decimal arithmetic — FLOAT
uses IEEE 754 which has rounding errors. The selling_price is pre-computed
and stored rather than calculated on every query, which is a denormalization
trade-off: slightly more storage for faster reads."
"""

from datetime import datetime

from sqlalchemy import (
    Boolean, CheckConstraint, DateTime, ForeignKey, Integer,
    Numeric, String, Text, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Product(Base, TimestampMixin):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("mrp_paise >= 0", name="ck_products_mrp_positive"),
        CheckConstraint(
            "discount_percent >= 0 AND discount_percent <= 100",
            name="ck_products_discount_range"
        ),
        CheckConstraint(
            "selling_price >= 0", name="ck_products_selling_price_positive"
        ),
        CheckConstraint(
            "weight_gms >= 0", name="ck_products_weight_positive"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sku: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"), nullable=False, index=True
    )

    # Pricing — stored in both paise (precision) and rupees (convenience)
    mrp_paise: Mapped[int] = mapped_column(Integer, nullable=False)
    mrp: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount_percent: Mapped[float] = mapped_column(
        Numeric(5, 2), nullable=False, default=0
    )
    selling_price: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False
    )

    # Product attributes
    weight_gms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quantity_desc: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    # Soft delete
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False
    )

    # Relationships
    category: Mapped["Category"] = relationship(
        "Category", back_populates="products"
    )
    inventory: Mapped["Inventory"] = relationship(
        "Inventory", back_populates="product", uselist=False
    )
    price_history: Mapped[list["PriceHistory"]] = relationship(
        "PriceHistory", back_populates="product",
        order_by="PriceHistory.changed_at.desc()"
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, sku='{self.sku}', name='{self.name}')>"

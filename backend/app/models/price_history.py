"""
PriceHistory model — immutable log of every price change.

WHY TRACK PRICE HISTORY?
1. Business value: Analyze pricing trends, measure discount effectiveness
2. SQL showcase: Enables LAG() window function to compare current vs previous price
3. Audit requirement: Production systems need to know who changed what and when
4. Analytics: Price trend charts on the dashboard

The trigger (created in migrations) auto-inserts a record here whenever
a product's selling_price or discount_percent is updated.

INTERVIEW TALKING POINT:
"Price history is an append-only table — records are never updated or deleted.
This creates an immutable audit trail. I use a PostgreSQL trigger to auto-insert
records when product prices change, so the application code doesn't need to
remember to log changes. This is the Event Sourcing principle applied to pricing."
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"), nullable=False, index=True
    )

    # Old values (before the change)
    old_mrp: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    old_discount_percent: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    old_selling_price: Mapped[float | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )

    # New values (after the change)
    new_mrp: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    new_discount_percent: Mapped[float] = mapped_column(
        Numeric(5, 2), nullable=False
    )
    new_selling_price: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False
    )

    change_reason: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship
    product: Mapped["Product"] = relationship(
        "Product", back_populates="price_history"
    )

    def __repr__(self) -> str:
        return (
            f"<PriceHistory(product_id={self.product_id}, "
            f"old=₹{self.old_selling_price}, new=₹{self.new_selling_price})>"
        )

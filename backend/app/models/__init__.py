"""
Models package — imports all models so Alembic can discover them.

WHY THIS FILE MATTERS:
Alembic's autogenerate feature needs all models imported into a single place.
When alembic/env.py does `from app.models import Base`, it gets the Base class
with ALL table metadata registered. Without this, Alembic won't detect tables.
"""

from app.models.base import Base, TimestampMixin
from app.models.role import Role
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.price_history import PriceHistory

__all__ = [
    "Base",
    "TimestampMixin",
    "Role",
    "User",
    "Category",
    "Product",
    "Inventory",
    "PriceHistory",
]

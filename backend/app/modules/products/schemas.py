"""
Products Pydantic schemas — request/response DTOs.
"""

from datetime import datetime
from pydantic import BaseModel


class ProductResponse(BaseModel):
    """Single product in list view."""
    id: int
    sku: str
    name: str
    category_name: str
    mrp: float
    discount_percent: float
    selling_price: float
    weight_gms: int | None
    quantity_desc: str | None
    available_quantity: int
    is_out_of_stock: bool

    class Config:
        from_attributes = True


class PriceHistoryItem(BaseModel):
    """A single price change record."""
    old_selling_price: float | None
    new_selling_price: float | None
    old_discount_percent: float | None
    new_discount_percent: float | None
    change_reason: str | None
    changed_at: datetime

    class Config:
        from_attributes = True


class ProductDetailResponse(BaseModel):
    """Full product detail with inventory and price history."""
    id: int
    sku: str
    name: str
    category_id: int
    category_name: str
    mrp_paise: int
    mrp: float
    discount_percent: float
    selling_price: float
    weight_gms: int | None
    quantity_desc: str | None
    is_active: bool
    created_at: datetime
    # Inventory
    available_quantity: int
    reorder_level: int
    is_out_of_stock: bool
    last_restocked_at: datetime | None
    # Price history
    price_history: list[PriceHistoryItem]

    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    """Category with product count."""
    id: int
    name: str
    slug: str
    product_count: int

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    """Generic paginated response envelope."""
    data: list
    meta: dict

    class Config:
        from_attributes = True

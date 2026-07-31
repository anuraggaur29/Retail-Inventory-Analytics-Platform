"""
Inventory Pydantic schemas.
"""

from datetime import datetime
from pydantic import BaseModel


class InventoryItemResponse(BaseModel):
    """Stock level for a single product."""
    product_id: int
    product_name: str
    sku: str
    category_name: str
    available_quantity: int
    reorder_level: int
    is_out_of_stock: bool
    stock_status: str  # "Critical", "Low", "Normal", "Overstocked"
    selling_price: float
    inventory_value: float  # quantity * selling_price
    last_restocked_at: datetime | None

    class Config:
        from_attributes = True


class StockAlertResponse(BaseModel):
    """A product that needs attention (low stock or out of stock)."""
    product_id: int
    product_name: str
    sku: str
    category_name: str
    available_quantity: int
    reorder_level: int
    alert_type: str  # "OUT_OF_STOCK" or "LOW_STOCK"
    selling_price: float

    class Config:
        from_attributes = True


class RestockRequest(BaseModel):
    """Request body for restocking a product."""
    quantity: int


class RestockResponse(BaseModel):
    """Response after restocking."""
    product_id: int
    product_name: str
    previous_quantity: int
    added_quantity: int
    new_quantity: int
    message: str

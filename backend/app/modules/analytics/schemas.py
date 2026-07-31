"""
Analytics Pydantic schemas.
"""

from pydantic import BaseModel


class KPICardsResponse(BaseModel):
    total_products: int
    total_inventory_value: float
    out_of_stock_percentage: float
    avg_discount_percentage: float
    total_categories: int
    low_stock_count: int


class CategoryAnalyticsItem(BaseModel):
    category_id: int
    category_name: str
    product_count: int
    total_inventory_value: float
    avg_mrp: float
    avg_discount: float
    out_of_stock_count: int
    rank_by_value: int


class DashboardAnalyticsResponse(BaseModel):
    kpis: KPICardsResponse
    top_categories: list[CategoryAnalyticsItem]
    recent_price_changes: list[dict]

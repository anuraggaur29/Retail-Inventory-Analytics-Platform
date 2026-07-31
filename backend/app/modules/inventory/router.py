"""
Inventory router — HTTP endpoints for stock management.

ENDPOINTS:
1. GET /inventory — Stock levels with CASE-based classification
2. GET /inventory/alerts — Out-of-stock and low-stock alerts
3. POST /inventory/{product_id}/restock — Restock a product (Manager+ only)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole
from app.core.dependencies import PaginationParams
from app.models.user import User
from app.modules.inventory.service import inventory_service
from app.modules.inventory.schemas import RestockRequest

router = APIRouter()


@router.get("/inventory")
def list_inventory(
    pagination: PaginationParams = Depends(),
    category_id: int | None = Query(None),
    stock_status: str | None = Query(
        None, description="Filter: Critical, Low, Normal, Overstocked"
    ),
    sort_by: str = Query("available_quantity"),
    order: str = Query("asc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List inventory with stock status classification and filtering."""
    items, total = inventory_service.list_inventory(
        db,
        page=pagination.page,
        page_size=pagination.page_size,
        category_id=category_id,
        stock_status=stock_status,
        sort_by=sort_by,
        order=order,
    )
    return {
        "data": items,
        "meta": {
            "total": total,
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total_pages": (total + pagination.page_size - 1) // pagination.page_size,
        },
    }


@router.get("/inventory/alerts")
def get_stock_alerts(
    current_user: User = Depends(
        RequireRole(["admin", "manager", "analyst"])
    ),
    db: Session = Depends(get_db),
):
    """
    Get products needing attention — out of stock or below reorder level.
    Requires Analyst role or higher.
    """
    alerts = inventory_service.get_alerts(db)
    return {
        "data": alerts,
        "meta": {"total": len(alerts)},
    }


@router.post("/inventory/{product_id}/restock")
def restock_product(
    product_id: int,
    body: RestockRequest,
    current_user: User = Depends(
        RequireRole(["admin", "manager"])
    ),
    db: Session = Depends(get_db),
):
    """
    Restock a product. Requires Manager role or higher.
    This is a write operation protected by RBAC.
    """
    try:
        result = inventory_service.restock(db, product_id, body.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not result:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"data": result}

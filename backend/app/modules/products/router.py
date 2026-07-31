"""
Products router — HTTP endpoints for products and categories.

ENDPOINTS:
1. GET /products — List with pagination, filtering, sorting, search
2. GET /products/{id} — Single product detail
3. GET /categories — All categories with product counts
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.dependencies import PaginationParams
from app.models.user import User
from app.modules.products.service import product_service

router = APIRouter()


@router.get("/products")
def list_products(
    pagination: PaginationParams = Depends(),
    category_id: int | None = Query(None, description="Filter by category"),
    search: str | None = Query(None, description="Search product name"),
    in_stock: bool | None = Query(None, description="Filter by stock status"),
    min_price: float | None = Query(None, ge=0, description="Minimum price"),
    max_price: float | None = Query(None, ge=0, description="Maximum price"),
    sort_by: str = Query("name", description="Sort field"),
    order: str = Query("asc", description="Sort order: asc or desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List products with filtering, search, sorting, and pagination.

    All query parameters are optional. Examples:
    - /products?search=milk&category_id=3
    - /products?in_stock=true&min_price=10&max_price=500
    - /products?sort_by=selling_price&order=desc&page=2&page_size=50
    """
    products, total = product_service.list_products(
        db,
        page=pagination.page,
        page_size=pagination.page_size,
        category_id=category_id,
        search=search,
        in_stock=in_stock,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        order=order,
    )

    return {
        "data": products,
        "meta": {
            "total": total,
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total_pages": (total + pagination.page_size - 1) // pagination.page_size,
        },
    }


@router.get("/products/{product_id}")
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single product with full details, inventory, and price history."""
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"data": product}


@router.get("/categories")
def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all categories with product counts."""
    categories = product_service.list_categories(db)
    return {"data": categories}

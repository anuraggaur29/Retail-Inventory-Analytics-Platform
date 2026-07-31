"""
Analytics router — HTTP endpoints for analytics dashboard metrics.

ENDPOINTS:
1. GET /analytics/dashboard — Summary KPIs + chart data
2. GET /analytics/category-performance — Category ranking and analytics
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.modules.analytics.service import analytics_service

router = APIRouter()


@router.get("/analytics/dashboard")
def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get high-level dashboard metrics (KPI cards + overview)."""
    data = analytics_service.get_dashboard_summary(db)
    return {"data": data}


@router.get("/analytics/category-performance")
def get_category_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed category metrics ranked by total inventory value."""
    data = analytics_service.get_category_performance(db)
    return {"data": data}

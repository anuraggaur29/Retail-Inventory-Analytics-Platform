"""Analytics service — business logic layer."""

from sqlalchemy.orm import Session
from app.modules.analytics.repository import analytics_repo


class AnalyticsService:
    @staticmethod
    def get_dashboard_summary(db: Session) -> dict:
        kpis = analytics_repo.get_dashboard_kpis(db)
        categories = analytics_repo.get_category_analytics(db)
        recent_changes = analytics_repo.get_recent_price_changes_with_lag(db)

        return {
            "kpis": kpis,
            "top_categories": categories[:10],
            "recent_price_changes": recent_changes,
        }

    @staticmethod
    def get_category_performance(db: Session) -> list[dict]:
        return analytics_repo.get_category_analytics(db)


analytics_service = AnalyticsService()

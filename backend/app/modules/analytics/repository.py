"""
Analytics repository — Advanced SQL queries.

SQL CONCEPTS DEMONSTRATED:
1. CTE (Common Table Expressions) — Multi-step aggregations
2. Window Functions: RANK(), DENSE_RANK(), ROW_NUMBER()
3. Window Function: LAG() — Compare price changes across historical records
4. Aggregate Functions: SUM, AVG, COUNT, MIN, MAX
5. HAVING — Aggregate filtering
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


class AnalyticsRepository:

    @staticmethod
    def get_dashboard_kpis(db: Session) -> dict:
        """
        Dashboard KPIs using CTE and aggregation.

        SQL CONCEPT: CTE & Aggregations
        -------------------------------
        WITH kpi_data AS (
            SELECT
                COUNT(p.id) AS total_products,
                COALESCE(SUM(i.available_quantity * p.selling_price), 0) AS total_inventory_value,
                COUNT(CASE WHEN i.is_out_of_stock = true THEN 1 END) AS out_of_stock_count,
                AVG(p.discount_percent) AS avg_discount_percentage,
                COUNT(CASE WHEN i.available_quantity > 0 AND i.available_quantity <= i.reorder_level THEN 1 END) AS low_stock_count
            FROM products p
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE p.is_active = true
        )
        SELECT *,
               ROUND((out_of_stock_count::numeric / NULLIF(total_products, 0)) * 100, 2) AS out_of_stock_percentage
        FROM kpi_data;
        """
        query = text("""
            WITH kpi_data AS (
                SELECT
                    COUNT(p.id) AS total_products,
                    COALESCE(SUM(i.available_quantity * p.selling_price), 0) AS total_inventory_value,
                    COUNT(CASE WHEN i.is_out_of_stock = true OR i.available_quantity = 0 THEN 1 END) AS out_of_stock_count,
                    ROUND(COALESCE(AVG(p.discount_percent), 0), 2) AS avg_discount_percentage,
                    COUNT(CASE WHEN i.available_quantity > 0 AND i.available_quantity <= i.reorder_level THEN 1 END) AS low_stock_count
                FROM products p
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.is_active = true
            )
            SELECT
                total_products,
                total_inventory_value,
                out_of_stock_count,
                avg_discount_percentage,
                low_stock_count,
                ROUND((CAST(out_of_stock_count AS NUMERIC) / NULLIF(total_products, 0)) * 100, 2) AS out_of_stock_percentage
            FROM kpi_data;
        """)

        result = db.execute(query).mappings().first()
        cat_count = db.execute(text("SELECT COUNT(*) FROM categories WHERE is_active = true")).scalar()

        return {
            "total_products": result["total_products"] or 0,
            "total_inventory_value": float(result["total_inventory_value"] or 0),
            "out_of_stock_percentage": float(result["out_of_stock_percentage"] or 0),
            "avg_discount_percentage": float(result["avg_discount_percentage"] or 0),
            "total_categories": cat_count or 0,
            "low_stock_count": result["low_stock_count"] or 0,
        }

    @staticmethod
    def get_category_analytics(db: Session) -> list[dict]:
        """
        Category-level performance metrics using Window Function RANK().

        SQL CONCEPT: RANK() OVER (ORDER BY SUM(...) DESC)
        -------------------------------------------------
        SELECT
            c.id AS category_id,
            c.name AS category_name,
            COUNT(p.id) AS product_count,
            COALESCE(SUM(i.available_quantity * p.selling_price), 0) AS total_inventory_value,
            COALESCE(AVG(p.mrp), 0) AS avg_mrp,
            COALESCE(AVG(p.discount_percent), 0) AS avg_discount,
            COUNT(CASE WHEN i.is_out_of_stock = true THEN 1 END) AS out_of_stock_count,
            RANK() OVER (ORDER BY COALESCE(SUM(i.available_quantity * p.selling_price), 0) DESC) AS rank_by_value
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE c.is_active = true
        GROUP BY c.id, c.name
        ORDER BY rank_by_value;
        """
        query = text("""
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                COUNT(p.id) AS product_count,
                COALESCE(SUM(i.available_quantity * p.selling_price), 0) AS total_inventory_value,
                COALESCE(AVG(p.mrp), 0) AS avg_mrp,
                COALESCE(AVG(p.discount_percent), 0) AS avg_discount,
                COUNT(CASE WHEN i.is_out_of_stock = true OR i.available_quantity = 0 THEN 1 END) AS out_of_stock_count,
                RANK() OVER (ORDER BY COALESCE(SUM(i.available_quantity * p.selling_price), 0) DESC) AS rank_by_value
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE c.is_active = true
            GROUP BY c.id, c.name
            ORDER BY rank_by_value;
        """)

        results = db.execute(query).mappings().all()

        return [
            {
                "category_id": r["category_id"],
                "category_name": r["category_name"],
                "product_count": r["product_count"],
                "total_inventory_value": float(r["total_inventory_value"]),
                "avg_mrp": float(r["avg_mrp"]),
                "avg_discount": float(r["avg_discount"]),
                "out_of_stock_count": r["out_of_stock_count"],
                "rank_by_value": r["rank_by_value"],
            }
            for r in results
        ]

    @staticmethod
    def get_recent_price_changes_with_lag(db: Session) -> list[dict]:
        """
        Price trends comparison using Window Function LAG().

        SQL CONCEPT: LAG() OVER (PARTITION BY product_id ORDER BY changed_at)
        ---------------------------------------------------------------------
        WITH history_lag AS (
            SELECT
                ph.id,
                ph.product_id,
                p.name AS product_name,
                ph.new_selling_price,
                LAG(ph.new_selling_price) OVER (PARTITION BY ph.product_id ORDER BY ph.changed_at) AS previous_price,
                ph.changed_at,
                ph.change_reason
            FROM price_history ph
            JOIN products p ON ph.product_id = p.id
        )
        SELECT * FROM history_lag ORDER BY changed_at DESC LIMIT 10;
        """
        query = text("""
            WITH history_lag AS (
                SELECT
                    ph.id,
                    ph.product_id,
                    p.name AS product_name,
                    ph.new_selling_price,
                    COALESCE(
                        ph.old_selling_price,
                        LAG(ph.new_selling_price) OVER (PARTITION BY ph.product_id ORDER BY ph.changed_at)
                    ) AS previous_price,
                    ph.changed_at,
                    ph.change_reason
                FROM price_history ph
                JOIN products p ON ph.product_id = p.id
            )
            SELECT
                id,
                product_id,
                product_name,
                new_selling_price,
                previous_price,
                changed_at,
                change_reason
            FROM history_lag
            ORDER BY changed_at DESC
            LIMIT 10;
        """)

        results = db.execute(query).mappings().all()

        return [
            {
                "id": r["id"],
                "product_id": r["product_id"],
                "product_name": r["product_name"],
                "new_selling_price": float(r["new_selling_price"]),
                "previous_price": float(r["previous_price"]) if r["previous_price"] is not None else float(r["new_selling_price"]),
                "changed_at": r["changed_at"],
                "change_reason": r["change_reason"],
            }
            for r in results
        ]


analytics_repo = AnalyticsRepository()

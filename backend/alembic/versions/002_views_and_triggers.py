"""
SQL Features: Views, Materialized Views, and Triggers.

Revision ID: 002_views_and_triggers
Revises: 
Create Date: 2026-08-01

SQL CONCEPTS INCLUDED:
1. VIEW: v_product_details (combines products, inventory, categories)
2. MATERIALIZED VIEW: mv_category_stats (cached aggregations)
3. TRIGGER: log_price_change (auto-logs price changes to price_history)
"""

from alembic import op
import sqlalchemy as sa

revision = '002_views_and_triggers'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. VIEW: v_product_details
    op.execute("""
        CREATE OR REPLACE VIEW v_product_details AS
        SELECT
            p.id AS product_id,
            p.sku,
            p.name AS product_name,
            c.id AS category_id,
            c.name AS category_name,
            p.mrp,
            p.discount_percent,
            p.selling_price,
            COALESCE(i.available_quantity, 0) AS available_quantity,
            COALESCE(i.reorder_level, 10) AS reorder_level,
            COALESCE(i.is_out_of_stock, true) AS is_out_of_stock,
            CASE
                WHEN COALESCE(i.available_quantity, 0) = 0 THEN 'Critical'
                WHEN i.available_quantity < i.reorder_level THEN 'Low'
                WHEN i.available_quantity > i.reorder_level * 5 THEN 'Overstocked'
                ELSE 'Normal'
            END AS stock_status
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE p.is_active = true;
    """)

    # 2. MATERIALIZED VIEW: mv_category_stats
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_stats AS
        SELECT
            c.id AS category_id,
            c.name AS category_name,
            COUNT(p.id) AS product_count,
            COALESCE(SUM(i.available_quantity * p.selling_price), 0) AS total_inventory_value,
            COALESCE(AVG(p.mrp), 0) AS avg_mrp,
            COALESCE(AVG(p.discount_percent), 0) AS avg_discount,
            COUNT(CASE WHEN i.is_out_of_stock = true OR i.available_quantity = 0 THEN 1 END) AS out_of_stock_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE c.is_active = true
        GROUP BY c.id, c.name;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_category_stats_id ON mv_category_stats(category_id);
    """)

    # 3. TRIGGER FUNCTION & TRIGGER: Auto price history logger
    op.execute("""
        CREATE OR REPLACE FUNCTION fn_log_price_change()
        RETURNS TRIGGER AS $$
        BEGIN
            IF (OLD.selling_price IS DISTINCT FROM NEW.selling_price OR OLD.discount_percent IS DISTINCT FROM NEW.discount_percent) THEN
                INSERT INTO price_history (
                    product_id,
                    old_mrp,
                    old_discount_percent,
                    old_selling_price,
                    new_mrp,
                    new_discount_percent,
                    new_selling_price,
                    change_reason,
                    changed_at
                ) VALUES (
                    NEW.id,
                    OLD.mrp,
                    OLD.discount_percent,
                    OLD.selling_price,
                    NEW.mrp,
                    NEW.discount_percent,
                    NEW.selling_price,
                    'Automated Trigger: Price/Discount Updated',
                    NOW()
                );
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_price_change ON products;

        CREATE TRIGGER trg_price_change
        AFTER UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION fn_log_price_change();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_price_change ON products;")
    op.execute("DROP FUNCTION IF EXISTS fn_log_price_change();")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_category_stats;")
    op.execute("DROP VIEW IF EXISTS v_product_details;")

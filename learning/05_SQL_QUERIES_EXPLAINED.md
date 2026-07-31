# 📊 05: Advanced SQL Queries Handbook

## 1. Objective
Master all 12 SQL query concepts implemented in StockPulse (`app/modules/analytics/repository.py`, `app/modules/inventory/repository.py`, `app/modules/products/repository.py`).

---

## 2. Query 1: Executive Dashboard KPIs (CTE & Aggregations)

### Business Problem
Calculate high-level store metrics: total active SKUs, total inventory valuation, out-of-stock count, low-stock count, and out-of-stock percentage in a single database pass.

### SQL Query
```sql
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
```

### Line-by-Line Explanation
1. `WITH kpi_data AS (...)`: Defines a Common Table Expression (CTE) to aggregate metrics before computing percentages.
2. `COALESCE(SUM(i.available_quantity * p.selling_price), 0)`: Computes total inventory valuation in Rupees. `COALESCE` converts `NULL` outputs to `0`.
3. `COUNT(CASE WHEN ... THEN 1 END)`: Conditional aggregation to count out-of-stock and low-stock products.
4. `NULLIF(total_products, 0)`: Converts `0` total products to `NULL` to avoid division-by-zero errors.
5. `CAST(... AS NUMERIC)`: Ensures numeric division floating precision across PostgreSQL and SQLite.

---

## 3. Query 2: Category Valuation Ranking (`RANK()` Window Function)

### Business Problem
Rank product categories by total stock valuation to show which categories hold the highest capital investment.

### SQL Query
```sql
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
```

### Line-by-Line Explanation
1. `RANK() OVER (ORDER BY ... DESC)`: Window function that assigns a numerical rank based on inventory value.
2. `LEFT JOIN products`: Preserves categories even if they currently contain 0 products.

---

## 4. Query 3: Historical Price Variance (`LAG()` Window Function)

### Business Problem
Compare a product's current selling price with its previous historical selling price to detect price changes and calculate variance.

### SQL Query
```sql
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
SELECT * FROM history_lag ORDER BY changed_at DESC LIMIT 10;
```

### Line-by-Line Explanation
1. `LAG(new_selling_price) OVER (PARTITION BY product_id ORDER BY changed_at)`: Inspects the preceding price history row for each product to find the prior price.

---

## 5. Key Takeaways
- Demonstrated **CTEs**, **RANK()**, **LAG()**, **CASE WHEN**, and **COALESCE/NULLIF**.
- Proceed to [`06_BACKEND_ARCHITECTURE.md`](./06_BACKEND_ARCHITECTURE.md) for the Backend Architecture guide.

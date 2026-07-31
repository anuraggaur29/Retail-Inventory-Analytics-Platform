# 🎯 StockPulse — 50 SDE / Backend Technical Interview Questions & Answers

This document provides **50 project-specific technical interview questions and answers** ordered from foundational to senior-level system design.

---

## 🗄️ Section 1: Database Design & PostgreSQL (Questions 1–10)

### 1. What database did you choose for StockPulse, and why?
**Answer**: I chose **PostgreSQL** (hosted on Supabase) because StockPulse is a relational retail analytics platform requiring strict ACID compliance, structured schemas, foreign key integrity, complex joins, and advanced analytical SQL features such as CTEs, Window Functions, Views, Materialized Views, and Triggers.

### 2. How did you normalize the database schema?
**Answer**: I normalized the flat CSV dataset into a **2NF / 3NF relational model**:
- **`categories`**: Extracted repetitive category strings into a separate table referenced by `category_id`.
- **`products`**: Contains core SKU catalog data (name, MRP, discount, weight).
- **`inventory`**: Decoupled operational stock counts from catalog data (1:1 relationship with `products`).
- **`price_history`**: Maintained an append-only time-series record of price changes.

### 3. Why did you separate `products` and `inventory` into different tables?
**Answer**: To adhere to the **Single Responsibility Principle (SRP)** and minimize write contention. Catalog data (`products`) changes infrequently (e.g. price updates), while stock quantities (`inventory`) change continuously during order fulfillment. Keeping them separate prevents catalog table read locks during high-frequency inventory writes.

### 4. Why store prices as `mrp_paise` (integer) AND `mrp` (`NUMERIC(10,2)`)?
**Answer**: Floating-point numbers (`FLOAT`) suffer from IEEE 754 rounding issues (e.g., `0.1 + 0.2 != 0.3`). In financial data, storing amounts in paise as integers guarantees exact math, while `NUMERIC(10,2)` provides exact 2-decimal display formatting without precision loss.

### 5. What unique constraints exist in your database?
**Answer**:
- `roles.name` (UNIQUE)
- `users.email` (UNIQUE)
- `categories.name` & `categories.slug` (UNIQUE)
- `products.sku` (UNIQUE)
- `inventory.product_id` (UNIQUE — enforces 1:1 relation with products)

### 6. How do you handle soft deletes vs hard deletes in StockPulse?
**Answer**: I implemented soft deletes using `is_active BOOLEAN DEFAULT true` on `products` and `users`. Hard deletes break historical audit trails and foreign key references in historical logs. Query filtering (`WHERE is_active = true`) excludes soft-deleted items automatically.

### 7. What indexes did you create, and why?
**Answer**:
- B-Tree index on `users.email` for fast O(1) login lookups.
- B-Tree index on `products.sku` for quick barcode/SKU searches.
- B-Tree index on `products.category_id` for fast category filtering joins.
- B-Tree index on `inventory.product_id` for join performance.

### 8. What is the difference between a primary key and a surrogate key in your schema?
**Answer**: Auto-incrementing integer `id` columns serve as surrogate primary keys for synthetic uniqueness and efficient indexing, while natural business identifiers like `products.sku` are guarded with unique constraints.

### 9. What check constraints did you add to PostgreSQL?
**Answer**:
- `ck_products_mrp_positive`: `mrp_paise >= 0`
- `ck_products_discount_range`: `discount_percent BETWEEN 0 AND 100`
- `ck_products_selling_price_positive`: `selling_price >= 0`
- `ck_inventory_quantity_non_negative`: `available_quantity >= 0`

### 10. How would you handle 10 million SKUs in PostgreSQL?
**Answer**:
1. Partition the `products` and `inventory` tables by `category_id` using PostgreSQL declarative table partitioning.
2. Add partial indexes for active products (`WHERE is_active = true`).
3. Leverage read replicas for analytics queries while directing inventory writes to the primary DB node.

---

## 📊 Section 2: Advanced SQL & Query Optimization (Questions 11–20)

### 11. How did you use CTEs (Common Table Expressions) in StockPulse?
**Answer**: I used a CTE (`WITH kpi_data AS (...)`) in the dashboard summary query to calculate raw product counts, total inventory valuation, out-of-stock count, and low-stock count in a single pass before computing the overall out-of-stock percentage.

### 12. How did you compute category valuation ranks using Window Functions?
**Answer**: Using `RANK() OVER (ORDER BY COALESCE(SUM(i.available_quantity * p.selling_price), 0) DESC)`. This ranks categories directly in PostgreSQL without requiring sorting in Python.

### 13. What is the difference between `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()`?
**Answer**:
- `ROW_NUMBER()`: Assigns unique sequential integers (1, 2, 3, 4).
- `RANK()`: Assigns duplicate ranks for ties and skips subsequent numbers (1, 2, 2, 4).
- `DENSE_RANK()`: Assigns duplicate ranks for ties without skipping numbers (1, 2, 2, 3).

### 14. How did you track historical price variances using `LAG()`?
**Answer**: Using `LAG(new_selling_price) OVER (PARTITION BY product_id ORDER BY changed_at)`. It inspects the prior row's price for a product to compute exact price variances between updates.

### 15. How did you classify stock status in SQL?
**Answer**: Using conditional `CASE WHEN`:
```sql
CASE
  WHEN available_quantity = 0 THEN 'Critical'
  WHEN available_quantity < reorder_level THEN 'Low'
  WHEN available_quantity > reorder_level * 5 THEN 'Overstocked'
  ELSE 'Normal'
END AS stock_status
```

### 16. What is the difference between `INNER JOIN` and `LEFT JOIN` in your queries?
**Answer**:
- `INNER JOIN`: Used when matching records are required in both tables (e.g. `products JOIN categories`).
- `LEFT JOIN`: Used when products might not yet have an inventory record, preserving product rows with `NULL` stock columns instead of dropping them.

### 17. Why use `COALESCE()` and `NULLIF()` in SQL analytics?
**Answer**:
- `COALESCE(SUM(...), 0)` replaces `NULL` aggregate outputs with `0`.
- `NULLIF(total_products, 0)` converts `0` to `NULL` to prevent division-by-zero errors in ratio calculations.

### 18. What is a PostgreSQL View, and where did you use it?
**Answer**: `v_product_details` is a standard virtual table view joining `products`, `categories`, and `inventory`. It encapsulates complex multi-table joins into a simple `SELECT * FROM v_product_details`.

### 19. What is a Materialized View, and how does it differ from a standard View?
**Answer**: A standard View computes its query dynamically on every invocation. A Materialized View (`mv_category_stats`) persists query results on disk and must be refreshed (`REFRESH MATERIALIZED VIEW`), yielding sub-millisecond query latency for heavy dashboard aggregations.

### 20. Explain the PostgreSQL Trigger you created.
**Answer**: `trg_price_change` executes `fn_log_price_change()` after every `UPDATE` on `products`. If `selling_price` or `discount_percent` changes, it automatically inserts an audit record into `price_history`.

---

## ⚡ Section 3: FastAPI & Clean Architecture (Questions 21–30)

### 21. Explain the 3-Layer Clean Architecture used in StockPulse.
**Answer**:
- **Router (`router.py`)**: Handles HTTP parameters, CORS, status codes, and request payload parsing.
- **Service (`service.py`)**: Executes business rules, coordinate repositories, and handles permissions.
- **Repository (`repository.py`)**: Encapsulates raw SQL queries and SQLAlchemy persistence logic.

### 22. Why separate Pydantic Schemas from SQLAlchemy ORM Models?
**Answer**: ORM models represent database tables and internal state (including password hashes). Pydantic schemas define API DTOs (Data Transfer Objects), ensuring sensitive database fields are never accidentally exposed over HTTP.

### 23. How do FastAPI dependencies (`Depends()`) work?
**Answer**: FastAPI dependencies execute before route handlers to inject database sessions (`get_db`), extract current authenticated users (`get_current_user`), or validate pagination params (`PaginationParams`).

### 24. How does `get_db()` manage connection lifecycle?
**Answer**: `get_db()` uses a Python generator:
```python
db = SessionLocal()
try:
    yield db
finally:
    db.close()
```
FastAPI yields the session to the route and guarantees execution of `finally: db.close()` even if errors occur.

### 25. How do you handle synchronous vs asynchronous DB calls in FastAPI?
**Answer**: Synchronous SQLAlchemy calls run in FastAPI's external threadpool automatically, preventing main event loop blocking while keeping code simple and stable.

### 26. What is Pydantic `BaseSettings`?
**Answer**: Pydantic `BaseSettings` loads configuration from environment variables with type validation at startup following the 12-Factor App methodology.

### 27. How does pagination work in your REST API?
**Answer**: Route queries take `page` and `page_size` parameters, computing SQL `OFFSET = (page - 1) * page_size` and `LIMIT page_size` alongside total item counts for metadata responses.

### 28. How is error handling structured in your APIs?
**Answer**: Using `HTTPException` with explicit status codes (`401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `400 Bad Request`) and structured error details.

### 29. Why use OpenAPI / Swagger UI in FastAPI?
**Answer**: FastAPI automatically generates interactive OpenAPI documentation at `/docs`, simplifying frontend integration and client testing.

### 30. How do you handle database transaction boundaries?
**Answer**: Operations like restocking wrap inventory updates and timestamp changes in a single session `db.commit()`. If an exception occurs, `db.rollback()` executes.

---

## 🔐 Section 4: Authentication & RBAC (Questions 31–40)

### 31. Explain your authentication architecture.
**Answer**: Uses stateless **JWT (JSON Web Tokens)** containing user ID (`sub`) and expiration (`exp`), signed with HS256. Clients pass the token via `Authorization: Bearer <token>`.

### 32. Why choose JWT over session-based authentication?
**Answer**: JWTs are stateless — backends do not need server-side session stores or Redis lookups per request, enabling horizontal scaling.

### 33. How does password hashing work in StockPulse?
**Answer**: Passwords are salted and hashed using **bcrypt** via `passlib`. Bcrypt is intentionally CPU-intensive (~100ms per hash), protecting against rainbow table and brute-force attacks.

### 34. How did you implement Role-Based Access Control (RBAC)?
**Answer**: Created a reusable class dependency `RequireRole(["admin", "manager"])` that inspects `current_user.role.name` and raises HTTP 403 Forbidden if unauthorized.

### 35. What are the 4 user roles in StockPulse?
**Answer**:
- `admin`: Full system access.
- `manager`: Stock restocking and inventory writes.
- `analyst`: Stock alert feeds and business reports.
- `viewer`: Read-only catalog access.

### 36. What happens when a JWT token expires?
**Answer**: PyJWT raises `ExpiredSignatureError`, caught by `get_current_user` dependency to return HTTP 401 Unauthorized, prompting the frontend to redirect to `/login`.

### 37. Where is the JWT stored in the React frontend?
**Answer**: Stored in `localStorage` and managed by Zustand `authStore`. Axios request interceptors attach `Authorization: Bearer <token>` to outbound API requests.

### 38. How do you prevent timing attacks during login?
**Answer**: `authenticate_user()` returns a generic `"Invalid email or password"` message regardless of whether the email or password failed.

### 39. What is an Axios Interceptor?
**Answer**: Functions executed on every request or response. Request interceptors attach bearer tokens; response interceptors catch 401 errors to trigger logout redirects.

### 40. How do you handle CORS in FastAPI?
**Answer**: Configured `CORSMiddleware` with allowed origins loaded from environment variables (`CORS_ORIGINS`).

---

## 💻 Section 5: React, MUI & Frontend (Questions 41–45)

### 41. Why did you use Material UI (MUI v6) for StockPulse?
**Answer**: MUI provides accessible, responsive, enterprise-grade components (`AppBar`, `Drawer`, `Card`, `Table`, `Dialog`, `Chip`) that accelerate building production dashboards while maintaining a cohesive dark theme.

### 42. How did you implement global state with Zustand?
**Answer**: Created `useAuthStore` managing `user`, `token`, `isAuthenticated`, `login()`, `logout()`, and `fetchProfile()`, providing lightweight state without Redux boilerplate.

### 43. How does `ProtectedRoute` guard routes in React Router?
**Answer**: `ProtectedRoute` checks `isAuthenticated`. If false, it redirects to `/login` with `state={{ from: location }}` to preserve return paths after authentication.

### 44. How did you build responsive charts with Recharts?
**Answer**: Used `<ResponsiveContainer>` wrapping `<BarChart>` to render dynamic SVG category valuation ranks that adapt to viewport resizes.

### 45. How did you handle loading and empty states in MUI?
**Answer**: Rendered MUI `<Skeleton>` components during API fetches and clean empty-state table rows when filters return no matches.

---

## 🏗️ Section 6: Deployment & System Design (Questions 46–50)

### 46. Explain your production deployment stack.
**Answer**:
- **Database**: Supabase PostgreSQL (Managed cloud DB).
- **Backend**: Hugging Face Spaces using Docker SDK (`Dockerfile` exposing port 7860).
- **Frontend**: Vercel SPA hosting with `vercel.json` rewrite rules.

### 47. How does the Dockerfile build your backend service?
**Answer**: Uses `python:3.10-slim`, installs system build tools (`libpq-dev`, `gcc`), installs dependencies from `requirements.txt`, and launches `uvicorn app.main:app --host 0.0.0.0 --port 7860`.

### 48. What is the single biggest architectural trade-off you made?
**Answer**: Using synchronous SQLAlchemy over asyncpg for the MVP. Synchronous ORM calls simplified migration setup and speed, while FastAPI handles sync calls in threadpools. For 100K+ concurrent connections, migrating to asyncpg is the planned upgrade.

### 49. What index strategy would you add for full-text search?
**Answer**: A PostgreSQL GIN (Generalized Inverted Index) on `to_tsvector('english', name)` for fast multi-word product searches.

### 50. How would you handle high write concurrency on stock updates?
**Answer**: Use an append-only `inventory_transactions` ledger table and compute stock asynchronously or via atomic PostgreSQL updates (`UPDATE inventory SET quantity = quantity + :delta WHERE product_id = :id`).

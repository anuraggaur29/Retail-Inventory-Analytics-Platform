# 📖 StockPulse — The Master Project Bible

> The ultimate, single-source-of-truth handbook for **StockPulse**. Read this document if you have 2 hours before a Software Engineering interview to master every architectural, database, API, and frontend decision.

---

## 🏛️ Section 1: Project Story & Business Problem

### Why Did I Build StockPulse?
In quick-commerce (10-minute delivery services like Zepto, Blinkit, and Swiggy Instamart), operations depend on dark stores (micro-warehouses). Managing inventory across thousands of SKUs requires real-time stock tracking, category valuation analysis, and automated price change auditing.

I built **StockPulse** to demonstrate how to engineer a production-ready, high-concurrency retail analytics platform using **FastAPI**, **PostgreSQL**, **React 18**, **Material UI v6**, and **JWT Role-Based Access Control**.

### What Real-World Problem Does It Solve?
1. **Stockout Prevention**: Triggers instant low-stock alerts when inventory drops below reorder thresholds.
2. **Capital Valuation Allocation**: Ranks categories by total inventory valuation to guide procurement teams.
3. **Auditability**: Automatically logs every price or discount change using a database trigger for audit trails.

### Who Are the Users?
- **Store Managers**: Execute inventory restocking transactions.
- **Data Analysts**: Monitor category performance ranks and price change audit logs.
- **Operations Viewers**: Read-only access to catalog availability.
- **System Admins**: Full platform administration.

---

## ⚡ Section 2: End-to-End Request Lifecycle

```
[ User Clicks 'Restock (+50)' in React ]
                   │
                   ▼ (HTTP POST /api/v1/inventory/113/restock)
[ Axios Client Interceptor (src/services/api.ts) ]
   └── Attaches Header: 'Authorization: Bearer <jwt_token>'
                   │
                   ▼
[ FastAPI App Engine (app/main.py) ]
                   │
                   ▼
[ Router Layer (app/modules/inventory/router.py) ]
   ├── Validates JSON Body via Pydantic RestockRequest schema
   ├── Executes get_current_user -> Decodes JWT signature using JWT_SECRET_KEY
   └── Executes RequireRole(["admin", "manager"]) dependency -> Verifies role
                   │
                   ▼
[ Service Layer (app/modules/inventory/service.py) ]
   └── Validates Business Rule: quantity > 0
                   │
                   ▼
[ Repository Layer (app/modules/inventory/repository.py) ]
   ├── SELECT * FROM inventory WHERE product_id = 113
   ├── Atomic Update: available_quantity = available_quantity + 50
   ├── Sets is_out_of_stock = false & last_restocked_at = NOW()
   └── db.commit() -> Flushes transaction to PostgreSQL
                   │
                   ▼
[ HTTP Response 200 OK + JSON Payload ]
                   │
                   ▼
[ React Frontend Updates UI & Shows MUI Snackbar Alert ]
```

---

## 📁 Section 3: Every Folder in One Page

- **`backend/alembic/`**: Database migration version control tracking schema revisions (`002_views_and_triggers.py`).
- **`backend/app/core/`**: Shared infrastructure logic (`config.py` for env loading, `database.py` for connection pooling, `security.py` for Bcrypt/JWT, `dependencies.py` for pagination).
- **`backend/app/models/`**: Declarative SQLAlchemy ORM models representing the 6 database tables.
- **`backend/app/modules/`**: Modular feature folders (`auth`, `products`, `inventory`, `analytics`) implementing Clean Architecture (Router → Service → Repository).
- **`backend/app/scripts/`**: Dataset generator (`generate_dataset.py`) and seeder script (`seed.py`) for ETL processing.
- **`frontend/src/theme/`**: Custom dark Material UI v6 theme (`theme.ts`).
- **`frontend/src/store/`**: Zustand global state management (`authStore.ts`).
- **`frontend/src/services/`**: Axios API client instance with JWT interceptors (`api.ts`).
- **`frontend/src/pages/`**: Primary dashboard pages (`LoginPage`, `DashboardPage`, `ProductsPage`, `InventoryPage`).
- **`docs/`**: Technical engineering documentation, schema diagrams, and 50 interview Q&As.
- **`learning/`**: 15 step-by-step master handbook modules.

---

## 🗄️ Section 4: Every Table in One Page

### 1. `roles`
- **Purpose**: Master table of user RBAC roles (`admin`, `manager`, `analyst`, `viewer`).
- **Used by**: `POST /auth/login`, `GET /auth/me`, `RequireRole` dependency.

### 2. `users`
- **Purpose**: System accounts with salted Bcrypt password hashes and active status flags.
- **Used by**: Authentication and session validation APIs.

### 3. `categories`
- **Purpose**: Normalized product category classification (11 categories).
- **Used by**: `GET /categories`, Category dropdown filters, and `RANK()` analytics queries.

### 4. `products`
- **Purpose**: Core catalog SKU entity (3,700 SKUs). Stores integer paise and decimal rupees.
- **Used by**: `GET /products`, `GET /products/{id}`, Catalog search, and price trigger.

### 5. `inventory`
- **Purpose**: Operational stock levels (1:1 with products). Tracks quantity, reorder level, and stock status.
- **Used by**: `GET /inventory`, `GET /inventory/alerts`, `POST /inventory/{id}/restock`.

### 6. `price_history`
- **Purpose**: Immutable append-only audit trail populated automatically via PostgreSQL trigger.
- **Used by**: `GET /analytics/dashboard` (`LAG()` window query) and product detail price history timelines.

---

## 📊 Section 5: SQL Cheat Sheet (Plain English)

- **JOIN**: Merges rows from multiple tables based on a key (`products INNER JOIN categories`).
- **CTE (Common Table Expression)**: A temporary query result set defined via `WITH kpi_data AS (...)` to structure multi-step aggregations cleanly.
- **CASE WHEN**: Conditional logic inside SQL queries (`CASE WHEN qty = 0 THEN 'Critical' ELSE 'Normal' END`).
- **RANK()**: A window function that computes numerical ranks for rows based on ordered metrics (`RANK() OVER (ORDER BY SUM(qty * price) DESC)`).
- **LAG()**: A window function that reads data from a preceding row within a partition (`LAG(new_selling_price) OVER (PARTITION BY product_id ORDER BY changed_at)`).
- **VIEW**: A virtual table defined by a SQL query (`v_product_details`).
- **MATERIALIZED VIEW**: A physical disk-backed view (`mv_category_stats`) that pre-computes aggregate results for instant query execution.
- **TRIGGER**: A database function (`trg_price_change`) that runs automatically when an `UPDATE` occurs on `products`.

---

## 📡 Section 6: API Cheat Sheet (10 Endpoints)

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/api/v1/auth/login` | `POST` | Authenticate user & return JWT token | Public |
| `/api/v1/auth/me` | `GET` | Get profile of logged-in user | All Roles |
| `/api/v1/products` | `GET` | Paginated product list with search/filters | All Roles |
| `/api/v1/products/{id}` | `GET` | Product detail with price history | All Roles |
| `/api/v1/categories` | `GET` | Category list with product counts | All Roles |
| `/api/v1/inventory` | `GET` | Stock levels with `CASE WHEN` status | All Roles |
| `/api/v1/inventory/alerts` | `GET` | Out-of-stock & low-stock alerts feed | Analyst+ |
| `/api/v1/inventory/{id}/restock` | `POST` | Atomic inventory restocking transaction | Manager+ |
| `/api/v1/analytics/dashboard` | `GET` | Dashboard KPIs & category valuation ranks | All Roles |
| `/api/v1/analytics/category-performance` | `GET` | Category rank performance metrics | All Roles |

---

## 🔐 Section 7: Authentication & RBAC Flow

```
[ User Enters Credentials ] ──> [ POST /auth/login ] ──> [ Bcrypt Verification ]
                                                                 │
[ Client Attaches JWT Header ] <── [ Returns Signed JWT ] <──────┘
             │
             ▼
[ GET /inventory/alerts ] ──> [ Decodes JWT (sub=id) ] ──> [ RequireRole(["analyst"]) ]
                                                                  │
[ Returns 200 OK Payload ] <────── [ Role Validated ] <───────────┘
```

---

## 📐 Section 8: Key Architecture Decisions

| Decision | Why Chosen? | Alternative Considered | Trade-off |
|---|---|---|---|
| **Clean Architecture** | Separates database logic from routes | Single-file script / Monolithic routes | Requires creating separate Router, Service, and Repository files |
| **Integer Paise Pricing** | Avoids IEEE 754 float rounding inaccuracies | Raw `FLOAT` type | Requires converting paise to rupees during display |
| **Bcrypt Password Hashing** | Slow hash algorithm (~100ms) prevents brute-forcing | Fast hashes (SHA256, MD5) | Consumes ~100ms CPU time during authentication |
| **JWT Stateless Auth** | Scales horizontally across instances without server session lookup | Server-side Redis Sessions | Cannot instantly invalidate single tokens before expiration |

---

## 🎯 Section 9: Top 15 Master Interview Questions

### 1. (Easy) What is the main purpose of StockPulse?
> **Answer**: It is an internal dark-store inventory analytics platform for quick-commerce operations, tracking stock health across 3,700 SKUs and auditing pricing changes.

### 2. (Easy) Why did you use Material UI for the frontend?
> **Answer**: MUI v6 provides accessible, responsive dashboard components (Cards, Tables, Drawers, Skeletons) while enforcing a cohesive dark theme.

### 3. (Medium) Why separate `products` and `inventory` tables?
> **Answer**: SRP (Single Responsibility Principle) and Write Contention. Catalog data changes rarely, whereas inventory stock levels change constantly during order processing.

### 4. (Medium) How does `get_db()` handle connection pooling?
> **Answer**: `get_db()` is a Python generator with `try...finally`. It yields the session to the route and executes `finally: db.close()`, returning the connection back to the pool even if an error occurs.

### 5. (Hard) How did you compute price variance history in SQL?
> **Answer**: Used PostgreSQL Window Function `LAG(new_selling_price) OVER (PARTITION BY product_id ORDER BY changed_at)`. It inspects the preceding historical price row per product inside the database query.

---

## ⚠️ Section 10: Interview Red Flags — What NEVER to Say!

1. ❌ **"I used float for prices because it's simpler."** → **Say instead**: *"I stored prices as integer paise to prevent IEEE 754 floating-point rounding inaccuracies in financial calculations."*
2. ❌ **"I put SQL queries in my FastAPI route files."** → **Say instead**: *"I used the Repository pattern to isolate raw SQL queries from FastAPI route handlers."*
3. ❌ **"JWT tokens are stored in database sessions."** → **Say instead**: *"JWT tokens are stateless and verified cryptographically using the secret key."*
4. ❌ **"I memorized the code."** → **Say instead**: *"I designed the architecture to follow Clean Architecture principles and normalized database rules."*

---

## 📌 Section 11: Resume Mapping to Code

| Resume Bullet Point | Supporting Code Files | Supporting SQL / API |
|---|---|---|
| **Engineered full-stack analytics platform processing 3,700 SKUs** | `backend/app/main.py`, `frontend/src/App.tsx` | `zepto_v2.csv`, `app/scripts/seed.py` |
| **Implemented advanced SQL analytics (CTEs, RANK, LAG)** | `backend/app/modules/analytics/repository.py` | `WITH kpi_data AS`, `RANK() OVER`, `LAG() OVER` |
| **Designed 6-table normalized relational schema (2NF/3NF)** | `backend/app/models/*.py` | `products`, `inventory`, `categories` FKs |
| **Built stateless JWT auth and RBAC across 4 roles** | `backend/app/core/security.py` | `RequireRole` class dependency, `POST /login` |

---

## ⏱️ Section 12: Final 30-Minute Revision Checklist

- [ ] **Numbers**: 3,700 SKUs, 11 categories, 6 tables, 4 roles, 10 APIs, 3 architecture layers.
- [ ] **SQL**: `WITH kpi_data` (CTE), `RANK() OVER (ORDER BY valuation DESC)`, `LAG(price) OVER (PARTITION BY product_id)`.
- [ ] **DB**: Integer paise pricing, soft deletes via `is_active`, 1:1 `inventory` relationship.
- [ ] **FastAPI**: Connection pooling `get_db()` with `finally: db.close()`, Pydantic Settings startup validation.
- [ ] **Auth**: Bcrypt hashing, JWT HS256 payload, `RequireRole(["admin", "manager"])` dependency.
- [ ] **Frontend**: Material UI v6 theme (`theme.ts`), Zustand `authStore`, Axios bearer token interceptor.
- [ ] **Deploy**: Supabase PostgreSQL + Hugging Face Spaces (Docker) + Vercel SPA.

**You are 100% prepared to dominate your technical interviews! 🚀**

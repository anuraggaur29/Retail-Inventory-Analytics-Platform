# 📡 REST API Documentation

## Authentication Endpoints
- `POST /api/v1/auth/login`: Authenticates credentials & returns JWT access token.
- `GET /api/v1/auth/me`: Returns currently logged-in user profile & role.

## Products Endpoints
- `GET /api/v1/products`: List products with pagination, search, category filter, stock filter, price range.
- `GET /api/v1/products/{id}`: Single product detail with inventory & price history.
- `GET /api/v1/categories`: Category list with product counts.

## Inventory Endpoints
- `GET /api/v1/inventory`: List stock levels with `CASE WHEN` status classification.
- `GET /api/v1/inventory/alerts`: Low-stock & out-of-stock feed (Analyst+).
- `POST /api/v1/inventory/{id}/restock`: Atomic inventory restock transaction (Manager+).

## Analytics Endpoints
- `GET /api/v1/analytics/dashboard`: Summary KPIs using CTEs & aggregates.
- `GET /api/v1/analytics/category-performance`: Category valuation ranking via `RANK()`.

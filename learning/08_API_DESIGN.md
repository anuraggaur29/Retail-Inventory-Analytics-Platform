# 📡 08: REST API Design Reference

## 1. Objective
Master all 10 production REST API endpoints in StockPulse, their HTTP methods, request parameters, and response schemas.

---

## 2. API Endpoints Reference Table

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT access token |
| `GET` | `/api/v1/auth/me` | All Authenticated | Get currently logged-in user profile |
| `GET` | `/api/v1/products` | All Authenticated | List products with pagination, search & filters |
| `GET` | `/api/v1/products/{id}` | All Authenticated | Single product details with price history |
| `GET` | `/api/v1/categories` | All Authenticated | List categories with product counts |
| `GET` | `/api/v1/inventory` | All Authenticated | List stock levels with `CASE WHEN` status |
| `GET` | `/api/v1/inventory/alerts` | Analyst+ | Get low-stock & out-of-stock alert feed |
| `POST` | `/api/v1/inventory/{id}/restock` | Manager+ | Atomic inventory restocking transaction |
| `GET` | `/api/v1/analytics/dashboard` | All Authenticated | Summary KPIs & category valuation ranks |
| `GET` | `/api/v1/analytics/category-performance` | All Authenticated | Detailed category performance breakdown |

---

## 3. Key Takeaways
- All business APIs require `Authorization: Bearer <jwt_token>`.
- Restocking is restricted to `manager` and `admin` roles.
- Proceed to [`09_FRONTEND_ARCHITECTURE.md`](./09_FRONTEND_ARCHITECTURE.md).

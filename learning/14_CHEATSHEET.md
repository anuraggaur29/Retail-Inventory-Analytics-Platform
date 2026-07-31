# ⚡ 14: 20-Minute Pre-Interview Revision Cheat Sheet

## 1. Objective
A rapid **20-minute revision document** to review immediately before entering an interview room.

---

## 2. Core Numbers to Memorize
- **3,700 SKUs** across **11 categories**.
- **6 Relational Tables**: `roles`, `users`, `categories`, `products`, `inventory`, `price_history`.
- **4 User Roles**: `admin`, `manager`, `analyst`, `viewer`.
- **10 REST API Endpoints** under `/api/v1`.
- **3 System Layers**: Router → Service → Repository.

---

## 3. Core Architectural Talking Points

| Topic | One-Line Summary |
|---|---|
| **Architecture** | 3-layer Clean Architecture (Router -> Service -> Repository) separating HTTP, business rules, and SQL queries. |
| **Database Normalization** | 2NF/3NF compliant. Separated `products` (catalog) from `inventory` (operational stock) to prevent write locks. |
| **Financial Precision** | Prices stored as integer paise alongside `NUMERIC(10,2)` to prevent IEEE 754 float rounding inaccuracies. |
| **SQL Analytics** | CTEs for dashboard KPIs, `RANK()` for category valuations, `LAG()` for price variance audit trails. |
| **Database Triggers** | `trg_price_change` automatically inserts audit logs into `price_history` on product price updates. |
| **Authentication** | Stateless JWT (HS256) + Bcrypt password hashing + `RequireRole` class dependency for RBAC. |
| **Frontend** | React 18 + Material UI v6 dark theme + Zustand store + Axios bearer token interceptor. |
| **Deployment** | Supabase PostgreSQL + Hugging Face Spaces (Docker SDK) + Vercel SPA hosting. |

---

## 4. Final Checklist Before Entering Interview
- [x] Memory check: 3,700 SKUs, 6 tables, 4 roles, 10 APIs.
- [x] Can explain why integer paise pricing is used instead of floats.
- [x] Can explain why `products` and `inventory` are separate tables.
- [x] Can explain how `RequireRole` dependency executes.
- [x] Can explain `RANK()` vs `LAG()` window functions.

**You are 100% prepared to ace your Software Engineering interview! 🚀**

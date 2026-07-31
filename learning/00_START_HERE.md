# 🚀 00: Start Here — The StockPulse Master Handbook Roadmap

## 1. Objective
Welcome to the official **Engineering & Interview Handbook** for **StockPulse**!
This guide is designed for you to master the entire system in **one day** so you can defend every architecture, database, API, and frontend decision in SDE / Backend interviews.

---

## 2. Big Picture
StockPulse is an internal dark-store analytics engine modeled after quick-commerce platforms like Zepto, Blinkit, and Swiggy Instamart. It manages **3,700 real-world SKUs** across 11 normalized categories, enabling real-time stock monitoring, pricing audit logs, category valuation rankings, and restocking workflows.

---

## 3. Handbook Module Reading Order

Read the handbook in sequential numerical order:

| Document | Title | Purpose |
|---|---|---|
| [`00_START_HERE.md`](./00_START_HERE.md) | Master Handbook Roadmap | Navigation & reading strategy |
| [`01_PROJECT_OVERVIEW.md`](./01_PROJECT_OVERVIEW.md) | Business Domain & Data | Quick-commerce analytics context |
| [`02_SYSTEM_ARCHITECTURE.md`](./02_SYSTEM_ARCHITECTURE.md) | Clean Architecture Blueprint | 3-Layer Router-Service-Repo pattern |
| [`03_FOLDER_STRUCTURE.md`](./03_FOLDER_STRUCTURE.md) | Directory & File Sitemap | Purpose of every file in repo |
| [`04_DATABASE_DESIGN.md`](./04_DATABASE_DESIGN.md) | Relational Schema Handbook | 6 tables, PK/FK, constraints & indexes |
| [`05_SQL_QUERIES_EXPLAINED.md`](./05_SQL_QUERIES_EXPLAINED.md) | Advanced SQL Handbook | CTEs, RANK(), LAG(), CASE WHEN |
| [`06_BACKEND_ARCHITECTURE.md`](./06_BACKEND_ARCHITECTURE.md) | FastAPI Engine & Dependency Injection | Request lifecycle & connection pooling |
| [`07_AUTHENTICATION_AND_RBAC.md`](./07_AUTHENTICATION_AND_RBAC.md) | Security, JWT & RBAC | Bcrypt, PyJWT & RequireRole dependency |
| [`08_API_DESIGN.md`](./08_API_DESIGN.md) | REST API Reference | 10 endpoints, pagination & payload schemas |
| [`09_FRONTEND_ARCHITECTURE.md`](./09_FRONTEND_ARCHITECTURE.md) | React, Material UI & Zustand | MUI v6 theme, Zustand store, Recharts |
| [`10_DEPLOYMENT_GUIDE.md`](./10_DEPLOYMENT_GUIDE.md) | Production Deployment | Supabase, HF Spaces Docker & Vercel |
| [`11_CODE_WALKTHROUGH.md`](./11_CODE_WALKTHROUGH.md) | Step-by-Step Code Execution | Tracing a request from React to DB |
| [`12_INTERVIEW_GUIDE.md`](./12_INTERVIEW_GUIDE.md) | 50 SDE Interview Q&A | Q&A across DB, SQL, FastAPI & React |
| [`13_RESUME_GUIDE.md`](./13_RESUME_GUIDE.md) | ATS Resume Bullets & Pitches | 30s/2m/5m elevator pitches |
| [`14_CHEATSHEET.md`](./14_CHEATSHEET.md) | 20-Minute Pre-Interview Cheat Sheet | Final revision numbers & core points |

---

## 4. Key Numbers to Remember for Interviews
- **3,700** SKUs (High-cardinality catalog data)
- **11** Active Categories (Fruits & Veg, Dairy, Munchies, Cleaning, etc.)
- **6** Relational Database Tables (`roles`, `users`, `categories`, `products`, `inventory`, `price_history`)
- **4** User Roles (`admin`, `manager`, `analyst`, `viewer`)
- **10** Production REST Endpoints
- **3** System Layers (Router → Service → Repository)
- **0.00ms** Division-by-Zero Safety via ANSI SQL `NULLIF()` and `CAST()`

---

## 5. Next Step
Proceed directly to [`01_PROJECT_OVERVIEW.md`](./01_PROJECT_OVERVIEW.md) to understand the business domain and dataset normalization.

# 01 PROJECT OVERVIEW — StockPulse Analytics

## Objective
This document outlines the business context, technical specifications, core problem statement, and scope of **StockPulse — Retail Inventory Analytics Platform**.

---

## Big Picture
In quick-commerce (e.g., Zepto, Blinkit, Instamart), dark-stores process thousands of orders hourly. Inventory discrepancies directly cause:
- Stockouts (lost revenue & customer churn)
- Overstocking (tied-up working capital)
- Pricing inconsistencies (margin erosion)

StockPulse solves this by providing real-time inventory tracking, executive analytics, and dynamic restocking workflows powered by a live PostgreSQL database.

---

## Project Implementation

### Codebase Metrics:
- **Dataset**: 3,732 real Zepto retail products across 14 categories (`zepto_v2.csv`).
- **Database**: Supabase PostgreSQL (`products` & `categories` tables).
- **Frontend Stack**: React 18, Vite 5, TypeScript 5, Material UI (MUI 5), Recharts, Zustand.
- **Backend Spec**: FastAPI (Python 3.11), SQLAlchemy 2.0, Pydantic v2, Alembic.

### Core Features:
1. **Executive Dashboard (`DashboardPage.tsx`)**:
   - Live KPI cards: Total SKUs (3,732), Total Categories (14), Total Inventory Value (~₹84.5L), Out of Stock %, Low Stock Count, Avg Discount %.
   - Interactive Recharts bar chart showing inventory value distribution across categories.
   - Out of stock alert panel.
2. **Product Catalog (`ProductsPage.tsx`)**:
   - Server-side SQL search (`ILIKE`), category filtering (`WHERE category_id = ?`), and stock status filtering.
   - Server-side pagination (`LIMIT` & `OFFSET`).
3. **Inventory Management (`InventoryPage.tsx`)**:
   - Stock status indicators (`NORMAL`, `LOW STOCK`, `CRITICAL`, `OVERSTOCKED`).
   - Real-time stock alerts feed.
   - Interactive restock modal executing SQL `UPDATE` queries.
4. **System Administration & Security (`AdminPage.tsx`)**:
   - 4-Tier Role-Based Access Control (RBAC) permission matrix.
   - System accounts directory.

---

## Engineering Decisions

### Why Live Supabase PostgreSQL + React Static Hosting?
- **Decision**: Connect Vercel frontend directly to a free hosted Supabase PostgreSQL instance via `@supabase/supabase-js`.
- **Alternative 1 (Pure Static JSON/Mock)**: Fast to build, but fails interview validation because no real SQL runs.
- **Alternative 2 (Full Backend on Free Tier Hosting)**: Cold starts on Render/Railway cause 50-second delays.
- **Trade-off**: Supabase direct client queries run real SQL server-side with zero cold-start latency!

---

## Common Mistakes
- **Hardcoding mock arrays**: Storing static arrays in React state means data resets on refresh and ignores database operations. StockPulse fetches live data from Supabase and allows real `UPDATE` restock mutations.

---

## Interview Questions

### Q1: What problem does StockPulse solve?
**Answer**: StockPulse provides real-time visibility into quick-commerce dark-store inventory across 3,732 SKUs, preventing stockouts and overstocking using server-side SQL analytics.

### Q2: How does the application handle database connectivity on Vercel?
**Answer**: It uses `@supabase/supabase-js` to execute parameterized SQL queries directly against a cloud PostgreSQL instance, protected by Row Level Security (RLS) policies.

---

## Key Takeaways
- StockPulse processes 3,732 real retail SKUs.
- It operates on a live Supabase PostgreSQL database.
- It enforces 4-tier Role-Based Access Control (`admin`, `manager`, `analyst`, `viewer`).

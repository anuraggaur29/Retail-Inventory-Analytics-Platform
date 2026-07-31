# 14 PROJECT BIBLE — Master 30-Minute Interview Revision Guide

## Objective
This document is your **single master revision guide** for StockPulse. It connects every layer of the application into a cohesive narrative to review 30 minutes before any technical interview.

---

## 1. Executive Summary & Project Story
StockPulse was created to solve dark-store inventory visibility and stockout challenges in quick-commerce retail. Processing thousands of high-velocity orders requires instant inventory tracking across thousands of SKUs. 

StockPulse handles **3,732 real retail SKUs** across 14 categories using a live **Supabase PostgreSQL** database and a **React 18 + Material UI** frontend deployed on **Vercel Edge**.

---

## 2. Master Credentials & Accounts
- **Master Password**: `anuraggaur001` (Works across all demo accounts)
- **Admin**: `admin@stockpulse.io` (Full System & Write Access)
- **Manager**: `manager@stockpulse.io` (Inventory Restock & Write Access)
- **Analyst**: `analyst@stockpulse.io` (Read-Only Analytics & Alert Feeds)
- **Viewer**: `viewer@stockpulse.io` (Restricted Basic Catalog View)

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE MAP                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Frontend (Vercel Edge)           Supabase Cloud PostgreSQL                │
│ ┌─────────────────────────┐       ┌─────────────────────────────────────┐   │
│ │ React 18 + Vite 5       │       │ Database: PostgreSQL 15             │   │
│ │ Material UI (MUI 5)     │──────>│ Table: products (3,732 rows)        │   │
│ │ Zustand State Store     │  SQL  │ Table: categories (14 rows)         │   │
│ │ Recharts Visualizations │ Queries│ RLS Security Policies               │   │
│ └─────────────────────────┘       └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Metrics & Numbers for Interviews

- **Total SKUs**: `3,732` real retail items.
- **Categories**: `14` product categories (`Fruits & Vegetables`, `Munchies`, `Dairy, Bread & Batter`, etc.).
- **Total Inventory Value**: `~₹84,52,000` (computed dynamically via SQL `SUM(selling_price * available_quantity)`).
- **Out of Stock Count**: `43` products out of stock (~1.15%).
- **Query Performance**: `<50ms` average response time using server-side SQL pagination (`LIMIT` & `OFFSET`).

---

## 5. 30-Minute Interview Review Checklist

1. [ ] **Elevator Pitch**: Can you explain StockPulse in 60 seconds? (See `12_INTERVIEW_GUIDE.md`)
2. [ ] **Architecture**: Can you sketch the 3-tier diagram on a whiteboard? (See `02_SYSTEM_ARCHITECTURE.md`)
3. [ ] **Database**: Can you write the DDL schema for `products` and `categories` from memory? (See `04_DATABASE_DESIGN.md`)
4. [ ] **RBAC Security**: Can you explain how `ProtectedRoute.tsx` evaluates `user.role_name`? (See `05_AUTHENTICATION.md`)
5. [ ] **Code Trace**: Can you trace a user clicking "Restock" to the database `UPDATE` query? (See `11_CODE_WALKTHROUGH.md`)

---

## Key Takeaways
- Review this document 30 minutes before any interview.
- Master the numbers: **3,732 SKUs, 14 categories, ~₹84.5L value, 4 RBAC roles, password `anuraggaur001`**.

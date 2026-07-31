# 02 SYSTEM ARCHITECTURE — StockPulse 3-Tier Architecture

## Objective
This document details the multi-tier system architecture, component boundaries, data flow pipelines, and infrastructure layers of the StockPulse platform.

---

## Big Picture
StockPulse implements a modular **3-Tier Architecture**:
1. **Presentation Layer (Frontend)**: React 18 SPA built with Vite, styled with Material UI (MUI), state managed by Zustand.
2. **Application / API Layer**: FastAPI (Python 3.11) clean architecture backend & Supabase Client query builder.
3. **Data Layer (Database)**: PostgreSQL relational database hosted on Supabase Cloud with Row-Level Security (RLS).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                SYSTEM TIERS                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PRESENTATION LAYER        APPLICATION LAYER             DATA LAYER          │
│ ┌───────────────────┐    ┌────────────────────┐    ┌─────────────────────┐   │
│ │   React 18 SPA    │    │ Supabase Client /  │    │ Supabase PostgreSQL │   │
│ │ (MUI 5 + Zustand) │───>│  FastAPI REST API  │───>│ (3,732 Products Table│   │
│ └───────────────────┘    └────────────────────┘    │  14 Categories)     │   │
│                                                    └─────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Implementation

### 1. Presentation Layer (`frontend/src/`)
- **Routing**: `App.tsx` configures client-side routes protected by `ProtectedRoute.tsx`.
- **Layout**: `Layout.tsx` provides a permanent Material UI sidebar with dynamic role-based navigation item filtering.
- **State Management**: `authStore.ts` (Zustand) manages authentication tokens, user profiles, and session persistence in `localStorage`.
- **Database Access**: `lib/supabase.ts` initializes the Supabase client singleton using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

### 2. Application & API Layer (`frontend/src/services/api.ts` & `backend/app/`)
- **Axios HTTP Service**: Configured with a `baseURL` pointing to `/api/v1` with request interceptors attaching `Authorization: Bearer <token>`.
- **FastAPI Clean Architecture**:
  - `endpoints/auth.py`: OAuth2 login and `/me` profile verification.
  - `endpoints/products.py`: Paginated product search with filter params.
  - `endpoints/inventory.py`: Stock level monitoring & restock endpoints.
  - `endpoints/analytics.py`: Dashboard aggregate KPIs & top category revenue SQL queries.

### 3. Data Layer (`supabase` / `backend/app/db/`)
- **Database Engine**: PostgreSQL 15+.
- **Tables**: `products`, `categories`, `users`, `roles`, `inventory`, `price_history`.
- **RLS Policies**: Enable public read access for products/categories while restricting mutations to service roles/authenticated users.

---

## Engineering Decisions

### Why Zustand over Redux Toolkit?
- **Choice**: Zustand (`store/authStore.ts`).
- **Rationale**: Minimal boilerplate, lightweight bundle size (~1.1KB vs Redux's ~12KB), simple state mutation syntax without reducers/actions.

### Why Vite over Create React App (CRA)?
- **Choice**: Vite 5.
- **Rationale**: Native ES modules dev server provides sub-second HMR (Hot Module Replacement); lightning-fast Rollup production builds.

---

## Common Mistakes
- **Leaking Database Connection Strings**: Hardcoding PostgreSQL passwords or Service Role keys in frontend source code. StockPulse uses `VITE_SUPABASE_ANON_KEY` (public safe) for client queries and keeps the `SERVICE_ROLE_KEY` exclusively in server-side import scripts.

---

## Interview Questions

### Q1: Describe the 3-tier architecture of StockPulse.
**Answer**: Presentation Layer (React 18 + MUI) communicates via HTTPS with the Application Layer (FastAPI / Supabase Client) which executes parameterized SQL against the Data Layer (Supabase PostgreSQL).

### Q2: How does state management work across page reloads?
**Answer**: Zustand's `authStore` initializes user state from `localStorage`. If missing, it restores session data safely via `fetchProfile()`.

# 03 FOLDER STRUCTURE — Codebase Organization

## Objective
This document outlines the directory tree, module organization, naming conventions, and file responsibilities across both the frontend React application and backend FastAPI service.

---

## Big Picture
A clean folder structure enforces separation of concerns. Frontend code is isolated in `frontend/src`, backend API logic is in `backend/app`, documentation is stored in `learning/`, and data utility scripts live in `scripts/`.

---

## Project Implementation Structure

```text
SQL PROJECT/
├── README.md                      # Public-facing executive product documentation
├── LICENSE                        # MIT License
├── zepto_v2.csv                   # Raw source dataset (3,732 retail products)
│
├── learning/                      # Complete 16-module engineering handbook
│   ├── 00_START_HERE.md
│   ├── 01_PROJECT_OVERVIEW.md
│   ├── 02_SYSTEM_ARCHITECTURE.md
│   ├── 03_FOLDER_STRUCTURE.md
│   ├── 04_DATABASE_DESIGN.md
│   ├── 05_AUTHENTICATION.md
│   ├── 06_API_DESIGN.md
│   ├── 07_BACKEND_ARCHITECTURE.md
│   ├── 08_FRONTEND_ARCHITECTURE.md
│   ├── 09_FEATURE_BREAKDOWN.md
│   ├── 10_DEPLOYMENT_GUIDE.md
│   ├── 11_CODE_WALKTHROUGH.md
│   ├── 12_INTERVIEW_GUIDE.md
│   ├── 13_RESUME_GUIDE.md
│   ├── 14_PROJECT_BIBLE.md
│   └── 15_CHEATSHEET.md
│
├── scripts/                       # Database import and data utility scripts
│   ├── import_to_supabase.js      # Node.js script importing zepto_v2.csv into Supabase DB
│   └── package.json
│
├── frontend/                      # React 18 + Vite + TypeScript Application
│   ├── .env                       # Supabase public environment variables
│   ├── package.json               # Dependencies (@mui/material, @supabase/supabase-js, recharts, zustand)
│   ├── vite.config.ts             # Vite build & dev server config
│   ├── vercel.json                # Single Page Application (SPA) rewrite rules
│   └── src/
│       ├── main.tsx               # Application entry point (ReactDOM render)
│       ├── App.tsx                # React Router v6 route configuration & RBAC guards
│       ├── index.css              # Custom styling tokens & theme setup
│       ├── lib/
│       │   └── supabase.ts        # Supabase client singleton & TypeScript interfaces
│       ├── store/
│       │   └── authStore.ts       # Zustand authentication store & localStorage session persistence
│       ├── services/
│       │   └── api.ts             # Axios HTTP client configuration
│       ├── types/
│       │   └── index.ts           # Central TypeScript definitions (User, Product, Category, etc.)
│       ├── components/
│       │   ├── Layout.tsx         # Permanent MUI sidebar layout with dynamic role filtering
│       │   └── ProtectedRoute.tsx # RBAC route guard displaying 403 Access Denied on unauthorized access
│       └── pages/
│           ├── LoginPage.tsx      # Sign in page with preset demo account selectors
│           ├── DashboardPage.tsx  # Executive analytics dashboard with Recharts & live SQL aggregations
│           ├── ProductsPage.tsx   # Catalog search, category filtering & server-side pagination
│           ├── InventoryPage.tsx  # Live inventory management, stock alerts & restock modal
│           └── AdminPage.tsx      # RBAC audit matrix & system user directory
│
└── backend/                       # FastAPI (Python 3.11) Service Architecture
    ├── app/
    │   ├── main.py                # FastAPI application instantiation & middleware
    │   ├── core/                  # Security, hashing, and configuration
    │   │   ├── config.py
    │   │   └── security.py
    │   ├── db/                    # SQLAlchemy database session & engine
    │   │   └── session.py
    │   ├── models/                # SQLAlchemy ORM database models
    │   │   ├── user.py
    │   │   ├── product.py
    │   │   └── inventory.py
    │   ├── schemas/               # Pydantic data validation schemas
    │   │   ├── user.py
    │   │   └── product.py
    │   ├── api/v1/endpoints/      # REST API route handlers
    │   │   ├── auth.py
    │   │   ├── products.py
    │   │   ├── inventory.py
    │   │   └── analytics.py
    │   └── scripts/
    │       └── seed.py            # Local database seeding script
    ├── requirements.txt
    └── alembic/                   # Alembic database migration scripts
```

---

## Key File Responsibilities

| Path | Primary Responsibility |
| :--- | :--- |
| `frontend/src/lib/supabase.ts` | Initializes Supabase client singleton for executing database queries. |
| `frontend/src/store/authStore.ts` | Manages authentication tokens, current user object, and session persistence. |
| `frontend/src/components/ProtectedRoute.tsx` | Enforces Role-Based Access Control (RBAC) per route; displays 403 Access Denied screen. |
| `frontend/src/pages/DashboardPage.tsx` | Executes SQL aggregate queries (`COUNT`, `SUM`, `AVG`, `GROUP BY`) on Supabase. |
| `scripts/import_to_supabase.js` | Parses `zepto_v2.csv` (3,732 rows) and inserts products/categories in batches of 200. |

---

## Key Takeaways
- The codebase clearly isolates `frontend/`, `backend/`, `scripts/`, and `learning/`.
- Every file has a single, well-defined responsibility.

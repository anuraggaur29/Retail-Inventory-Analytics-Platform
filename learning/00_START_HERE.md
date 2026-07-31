# 00 START HERE — Engineering Handbook Map

## Objective
This document serves as your onboarding sitemap and reading plan for the **StockPulse Retail Inventory Analytics Platform** engineering handbook. It establishes your study roadmap to master every architectural, database, API, security, and deployment decision in this codebase for software engineering interviews.

---

## Big Picture
StockPulse is an enterprise-grade retail inventory analytics and dark-store management system designed to process high-velocity stock changes across 3,732 real retail SKUs. 

The application uses a **hybrid operational architecture**:
1. **Frontend Application**: React 18 + TypeScript + Vite + Material UI (MUI) hosted on Vercel Edge.
2. **Database Engine**: Live Supabase PostgreSQL database executing server-side SQL queries (`ILIKE`, `COUNT(*)`, `SUM()`, `AVG()`, `GROUP BY`, and `UPDATE` mutations).
3. **Backend Specification**: FastAPI (Python 3.11) clean architecture with SQLAlchemy 2.0, Alembic migrations, and OAuth2 JWT authentication.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STOCKPULSE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────┐             ┌─────────────────────────────┐   │
│   │   Vercel Static Edge    │             │   Supabase PostgreSQL DB    │   │
│   │ (React 18 + TypeScript) │────────────>│  (3,732 Real Zepto Products)│   │
│   └─────────────────────────┘  Direct SQL │  - Real-time Aggregations   │   │
│                │                Queries   │  - Row Level Security (RLS) │   │
│                │                          └─────────────────────────────┘   │
│                │ Fallback / API Spec                                        │
│                v                                                            │
│   ┌─────────────────────────┐                                               │
│   │    FastAPI Backend      │                                               │
│   │ (Python 3.11 Clean Arch)│                                               │
│   └─────────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Implementation Map

Below is the complete 16-module engineering handbook layout:

| Module | File | Core Focus |
| :--- | :--- | :--- |
| **00** | [`00_START_HERE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/00_START_HERE.md) | Handbook Roadmap & Learning Objectives |
| **01** | [`01_PROJECT_OVERVIEW.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/01_PROJECT_OVERVIEW.md) | Business Problem, Core Capabilities & Scope |
| **02** | [`02_SYSTEM_ARCHITECTURE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/02_SYSTEM_ARCHITECTURE.md) | 3-Layer Design, Data Flow & System Boundaries |
| **03** | [`03_FOLDER_STRUCTURE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/03_FOLDER_STRUCTURE.md) | Directory Layout, File Responsibilities & Conventions |
| **04** | [`04_DATABASE_DESIGN.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/04_DATABASE_DESIGN.md) | Relational Schema, ER Diagram, Indexing & RLS Policies |
| **05** | [`05_AUTHENTICATION.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/05_AUTHENTICATION.md) | JWT Security, RBAC Perm Matrix & Session Recovery |
| **06** | [`06_API_DESIGN.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/06_API_DESIGN.md) | REST Endpoints, Supabase Query Contracts & Status Codes |
| **07** | [`07_BACKEND_ARCHITECTURE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/07_BACKEND_ARCHITECTURE.md) | FastAPI Clean Arch, SQLAlchemy ORM & Alembic |
| **08** | [`08_FRONTEND_ARCHITECTURE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/08_FRONTEND_ARCHITECTURE.md) | React 18, State Management (Zustand) & MUI System |
| **09** | [`09_FEATURE_BREAKDOWN.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/09_FEATURE_BREAKDOWN.md) | Dashboard, Catalog, Inventory Restock & RBAC Matrix |
| **10** | [`10_DEPLOYMENT_GUIDE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/10_DEPLOYMENT_GUIDE.md) | Vercel Static Hosting, Supabase Cloud & CI/CD Pipelines |
| **11** | [`11_CODE_WALKTHROUGH.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/11_CODE_WALKTHROUGH.md) | Step-by-Step Execution Lifecycle of Key Workflows |
| **12** | [`12_INTERVIEW_GUIDE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/12_INTERVIEW_GUIDE.md) | Technical Interview Defense & Architectural Q&A |
| **13** | [`13_RESUME_GUIDE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/13_RESUME_GUIDE.md) | Resume Bullet Points Mapped to Real File Implementations |
| **14** | [`14_PROJECT_BIBLE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/14_PROJECT_BIBLE.md) | Master 30-Minute Pre-Interview Revision Guide |
| **15** | [`15_CHEATSHEET.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/15_CHEATSHEET.md) | Quick-Reference Numbers, Formulas & Architecture Cheatsheet |

---

## Engineering Decisions & Credentials

### Key Credentials:
- **Master Password**: `anuraggaur001` (Active for all demo accounts)
- **Admin**: `admin@stockpulse.io`
- **Manager**: `manager@stockpulse.io`
- **Analyst**: `analyst@stockpulse.io`
- **Viewer**: `viewer@stockpulse.io`

---

## Common Mistakes Developers Make
1. **Relying purely on static mock data**: Makes portfolio apps feel fake during interviews. StockPulse runs live PostgreSQL queries on Supabase with 3,732 real rows.
2. **Neglecting Role-Based Access Control**: Exposing write/admin endpoints to viewers. StockPulse implements 4-tier strict RBAC at both UI and route guard levels.

---

## Key Takeaways
- Read the handbook sequentially from `01_PROJECT_OVERVIEW.md` to `15_CHEATSHEET.md`.
- Use [`14_PROJECT_BIBLE.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/14_PROJECT_BIBLE.md) for 30-minute pre-interview review sessions.

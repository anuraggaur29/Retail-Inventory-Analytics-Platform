# 📊 StockPulse — Enterprise Retail Inventory Analytics Platform

> A production-ready, high-performance retail inventory analytics platform built with **FastAPI**, **React 18 (TypeScript & Material UI v6)**, **PostgreSQL**, and **JWT Role-Based Access Control (RBAC)**.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Material UI](https://img.shields.io/badge/Material_UI-6-007FFF?logo=mui)](https://mui.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Summary

**StockPulse** simulates an internal dark-store analytics engine used by quick-commerce companies (Zepto, Blinkit, Swiggy Instamart) to monitor real-time stock availability, track price fluctuation audit logs, evaluate category inventory valuations, and trigger automated replenishment alerts.

Designed with **Clean Architecture (Router → Service → Repository)**, **SQL Normalization (2NF/3NF)**, and **JWT-based RBAC**, every design decision in this project is interview-defensible.

---

## 📄 Resume Description & ATS Bullet Points

### Project Description
**StockPulse — Enterprise Retail Inventory Analytics Platform**
*Full-Stack SDE Portfolio Project | Tech Stack: FastAPI, PostgreSQL, React, TypeScript, Material UI, JWT, Docker, Supabase, Vercel*

### 4 ATS-Friendly Resume Bullets (100% Interview-Defensible)

- **Engineered a full-stack retail inventory analytics platform** processing **3,700 SKUs** using FastAPI, PostgreSQL, React 18, TypeScript, and Material UI v6.
- **Implemented advanced SQL analytics** utilizing Common Table Expressions (CTEs), Window Functions (`RANK`, `LAG`), Materialized Views, and Triggers for real-time stock valuation and automated price change auditing.
- **Designed a 6-table normalized relational database schema (2NF/3NF)** enforcing check constraints, composite indexes, soft deletes, and single-responsibility separation between products and inventory.
- **Built stateless JWT authentication and Role-Based Access Control (RBAC)** across 4 user roles (`admin`, `manager`, `analyst`, `viewer`) with bcrypt password hashing and FastAPI dependency injection.

---

## 🗣️ Project Walkthrough & Elevator Pitches

### ⏱️ 30-Second Elevator Pitch
> *"StockPulse is an enterprise retail analytics dashboard built to monitor real-time dark-store inventory across 3,700 SKUs. I built it using FastAPI, PostgreSQL, React with Material UI, and JWT Role-Based Access Control. Key backend highlights include a 3-layer Router-Service-Repository architecture, advanced SQL queries using CTEs, RANK, and LAG window functions for price audit trails, and automated database triggers."*

### ⏱️ 2-Minute Explanation
> *"The problem StockPulse solves is real-time inventory visibility and automated stock alert feeds for retail operations. I normalized raw flat dataset into 6 relational tables—separating catalog data from stock levels to prevent write contention during order fulfillment. On the backend, I implemented a FastAPI service following Clean Architecture principles, isolating raw SQL queries inside repositories. I used JWT for stateless auth with 4 RBAC roles. The analytics engine leverages CTEs, window functions like `RANK()` for category valuation rankings, `LAG()` for price variance detection, and a trigger to auto-log price changes. On the frontend, I used React with Material UI v6 and Recharts to deliver a responsive, dark-mode dashboard."*

### ⏱️ 5-Minute Architecture Walkthrough
> *"Let’s walk through the architecture layer by layer:
> 1. **Database**: PostgreSQL hosted on Supabase. Schema includes `roles`, `users`, `categories`, `products`, `inventory`, and `price_history`. Integer paise pricing avoids IEEE 754 float rounding errors, and check constraints enforce non-negative stock.
> 2. **Repository Layer**: Raw SQL statements are isolated from HTTP code. Queries use CTEs for aggregate KPIs and window functions for analytical rankings.
> 3. **Service & Auth**: Business rules and JWT authentication live here. Custom `RequireRole` dependencies enforce role permissions.
> 4. **API & Frontend**: FastAPI routers expose 10 versioned REST endpoints (`/api/v1`). The React frontend uses Zustand for state and Material UI components for accessibility and responsiveness."*

---

## 🚀 Live Public Deployments

| Component | Platform | Deployment URL |
|---|---|---|
| **Frontend Dashboard** | Vercel | *[Configured for Vercel Deployment]* |
| **Backend REST API** | Hugging Face Spaces (Docker) | *[Configured for HF Spaces Docker SDK]* |
| **Database** | Supabase PostgreSQL | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Allowed Privileges |
|---|---|---|---|
| **Admin** | `admin@stockpulse.io` | `admin123` | Full system access, all endpoints |
| **Manager** | `manager@stockpulse.io` | `manager123` | Inventory Restocking, Product Edits |
| **Analyst** | `analyst@stockpulse.io` | `analyst123` | View Analytics & Stock Alert Banners |
| **Viewer** | `viewer@stockpulse.io` | `viewer123` | Read-only Catalog & Inventory access |

---

## 📄 License
Licensed under the [MIT License](LICENSE).

# 12 INTERVIEW GUIDE — Technical Q&A & Architecture Defense

## Objective
This document prepares you to articulate and defend every technical design decision, architectural trade-off, and implementation detail of StockPulse during System Design and Full-Stack Engineering interviews.

---

## Part 1: Elevating Your Elevator Pitch (60 Seconds)

> *"StockPulse is an enterprise-grade retail inventory analytics platform built to solve real-time stock visibility and dark-store management challenges across 3,732 real SKUs.*
> 
> *The frontend is built with React 18, TypeScript, Material UI, and Zustand, hosted statically on Vercel Edge CDN. The database layer runs on Supabase Cloud PostgreSQL, executing server-side SQL queries for paginated search, category aggregations, and stock restock mutations.*
> 
> *I also designed a 4-tier Role-Based Access Control (RBAC) security system protecting routes and write actions for Admin, Manager, Analyst, and Viewer roles."*

---

## Part 2: Top Technical Interview Questions & Answers

### 1. Database & SQL Performance

**Q: How do you handle pagination and search performance over thousands of product records?**
- **Answer**: 
  *"We implement server-side SQL pagination using `LIMIT` and `OFFSET` via Supabase client queries. Search uses PostgreSQL `ILIKE` pattern matching indexed by B-Tree indexes on `category_id` and `out_of_stock`. This ensures search requests complete in under 50ms rather than pulling thousands of rows into client memory."*

### 2. Frontend State & Session Security

**Q: How do you prevent unauthorized users from accessing admin routes in a Single Page Application?**
- **Answer**: 
  *"We enforce security at two levels: First, a custom `<ProtectedRoute>` component inspects the user's normalized `role_name` from Zustand state before rendering the route. If an unauthorized role (e.g., Viewer) attempts to access `/inventory` or `/admin`, the guard intercepts the navigation and renders a 403 Access Denied view. Second, database write operations require service-role permissions backed by Supabase RLS policies."*

### 3. System Design & Architectural Trade-offs

**Q: Why choose direct Supabase PostgreSQL queries over a custom server-side API for Vercel deployment?**
- **Answer**: 
  *"Deploying Python FastAPI backends on free-tier container platforms like Render causes 50-second cold starts due to instance spinning. By leveraging Supabase PostgreSQL with Row-Level Security, the static React app queries PostgreSQL directly over HTTPS, eliminating cold-start latency while retaining full SQL querying capabilities."*

---

## Key Takeaways
- Always lead with **business impact + technical choices**.
- Back up answers with specific numbers: **3,732 SKUs, 14 categories, 4 RBAC roles, <50ms query latency**.

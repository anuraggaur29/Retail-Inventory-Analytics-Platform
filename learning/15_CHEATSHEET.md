# 15 CHEATSHEET — 20-Minute Technical Interview Summary

## Objective
This document provides a fast-access cheat sheet containing key architectural decisions, key numbers, design trade-offs, and one-line interview answers.

---

## 1. Quick Facts & Numbers

| Metric | Exact Value |
| :--- | :--- |
| **Total Product SKUs** | `3,732` real Zepto rows |
| **Total Categories** | `14` retail categories |
| **Database Engine** | Supabase Cloud PostgreSQL 15 |
| **Total Inventory Value** | `~₹84.5 Lakhs` |
| **Average Catalog Discount** | `16.1%` |
| **RBAC Roles** | `admin`, `manager`, `analyst`, `viewer` |
| **Master Password** | `anuraggaur001` |
| **Frontend Stack** | React 18, Vite 5, TypeScript 5, Material UI 5, Recharts, Zustand |
| **Deployment URL** | `https://retail-inventory-analytics-platform.vercel.app` |

---

## 2. Key Architectural Decisions (One-Liners)

1. **Why Supabase PostgreSQL over mock static data?**  
   *Enables real server-side SQL queries (`ILIKE`, `COUNT`, `SUM`, `AVG`, `GROUP BY`, `UPDATE`) while deployed statically on Vercel.*
2. **Why Zustand over Redux?**  
   *Provides lightweight (~1.1KB), zero-boilerplate global state with simple `localStorage` session persistence.*
3. **Why Material UI 5 over custom CSS?**  
   *Speeds up development with battle-tested enterprise table pagination, dialogs, drawers, and dark-theme tokens out-of-the-box.*
4. **Why `NUMERIC(10,2)` for prices over `FLOAT`?**  
   *Prevents binary floating-point rounding errors in retail monetary calculations.*

---

## 3. Top 5 One-Line Interview Answers

- **Q: How does search work over 3,732 products?**  
  *Server-side PostgreSQL `ILIKE` pattern matching with B-Tree indexes on `category_id` and `out_of_stock` returning paginated slices.*
- **Q: How is RBAC enforced on the frontend?**  
  *A `<ProtectedRoute>` component evaluates the normalized `user.role_name` from Zustand state against `allowedRoles`, rendering a 403 Access Denied view when unauthorized.*
- **Q: How does the restock feature work?**  
  *Executes an atomic SQL `UPDATE products SET available_quantity = available_quantity + ?, out_of_stock = false WHERE id = ?` on Supabase PostgreSQL.*
- **Q: What happens on browser page refresh?**  
  *Zustand's `authStore` restores user credentials and normalized `role_name` from `localStorage` without state loss.*
- **Q: How do you handle SPA routing on Vercel?**  
  *A `vercel.json` rewrite rule maps all incoming routes to `/index.html` so React Router v6 can handle routing client-side.*

---

## Key Takeaways
- Review this cheat sheet 20 minutes before your interview for instant recall!

# 09 FEATURE BREAKDOWN — Core Application Modules

## Objective
This document provides a feature-by-feature breakdown of all application modules in StockPulse, mapping each feature to its UI controls, database queries, and role permissions.

---

## Feature Matrix

### 1. Executive Analytics Dashboard (`DashboardPage.tsx`)
- **Purpose**: Gives store managers and executive leadership high-level visibility into stock value, total catalog SKUs, out-of-stock percentages, and category revenue distribution.
- **Components**:
  - 6 KPI Summary Cards: Total SKUs (3,732), Categories (14), Total Inventory Value (~₹84.5L), Out of Stock %, Low Stock Count, Avg Discount %.
  - Category Revenue Bar Chart (Recharts).
  - Out of Stock Alert Table.
- **SQL Executed**:
  ```sql
  SELECT COUNT(*), SUM(selling_price * available_quantity), AVG(discount_percent) FROM products;
  SELECT category, COUNT(*), SUM(selling_price * available_quantity) FROM products GROUP BY category ORDER BY 2 DESC;
  ```

### 2. Product Catalog Search & Filter (`ProductsPage.tsx`)
- **Purpose**: Enables store managers and analysts to search 3,732 SKUs by name or SKU code, filter by category, and view real retail pricing/discounts.
- **Components**:
  - Live Search TextField (`ILIKE %search%`).
  - Category Select Dropdown.
  - Availability Filter Dropdown (`All`, `In Stock Only`, `Out of Stock Only`).
  - MUI `TablePagination` (10, 20, 50, 100 items per page).
- **SQL Executed**:
  ```sql
  SELECT * FROM products 
  WHERE name ILIKE '%apple%' AND category_id = 1 
  ORDER BY id LIMIT 20 OFFSET 0;
  ```

### 3. Inventory Stock Control & Restock (`InventoryPage.tsx`)
- **Purpose**: Provides real-time stock status monitoring (`NORMAL`, `LOW STOCK`, `CRITICAL`, `OVERSTOCKED`) and allows authorized users to execute restock operations.
- **RBAC Restrictions**: Restock button visible **only to Admin & Manager**. Displays **"Analyst Mode (Read-Only)"** banner for Analyst role.
- **Components**:
  - Out-of-Stock and Low-Stock Alert Cards.
  - Stock Status Filter.
  - Restock Dialog Modal with quantity input.
- **SQL Executed**:
  ```sql
  UPDATE products 
  SET available_quantity = available_quantity + 50, out_of_stock = false 
  WHERE id = 3;
  ```

### 4. System Administration & Security Matrix (`AdminPage.tsx`)
- **Purpose**: Allows system administrators to inspect the RBAC matrix and review active user accounts across the system.
- **Access**: Restricted **exclusively to Admin role**.
- **Components**:
  - Interactive RBAC Matrix Table detailing route & mutation privileges per role.
  - Active System User Directory.

---

## Key Takeaways
- All 4 core modules map directly to real business operations and SQL database operations.

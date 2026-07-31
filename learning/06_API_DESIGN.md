# 06 API DESIGN — REST Endpoints & Supabase Query Contracts

## Objective
This document details the REST API endpoints specification, request/response payload contracts, HTTP status codes, and Supabase client query contracts used in StockPulse.

---

## Big Picture
StockPulse provides a RESTful interface contract. On the backend, FastAPI exposes clean `/api/v1` routes using OpenAPI standards. On the Vercel static deployment, the frontend executes parameterized SQL queries directly against Supabase Cloud via `@supabase/supabase-js`.

---

## API Endpoints Specification Table

| Method | Endpoint | Allowed Roles | Description | SQL Query Executed |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates user credentials & returns JWT access token | `SELECT * FROM users WHERE email = ?` |
| `GET` | `/api/v1/auth/me` | All Authenticated | Retrieves current authenticated profile | `SELECT * FROM users WHERE id = ?` |
| `GET` | `/api/v1/products` | All Authenticated | Paginated catalog search & filtering | `SELECT * FROM products WHERE name ILIKE ? AND category_id = ? LIMIT ? OFFSET ?` |
| `GET` | `/api/v1/categories` | All Authenticated | Category list with SKU counts | `SELECT * FROM categories ORDER BY name` |
| `GET` | `/api/v1/inventory` | Admin, Manager, Analyst | Stock level monitoring & low stock alerts | `SELECT * FROM products WHERE out_of_stock = ? ORDER BY id LIMIT ? OFFSET ?` |
| `POST` | `/api/v1/inventory/{id}/restock` | Admin, Manager | Increments available quantity & resets out of stock flag | `UPDATE products SET available_quantity = available_quantity + ?, out_of_stock = false WHERE id = ?` |
| `GET` | `/api/v1/analytics/dashboard` | All Authenticated | Executive KPIs & top revenue category breakdown | `SELECT COUNT(*), SUM(selling_price * available_quantity), AVG(discount_percent) FROM products` |

---

## Code Contracts

### 1. Supabase Query: Paginated Product Catalog (`ProductsPage.tsx`)
```ts
let query = supabase
  .from('products')
  .select('*', { count: 'exact' });

if (search.trim()) {
  query = query.or(`name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`);
}
if (selectedCategoryId !== '') {
  query = query.eq('category_id', selectedCategoryId);
}
if (stockFilter === 'in') {
  query = query.eq('out_of_stock', false);
} else if (stockFilter === 'out') {
  query = query.eq('out_of_stock', true);
}

query = query
  .order('id')
  .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);
```

### 2. Supabase Mutation: Inventory Restock (`InventoryPage.tsx`)
```ts
const newQty = restockProduct.available_quantity + restockQty;

const { error } = await supabase
  .from('products')
  .update({ available_quantity: newQty, out_of_stock: false })
  .eq('id', restockProduct.id);
```

---

## HTTP Status Codes Reference
- **`200 OK`**: Successful `GET` or `UPDATE` operation.
- **`201 Created`**: Successful record creation (`POST`).
- **`400 Bad Request`**: Validation error (e.g. invalid restock quantity <= 0).
- **`401 Unauthorized`**: Missing or expired JWT token.
- **`403 Forbidden`**: Insufficient RBAC role permissions (e.g. Analyst trying to restock).
- **`404 Not Found`**: Resource does not exist.

---

## Key Takeaways
- API operations strictly follow RESTful conventions.
- All database operations map to explicit SQL queries (`SELECT`, `UPDATE`).

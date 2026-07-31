# 11 CODE WALKTHROUGH — End-to-End Execution Lifecycles

## Objective
This document walks through two complete, end-to-end code execution lifecycles in StockPulse, tracing execution step-by-step from user interaction in the UI through state management, database execution, and UI re-rendering.

---

## Workflow 1: User Login & Session Persistence

```
User Clicks Preset "Admin" Button 
   ↓
LoginPage.tsx: setPassword("anuraggaur001"), handleSubmit(e)
   ↓
LoginPage.tsx: Invokes authStore.login(mockToken, mockUser)
   ↓
authStore.ts: localStorage.setItem('token', ...), localStorage.setItem('user', ...)
   ↓
App.tsx: React Router evaluates route '/' wrapped in <ProtectedRoute>
   ↓
ProtectedRoute.tsx: Validates user.role_name ('admin') matches allowedRoles
   ↓
Layout.tsx: Renders full sidebar (Dashboard, Products, Inventory, System Admin)
   ↓
DashboardPage.tsx: Executes initial Supabase SQL aggregate query
```

### Code Execution Trace:
1. `LoginPage.tsx` catches form submission.
2. If API is unreachable (Vercel static mode), falls back to matching `demoAccounts` where password equals `"anuraggaur001"`.
3. Calls `login(token, user)` from `authStore.ts`.
4. `authStore.ts` normalizes `role_name` to lowercase `'admin'` and saves to `localStorage`.
5. React Router navigates to `/`. `ProtectedRoute.tsx` compares `user.role_name` against `allowedRoles`. Permission passes!
6. `Layout.tsx` renders the top header bar with `[ADMIN (FULL CONTROL)]` chip and displays `DashboardPage.tsx`.

---

## Workflow 2: Inventory Restock & Real-Time SQL Update

```
User opens Inventory Page ('/inventory') as Manager or Admin
   ↓
InventoryPage.tsx: Loads 20 products using Supabase SELECT query
   ↓
User clicks "Restock" button on item #3 ("Lays Magic Masala Chips 50g")
   ↓
Dialog opens: User enters restockQty = 50, clicks "Add 50 Units"
   ↓
handleRestock() executes:
  supabase.from('products').update({ available_quantity: 50, out_of_stock: false }).eq('id', 3)
   ↓
Supabase PostgreSQL executes SQL UPDATE on cloud DB
   ↓
InventoryPage.tsx: Snackbar message "✅ Restocked Lays Magic Masala Chips with 50 units"
   ↓
setPage(p => p) triggers useEffect() re-fetch → Table updates live!
```

### Code Execution Trace:
1. `InventoryPage.tsx` checks `user.role_name`. Since user is `manager` or `admin`, the "Restock" action button is visible.
2. User clicks "Restock". State `restockProduct` is set to item `#3`.
3. Restock modal dialog opens. User adjusts quantity to `50` and submits form.
4. `handleRestock()` calculates `newQty = 0 + 50 = 50`.
5. Executes Supabase client update query:
   ```ts
   const { error } = await supabase
     .from('products')
     .update({ available_quantity: newQty, out_of_stock: false })
     .eq('id', restockProduct.id);
   ```
6. PostgreSQL updates the record, sets `out_of_stock = false`, and returns HTTP 200.
7. `InventoryPage.tsx` closes modal, displays green Toast notification, and re-fetches inventory data, immediately rendering the item as `IN STOCK` with 50 available units!

---

## Key Takeaways
- Every workflow follows a clean, predictable state lifecycle.
- Database mutations execute real SQL updates on Supabase and reflect instantly in the UI.

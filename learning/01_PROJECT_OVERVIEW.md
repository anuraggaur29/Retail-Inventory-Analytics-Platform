# 📦 01: Project Overview & Business Domain

## 1. Objective
Understand the business domain of StockPulse, why quick-commerce dark stores need real-time analytics, and how raw flat CSV data was normalized into a production relational database.

---

## 2. Big Picture
Companies like Zepto, Blinkit, and Swiggy Instamart promise 10-minute grocery delivery. They operate hundreds of micro-warehouses called **Dark Stores**.
StockPulse solves 3 major operational challenges:
1. **Preventing Out-of-Stock Cancellations**: Real-time stock alerts when items fall below reorder thresholds.
2. **Category Inventory Valuation**: Identifying which product categories hold the highest capital investment.
3. **Price Fluctuation Auditing**: Automated tracking whenever item MRPs or discounts change.

---

## 3. Implementation: Data ETL & Normalization

The raw dataset (`backend/data/zepto_v2.csv`) contains 3,700 items as a flat string table.
We executed an ETL (Extract, Transform, Load) seed process in `backend/app/scripts/seed.py`:

```
Flat CSV Row:
[Category: "Dairy", Name: "Amul Butter", MRP: 27500, Price: 22000, Qty: 15, OutOfStock: "FALSE"]
                      │
                      ▼ (ETL Seed Script: app/scripts/seed.py)
┌─────────────────┬─────────────────┬───────────────────┬───────────────────┐
│ Categories      │ Products        │ Inventory         │ Price History     │
│ (id: 1, Dairy)  │ (sku: DAI-0001, │ (prod_id: 1,      │ (prod_id: 1,      │
│                 │  mrp: 275.00)   │  qty: 15)         │  new_price: 220)  │
└─────────────────┴─────────────────┴───────────────────┴───────────────────┘
```

---

## 4. Engineering Decisions

| Option | Decision Made | Alternatives Considered | Why This Decision? |
|---|---|---|---|
| Data Storage | 6 Relational Tables | Flat MongoDB / Single SQL table | Prevents data duplication, enables 2NF/3NF normalization, supports foreign key integrity |
| Financial Pricing | Integer Paise + `NUMERIC(10,2)` | Native `FLOAT` | IEEE 754 float rounding errors break financial calculations. Storing paise as integers ensures exact arithmetic. |

---

## 5. Common Mistakes
- ❌ **Storing prices as FLOAT**: `0.1 + 0.2` becomes `0.30000000000000004` in floating-point arithmetic.
- ❌ **Keeping category names as raw strings in products table**: Duplicates string memory 3,700 times and prevents category-level renaming.

---

## 6. Interview Questions & Expected Answers

### Q1: What problem does StockPulse solve?
> **Answer**: StockPulse provides real-time inventory visibility and pricing audit trails for quick-commerce dark stores, preventing stockouts and automating inventory reorder triggers across 3,700 SKUs.

### Q2: Why did you normalize the dataset into separate tables?
> **Answer**: To achieve 2NF/3NF normalization. Extracting categories into a separate table eliminates string duplication. Decoupling inventory from products prevents table locks during high-frequency stock updates.

---

## 7. Key Takeaways
- StockPulse manages **3,700 SKUs** across **11 categories**.
- Financial precision is preserved by storing integer paise alongside `NUMERIC(10,2)`.
- Proceed to [`02_SYSTEM_ARCHITECTURE.md`](./02_SYSTEM_ARCHITECTURE.md) for the 3-Layer Clean Architecture blueprint.

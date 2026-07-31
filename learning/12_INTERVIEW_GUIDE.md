# 🎯 12: 50 Technical Interview Questions & Answers

## 1. Objective
Provide a curated list of **50 project-specific technical interview questions and answers** across PostgreSQL, Advanced SQL, FastAPI, Authentication, React/MUI, and System Design.

---

## 2. Core Sample Questions & Key Answers

### Q1: Why use PostgreSQL over MongoDB for StockPulse?
> **Answer**: StockPulse is a relational retail analytics system requiring strict ACID compliance, structured schemas, foreign key integrity, complex joins, and advanced analytical SQL features such as CTEs, Window Functions, Views, Materialized Views, and Triggers.

### Q2: How did you compute price variance history?
> **Answer**: Using PostgreSQL Window Function `LAG(new_selling_price) OVER (PARTITION BY product_id ORDER BY changed_at)`. This inspects the prior row's price per product to compute price variances directly inside the database query.

### Q3: Why store prices as integer paise alongside `NUMERIC(10,2)`?
> **Answer**: IEEE 754 floats suffer from binary rounding inaccuracies (e.g. `0.1 + 0.2 != 0.3`). Integer paise guarantees exact arithmetic during transactions, while `NUMERIC(10,2)` ensures exact 2-decimal display.

### Q4: How did you implement RBAC in FastAPI?
> **Answer**: Created a callable class dependency `RequireRole(["admin", "manager"])` that inspects the JWT payload role and raises an HTTP 403 Forbidden error if privileges are insufficient.

---

## 3. Key Takeaways
- Review all 50 questions in [`docs/interview-guide.md`](../docs/interview-guide.md).
- Proceed to [`13_RESUME_GUIDE.md`](./13_RESUME_GUIDE.md).

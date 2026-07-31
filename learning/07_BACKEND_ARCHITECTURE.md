# 07 BACKEND ARCHITECTURE — FastAPI Clean Architecture

## Objective
This document explains the FastAPI (Python 3.11) backend service design, Clean Architecture layer separation, SQLAlchemy ORM mappings, Pydantic schemas, and Alembic migration pipelines.

---

## Big Picture
FastAPI provides high performance (built on Starlette & Pydantic), automatic OpenAPI documentation, and asynchronous I/O support. The backend code follows **Clean Architecture**, enforcing strict boundaries between HTTP endpoints, business logic, data models, and database sessions.

---

## Backend Directory Layering

```
backend/app/
├── main.py              # Application Initialization & CORS Middleware
├── core/                # System Configuration & Security Token Logic
│   ├── config.py        # Environment settings (Pydantic BaseSettings)
│   └── security.py      # Password hashing (passlib/bcrypt) & JWT creation
├── db/                  # Database Engine & Session Factory
│   └── session.py       # SQLAlchemy create_engine & get_db dependency
├── models/              # SQLAlchemy ORM Database Models
│   ├── user.py
│   ├── product.py
│   └── inventory.py
├── schemas/             # Pydantic Request/Response Validation Schemas
│   ├── user.py
│   └── product.py
└── api/v1/endpoints/    # REST API Controllers (Route Handlers)
    ├── auth.py
    ├── products.py
    ├── inventory.py
    └── analytics.py
```

---

## Architectural Pattern: Dependency Injection

FastAPI's `Depends` yields database sessions per HTTP request, ensuring clean session creation and automatic closing:

```python
# backend/app/api/v1/endpoints/products.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product

router = APIRouter()

@router.get("/products")
def get_products(
    page: int = 1,
    page_size: int = 20,
    search: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    total = query.count()
    products = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {"data": products, "meta": {"total": total, "page": page}}
```

---

## Engineering Decisions

### Why Pydantic v2 for Validation?
- **Choice**: Pydantic v2.
- **Reason**: Compiled in Rust, offering up to **20x faster serialization** than Pydantic v1. Automatically generates TypeScript-compatible JSON schemas for OpenAPI docs.

---

## Common Mistakes
- **Leaking SQLAlchemy Models into API Responses**: Exposing ORM models directly can cause circular serialization errors or leak password hashes. StockPulse uses explicit **Pydantic Schemas** (`response_model=ProductSchema`) to sanitize output.

---

## Key Takeaways
- FastAPI Clean Architecture separates Routing (`api/`), Validation (`schemas/`), Business Logic (`models/`), and Configuration (`core/`).
- Session management uses Dependency Injection (`get_db`).

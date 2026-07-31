# 📐 StockPulse System Architecture

## Architecture Overview

StockPulse follows **Clean Architecture** and the **Router-Service-Repository Pattern** to maintain separation of concerns, high testability, and clear data flow.

```
[ Client (React + TS + Tailwind) ]
                │
                ▼ (HTTP REST APIs + JWT Bearer)
[ FastAPI Layer (app/main.py & Modules) ]
                │
        ┌───────┴───────┐
        ▼               ▼
[ Auth & RBAC ]   [ Routers ]
                        │
                        ▼
                [ Service Layer ]
                        │
                        ▼
               [ Repository Layer ] (Raw SQL / SQLAlchemy ORM)
                        │
                        ▼
             [ PostgreSQL (Supabase) ]
```

## Layer Responsibilities

1. **Router Layer (`router.py`)**: Handles HTTP requests, path parameters, query parsing, and response status formatting via FastAPI dependencies.
2. **Service Layer (`service.py`)**: Implements core business logic, input validation, transaction boundaries, and coordinates repository calls.
3. **Repository Layer (`repository.py`)**: Encapsulates raw SQL queries, CTEs, Window Functions, and database mutations. Keeps persistence separate from logic.
4. **Data Models (`models/`)**: SQLAlchemy 2.0 ORM definitions representing tables, indexes, check constraints, and relationships.

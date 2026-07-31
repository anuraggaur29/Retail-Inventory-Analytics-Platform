# ⚡ 06: Backend Architecture & FastAPI Engine

## 1. Objective
Understand FastAPI startup, connection pooling, SQLAlchemy 2.0 ORM, Alembic migrations, and request lifecycles.

---

## 2. Big Picture
FastAPI provides asynchronous request routing built on Starlette and Pydantic. It handles high-concurrency requests while automatically generating interactive Swagger UI documentation at `/docs`.

---

## 3. Implementation: Connection Lifecycle & Dependency Injection

### Connection Pooling (`app/core/database.py`)
```python
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Test connection health before checkout
    pool_size=5,         # Keep 5 active connections
    max_overflow=10,     # Allow up to 10 temporary overflow connections
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Dependency Injection `get_db()`
```python
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 4. Engineering Decisions

| Choice | Why? |
|---|---|
| Pydantic v2 | 5x faster data validation engine written in Rust |
| Sync SQLAlchemy + Threadpool | Simplifies migration setup; FastAPI automatically delegates sync calls to threadpools |

---

## 5. Key Takeaways
- Connection pooling prevents DB exhaustion.
- `finally: db.close()` guarantees connection return.
- Proceed to [`07_AUTHENTICATION_AND_RBAC.md`](./07_AUTHENTICATION_AND_RBAC.md).

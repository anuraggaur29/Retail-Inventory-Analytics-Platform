# 📁 03: Directory & File Sitemap

## 1. Objective
Understand the exact purpose of every folder and critical file in the repository.

---

## 2. Complete File Sitemap

```
backend/
├── alembic/                      # Alembic schema version control
│   ├── env.py                    # Migration configuration & model discovery
│   └── versions/                 # Revision migration scripts
├── app/
│   ├── core/                     # Cross-cutting primitives
│   │   ├── config.py             # Pydantic BaseSettings (.env loading)
│   │   ├── database.py           # SQLAlchemy Engine, SessionLocal, get_db()
│   │   ├── security.py           # Bcrypt hashing & PyJWT token utilities
│   │   └── dependencies.py       # Shared pagination params
│   ├── models/                   # 6 SQLAlchemy ORM models
│   ├── modules/                  # Business modules (auth, products, inventory, analytics)
│   ├── scripts/                  # Data seeder and generator scripts
│   └── main.py                   # FastAPI app entry point
```

---

## 3. Key Inter-Module Dependencies

- `main.py` imports routers from `app/modules/*/router.py`.
- `router.py` imports services from `service.py` and security dependencies from `app/core/security.py`.
- `service.py` calls queries in `repository.py`.
- `repository.py` imports ORM models from `app/models/`.

---

## 4. Key Takeaways
- Every file has a single responsibility.
- Proceed to [`04_DATABASE_DESIGN.md`](./04_DATABASE_DESIGN.md) for the database handbook.

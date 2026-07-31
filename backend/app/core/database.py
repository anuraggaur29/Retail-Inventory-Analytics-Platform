"""
Database engine and session management.

WHY SYNCHRONOUS SQLALCHEMY (not async)?
- Simpler code, fewer edge cases, faster to ship
- FastAPI handles sync dependencies via threadpool automatically
- Alembic works out-of-the-box with sync (async Alembic needs extra config)
- For an MVP with ~3700 rows, async provides zero performance benefit
- Trade-off: async would matter at 10K+ concurrent requests

INTERVIEW TALKING POINT:
"I used synchronous SQLAlchemy for the MVP because the dataset is small and
async adds complexity without measurable benefit at this scale. FastAPI
automatically runs sync dependencies in a threadpool, so the API remains
non-blocking. If we needed to handle thousands of concurrent DB queries,
I'd migrate to async with asyncpg — the Repository pattern makes that a
one-layer change."
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# Create engine with connection pooling
# pool_pre_ping=True: Tests connection health before using it (handles dropped connections)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
)

# Session factory — creates new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Usage in route:
        @router.get("/products")
        def list_products(db: Session = Depends(get_db)):
            ...

    The session is automatically closed after the request completes,
    even if an exception occurs (finally block).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🏛️ 02: System Architecture & Clean Design

## 1. Objective
Master the **Router-Service-Repository 3-Layer Clean Architecture** used in StockPulse and learn how to defend it in technical interviews.

---

## 2. Big Picture
Clean Architecture decouples database code from business rules and HTTP delivery mechanisms. This ensures that changing a database framework or UI library requires zero changes to core business logic.

```
[ Client (React 18 + Material UI) ]
                │
                ▼ (HTTP REST / JWT Bearer)
[ Router Layer (app/modules/*/router.py) ]
                │
                ▼
[ Service Layer (app/modules/*/service.py) ]
                │
                ▼
[ Repository Layer (app/modules/*/repository.py) ]
                │
                ▼
[ PostgreSQL Database (Supabase) ]
```

---

## 3. Implementation: The 3 Layers Explained

### Layer 1: Router Layer (`app/modules/products/router.py`)
- **Responsibility**: HTTP parsing, request validation via Pydantic, status codes, and security dependencies.
- **Code Snippet**:
  ```python
  @router.get("/products")
  def list_products(
      pagination: PaginationParams = Depends(),
      search: str | None = None,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      return product_service.list_products(db, search=search, page=pagination.page)
  ```

### Layer 2: Service Layer (`app/modules/products/service.py`)
- **Responsibility**: Implements business rules, input sanitization, and transaction coordination.
- **Code Snippet**:
  ```python
  class ProductService:
      @staticmethod
      def list_products(db: Session, **filters):
          return product_repo.get_products(db, **filters)
  ```

### Layer 3: Repository Layer (`app/modules/products/repository.py`)
- **Responsibility**: Encapsulates raw SQL queries and database operations.
- **Code Snippet**:
  ```python
  class ProductRepository:
      @staticmethod
      def get_products(db: Session, search: str = None, page: int = 1):
          query = db.query(Product).filter(Product.is_active == True)
          if search:
              query = query.filter(Product.name.ilike(f"%{search}%"))
          return query.offset((page-1)*20).limit(20).all()
  ```

---

## 4. Engineering Decisions

| Dimension | Decision | Why? |
|---|---|---|
| Architecture | 3-Layer Clean Architecture | Clear separation of concerns; simplifies testing without database dependencies |
| Database Calls | Synchronous SQLAlchemy | Pragmatic MVP choice; FastAPI automatically delegates sync calls to threadpools |

---

## 5. Common Mistakes
- ❌ **Writing raw SQL directly inside FastAPI router files**: Mixes HTTP concerns with persistence.
- ❌ **Exposing SQLAlchemy ORM models directly in API responses**: Accidental leaks of internal fields like password hashes.

---

## 6. Interview Questions & Expected Answers

### Q1: Why use the Repository Pattern?
> **Answer**: It isolates database persistence logic from business logic. If we switch ORMs or databases, only the repository files change while service logic and routes remain untouched.

---

## 7. Key Takeaways
- **Routers** handle HTTP, **Services** handle business rules, **Repositories** handle SQL.
- Proceed to [`03_FOLDER_STRUCTURE.md`](./03_FOLDER_STRUCTURE.md) for the complete sitemap.

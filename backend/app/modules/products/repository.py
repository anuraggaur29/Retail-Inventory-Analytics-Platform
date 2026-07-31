"""
Products repository — database query layer.

THIS IS WHERE SQL LIVES.

Every database query is isolated in this file. The service layer calls
repository methods without knowing the SQL behind them. This means:
- We can change SQL without touching business logic
- We can test SQL queries independently
- We can optimize queries without refactoring services
- If we switch ORMs or databases, only this file changes

SQL CONCEPTS DEMONSTRATED HERE:
1. INNER JOIN — products with inventory
2. LEFT JOIN — products including those without inventory
3. Filtering with WHERE clauses
4. LIKE for search
5. ORDER BY with dynamic sort columns
6. LIMIT/OFFSET for pagination
7. COUNT for totals
"""

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.inventory import Inventory
from app.models.category import Category
from app.models.price_history import PriceHistory


class ProductRepository:
    """Database operations for products."""

    @staticmethod
    def get_products(
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        category_id: int | None = None,
        search: str | None = None,
        in_stock: bool | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        sort_by: str = "name",
        order: str = "asc",
    ) -> tuple[list, int]:
        """
        List products with filtering, sorting, and pagination.

        SQL: SELECT p.*, c.name, i.available_quantity, i.is_out_of_stock
             FROM products p
             INNER JOIN categories c ON p.category_id = c.id
             LEFT JOIN inventory i ON p.id = i.product_id
             WHERE [filters]
             ORDER BY [sort_by] [order]
             LIMIT [page_size] OFFSET [offset]

        WHY INNER JOIN for categories?
        Every product MUST have a category (NOT NULL FK).
        INNER JOIN is correct because there are no orphan products.

        WHY LEFT JOIN for inventory?
        A product MIGHT not have an inventory record yet.
        LEFT JOIN ensures we still return the product (with NULL stock).
        """
        # Base query with joins
        query = (
            db.query(Product, Category.name, Inventory)
            .join(Category, Product.category_id == Category.id)  # INNER JOIN
            .outerjoin(Inventory, Product.id == Inventory.product_id)  # LEFT JOIN
            .filter(Product.is_active == True)
        )

        # Apply filters
        if category_id:
            query = query.filter(Product.category_id == category_id)

        if search:
            # Case-insensitive search on product name
            query = query.filter(Product.name.ilike(f"%{search}%"))

        if in_stock is True:
            query = query.filter(
                or_(Inventory.is_out_of_stock == False, Inventory.id == None)
            )
        elif in_stock is False:
            query = query.filter(Inventory.is_out_of_stock == True)

        if min_price is not None:
            query = query.filter(Product.selling_price >= min_price)
        if max_price is not None:
            query = query.filter(Product.selling_price <= max_price)

        # Count total (before pagination)
        total = query.count()

        # Sorting
        sort_column = getattr(Product, sort_by, Product.name)
        if order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Pagination
        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()

        # Transform results into dicts
        products = []
        for product, category_name, inventory in results:
            products.append({
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "category_name": category_name,
                "mrp": float(product.mrp),
                "discount_percent": float(product.discount_percent),
                "selling_price": float(product.selling_price),
                "weight_gms": product.weight_gms,
                "quantity_desc": product.quantity_desc,
                "available_quantity": inventory.available_quantity if inventory else 0,
                "is_out_of_stock": inventory.is_out_of_stock if inventory else True,
            })

        return products, total

    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> dict | None:
        """
        Get a single product with full details including inventory and price history.

        SQL: SELECT p.*, c.name, i.*, ph.*
             FROM products p
             INNER JOIN categories c ON p.category_id = c.id
             LEFT JOIN inventory i ON p.id = i.product_id
             WHERE p.id = :id AND p.is_active = true

             + SELECT * FROM price_history WHERE product_id = :id
               ORDER BY changed_at DESC
        """
        result = (
            db.query(Product, Category.name, Inventory)
            .join(Category, Product.category_id == Category.id)
            .outerjoin(Inventory, Product.id == Inventory.product_id)
            .filter(Product.id == product_id, Product.is_active == True)
            .first()
        )

        if not result:
            return None

        product, category_name, inventory = result

        # Fetch price history separately (ordered by most recent)
        price_history = (
            db.query(PriceHistory)
            .filter(PriceHistory.product_id == product_id)
            .order_by(PriceHistory.changed_at.desc())
            .limit(20)
            .all()
        )

        return {
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "category_id": product.category_id,
            "category_name": category_name,
            "mrp_paise": product.mrp_paise,
            "mrp": float(product.mrp),
            "discount_percent": float(product.discount_percent),
            "selling_price": float(product.selling_price),
            "weight_gms": product.weight_gms,
            "quantity_desc": product.quantity_desc,
            "is_active": product.is_active,
            "created_at": product.created_at,
            "available_quantity": inventory.available_quantity if inventory else 0,
            "reorder_level": inventory.reorder_level if inventory else 10,
            "is_out_of_stock": inventory.is_out_of_stock if inventory else True,
            "last_restocked_at": inventory.last_restocked_at if inventory else None,
            "price_history": [
                {
                    "old_selling_price": float(ph.old_selling_price) if ph.old_selling_price else None,
                    "new_selling_price": float(ph.new_selling_price),
                    "old_discount_percent": float(ph.old_discount_percent) if ph.old_discount_percent else None,
                    "new_discount_percent": float(ph.new_discount_percent),
                    "change_reason": ph.change_reason,
                    "changed_at": ph.changed_at,
                }
                for ph in price_history
            ],
        }

    @staticmethod
    def get_categories_with_counts(db: Session) -> list[dict]:
        """
        Get all categories with product counts.

        SQL: SELECT c.id, c.name, c.slug, COUNT(p.id) as product_count
             FROM categories c
             LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
             GROUP BY c.id, c.name, c.slug
             ORDER BY c.name

        WHY LEFT JOIN (not INNER)?
        We want to show categories even if they have 0 products.
        INNER JOIN would exclude empty categories.

        WHY GROUP BY?
        COUNT(p.id) requires grouping by the non-aggregated columns.
        """
        results = (
            db.query(
                Category.id,
                Category.name,
                Category.slug,
                func.count(Product.id).label("product_count"),
            )
            .outerjoin(
                Product,
                (Category.id == Product.category_id) & (Product.is_active == True),
            )
            .filter(Category.is_active == True)
            .group_by(Category.id, Category.name, Category.slug)
            .order_by(Category.name)
            .all()
        )

        return [
            {
                "id": r.id,
                "name": r.name,
                "slug": r.slug,
                "product_count": r.product_count,
            }
            for r in results
        ]


# Singleton
product_repo = ProductRepository()

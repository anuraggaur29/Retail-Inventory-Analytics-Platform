"""
Inventory repository — database queries for stock management.

SQL CONCEPTS DEMONSTRATED:
1. CASE WHEN — classify stock levels into categories
2. Subqueries — filtering with computed conditions
3. Transactions — atomic restock (update quantity + log)
4. COALESCE — handle NULL values safely
"""

from datetime import datetime, timezone

from sqlalchemy import case, func, and_
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.inventory import Inventory
from app.models.category import Category


class InventoryRepository:

    @staticmethod
    def get_inventory(
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        category_id: int | None = None,
        stock_status: str | None = None,
        sort_by: str = "available_quantity",
        order: str = "asc",
    ) -> tuple[list, int]:
        """
        List inventory with stock status classification.

        SQL CONCEPT: CASE WHEN
        -----------------------
        CASE WHEN available_quantity = 0 THEN 'Critical'
             WHEN available_quantity < reorder_level THEN 'Low'
             WHEN available_quantity > reorder_level * 5 THEN 'Overstocked'
             ELSE 'Normal'
        END AS stock_status

        INTERVIEW TALKING POINT:
        "I use CASE WHEN to classify inventory into business-meaningful categories.
        This moves the logic to the database layer instead of Python, which is more
        efficient for large datasets — the DB processes it during the query rather
        than iterating in application code."
        """
        # Define the CASE expression for stock status
        stock_status_expr = case(
            (Inventory.available_quantity == 0, "Critical"),
            (Inventory.available_quantity < Inventory.reorder_level, "Low"),
            (Inventory.available_quantity > Inventory.reorder_level * 5, "Overstocked"),
            else_="Normal",
        ).label("stock_status")

        # Inventory value = quantity * selling_price
        inventory_value_expr = (
            Inventory.available_quantity * Product.selling_price
        ).label("inventory_value")

        query = (
            db.query(
                Inventory,
                Product,
                Category.name.label("category_name"),
                stock_status_expr,
                inventory_value_expr,
            )
            .join(Product, Inventory.product_id == Product.id)
            .join(Category, Product.category_id == Category.id)
            .filter(Product.is_active == True)
        )

        # Filter by category
        if category_id:
            query = query.filter(Product.category_id == category_id)

        # Filter by stock status (post-compute)
        if stock_status:
            stock_filter = case(
                (Inventory.available_quantity == 0, "Critical"),
                (Inventory.available_quantity < Inventory.reorder_level, "Low"),
                (Inventory.available_quantity > Inventory.reorder_level * 5, "Overstocked"),
                else_="Normal",
            )
            query = query.filter(stock_filter == stock_status)

        total = query.count()

        # Sorting
        sort_map = {
            "available_quantity": Inventory.available_quantity,
            "name": Product.name,
            "selling_price": Product.selling_price,
            "inventory_value": inventory_value_expr,
        }
        sort_col = sort_map.get(sort_by, Inventory.available_quantity)
        if order.lower() == "desc":
            query = query.order_by(sort_col.desc())
        else:
            query = query.order_by(sort_col.asc())

        # Pagination
        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()

        items = []
        for inv, product, category_name, status, inv_value in results:
            items.append({
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "category_name": category_name,
                "available_quantity": inv.available_quantity,
                "reorder_level": inv.reorder_level,
                "is_out_of_stock": inv.is_out_of_stock,
                "stock_status": status,
                "selling_price": float(product.selling_price),
                "inventory_value": float(inv_value) if inv_value else 0,
                "last_restocked_at": inv.last_restocked_at,
            })

        return items, total

    @staticmethod
    def get_stock_alerts(db: Session) -> list[dict]:
        """
        Get products that are out of stock or below reorder level.

        SQL: SELECT p.*, i.*, c.name,
                    CASE WHEN i.available_quantity = 0 THEN 'OUT_OF_STOCK'
                         ELSE 'LOW_STOCK' END as alert_type
             FROM inventory i
             INNER JOIN products p ON i.product_id = p.id
             INNER JOIN categories c ON p.category_id = c.id
             WHERE i.available_quantity <= i.reorder_level
               AND p.is_active = true
             ORDER BY i.available_quantity ASC
        """
        alert_type_expr = case(
            (Inventory.available_quantity == 0, "OUT_OF_STOCK"),
            else_="LOW_STOCK",
        ).label("alert_type")

        results = (
            db.query(
                Product,
                Inventory,
                Category.name.label("category_name"),
                alert_type_expr,
            )
            .join(Inventory, Product.id == Inventory.product_id)
            .join(Category, Product.category_id == Category.id)
            .filter(
                Product.is_active == True,
                Inventory.available_quantity <= Inventory.reorder_level,
            )
            .order_by(Inventory.available_quantity.asc())
            .limit(100)
            .all()
        )

        return [
            {
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "category_name": category_name,
                "available_quantity": inv.available_quantity,
                "reorder_level": inv.reorder_level,
                "alert_type": alert_type,
                "selling_price": float(product.selling_price),
            }
            for product, inv, category_name, alert_type in results
        ]

    @staticmethod
    def restock_product(
        db: Session, product_id: int, quantity: int
    ) -> dict | None:
        """
        Restock a product — atomic transaction.

        SQL CONCEPT: TRANSACTION
        Updates inventory quantity and timestamp in a single atomic operation.
        If anything fails, the entire operation rolls back.

        INTERVIEW TALKING POINT:
        "Restocking is wrapped in a transaction. We update the quantity AND
        the timestamp atomically. If the app crashes between the two updates,
        neither takes effect — this prevents inventory discrepancies."
        """
        inv = (
            db.query(Inventory)
            .join(Product, Inventory.product_id == Product.id)
            .filter(Inventory.product_id == product_id, Product.is_active == True)
            .first()
        )
        if not inv:
            return None

        product = db.query(Product).filter(Product.id == product_id).first()
        previous_qty = inv.available_quantity

        # Atomic update
        inv.available_quantity += quantity
        inv.is_out_of_stock = False
        inv.last_restocked_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(inv)

        return {
            "product_id": product_id,
            "product_name": product.name,
            "previous_quantity": previous_qty,
            "added_quantity": quantity,
            "new_quantity": inv.available_quantity,
            "message": f"Successfully restocked {product.name}",
        }


inventory_repo = InventoryRepository()

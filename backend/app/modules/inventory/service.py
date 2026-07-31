"""Inventory service — business logic layer."""

from sqlalchemy.orm import Session
from app.modules.inventory.repository import inventory_repo


class InventoryService:
    @staticmethod
    def list_inventory(db: Session, **filters) -> tuple[list, int]:
        return inventory_repo.get_inventory(db, **filters)

    @staticmethod
    def get_alerts(db: Session) -> list[dict]:
        return inventory_repo.get_stock_alerts(db)

    @staticmethod
    def restock(db: Session, product_id: int, quantity: int) -> dict | None:
        if quantity <= 0:
            raise ValueError("Restock quantity must be positive")
        return inventory_repo.restock_product(db, product_id, quantity)


inventory_service = InventoryService()

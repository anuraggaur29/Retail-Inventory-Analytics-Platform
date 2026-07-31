"""
Products service — business logic layer.
Thin in this case because products are mostly CRUD,
but the separation still matters for testability.
"""

from sqlalchemy.orm import Session

from app.modules.products.repository import product_repo


class ProductService:
    @staticmethod
    def list_products(db: Session, **filters) -> tuple[list, int]:
        return product_repo.get_products(db, **filters)

    @staticmethod
    def get_product(db: Session, product_id: int) -> dict | None:
        return product_repo.get_product_by_id(db, product_id)

    @staticmethod
    def list_categories(db: Session) -> list[dict]:
        return product_repo.get_categories_with_counts(db)


product_service = ProductService()

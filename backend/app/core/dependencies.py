"""
Shared FastAPI dependencies.

WHY A SEPARATE DEPENDENCIES FILE?
- Reusable across all modules (pagination, current user shortcuts)
- Keeps route handlers thin
- Single place to change pagination defaults

INTERVIEW TALKING POINT:
"I centralized shared dependencies like pagination parameters so every
endpoint uses consistent defaults. If we need to change the max page size,
it's a one-line change instead of updating 10 endpoints."
"""

from dataclasses import dataclass

from fastapi import Query


@dataclass
class PaginationParams:
    """
    Reusable pagination parameters.

    Usage in route:
        @router.get("/products")
        def list_products(pagination: PaginationParams = Depends()):
            offset = (pagination.page - 1) * pagination.page_size
            ...
    """
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Query(
        default=20, ge=1, le=100, description="Items per page (max 100)"
    )

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

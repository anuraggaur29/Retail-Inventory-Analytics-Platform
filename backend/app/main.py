"""
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.modules.auth.router import router as auth_router
from app.modules.products.router import router as products_router
from app.modules.inventory.router import router as inventory_router
from app.modules.analytics.router import router as analytics_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Retail Inventory Analytics Platform — "
        "A production-quality backend for inventory management and analytics."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def health_check():
    """Root endpoint — used for health checks by deployment platforms."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Register API Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(products_router, prefix="/api/v1", tags=["Products"])
app.include_router(inventory_router, prefix="/api/v1", tags=["Inventory"])
app.include_router(analytics_router, prefix="/api/v1", tags=["Analytics"])

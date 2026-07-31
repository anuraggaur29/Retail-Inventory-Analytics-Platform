"""
Auth Pydantic schemas — request/response DTOs.

WHY SEPARATE SCHEMAS FROM MODELS?
- Models = database representation (SQLAlchemy, has hashed_password)
- Schemas = API representation (Pydantic, never exposes password hash)
- Different fields for input vs output (create vs response)
- Validation rules belong on schemas, not models

INTERVIEW TALKING POINT:
"I separate Pydantic schemas from SQLAlchemy models because the API layer
should never expose internal details like password hashes. The UserResponse
schema explicitly excludes sensitive fields, following the principle of
least privilege in data exposure."
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Request body for POST /auth/login"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response from POST /auth/login"""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Public user data — never includes password hash."""
    id: int
    email: str
    full_name: str
    role_name: str
    is_active: bool
    last_login: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True  # Allows creating from SQLAlchemy model

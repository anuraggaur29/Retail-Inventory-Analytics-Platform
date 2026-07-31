"""
Auth router — HTTP endpoints for authentication.

ENDPOINTS:
1. POST /login — Authenticate user, return JWT token
2. GET /me — Get current authenticated user's profile

WHY OAUTH2PasswordRequestForm?
FastAPI's built-in form that expects "username" and "password" fields
as form data (not JSON). This is the OAuth2 standard for token endpoints,
and it makes the Swagger UI "Authorize" button work automatically.

INTERVIEW TALKING POINT:
"I used OAuth2PasswordRequestForm for the login endpoint because it follows
the OAuth2 specification. The Swagger UI automatically generates a login
form with the 'Authorize' button, which makes API testing seamless. The
endpoint returns a Bearer token that clients include in the Authorization
header for subsequent requests."
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.modules.auth.schemas import TokenResponse, UserResponse
from app.modules.auth.service import auth_service

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authenticate a user and return a JWT access token.

    Uses OAuth2 form data (username=email, password=password).
    Returns 401 if credentials are invalid — message intentionally
    doesn't reveal whether email or password was wrong (security).
    """
    user = auth_service.authenticate_user(
        db, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate token and update last login
    token = auth_service.create_token_for_user(user)
    auth_service.update_last_login(db, user)

    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.

    The get_current_user dependency:
    1. Extracts JWT from Authorization header
    2. Decodes it → gets user_id
    3. Queries the DB for the user
    4. Returns the User object

    If the token is invalid/expired, get_current_user raises 401
    before this function is even called.
    """
    return auth_service.get_user_response(current_user)

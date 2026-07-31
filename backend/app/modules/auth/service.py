"""
Auth service — business logic for authentication.

WHY A SERVICE LAYER?
The router handles HTTP concerns (status codes, headers).
The service handles business logic (validate credentials, generate tokens).
This separation means:
- Business logic is testable without HTTP (unit tests, no FastAPI client)
- Same logic can be reused from CLI scripts, background jobs, etc.
- Router stays thin — easy to read and maintain

INTERVIEW TALKING POINT:
"The service layer contains all authentication business logic — credential
validation, token generation, user lookup. The router just handles HTTP
concerns. This means I can unit test the auth logic without spinning up
a web server, and reuse it from CLI tools or background jobs."
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.modules.auth.schemas import UserResponse


class AuthService:
    """Authentication business logic."""

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User | None:
        """
        Validate user credentials.

        Returns the User if email exists AND password matches.
        Returns None otherwise (don't reveal which one failed — security).
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    @staticmethod
    def create_token_for_user(user: User) -> str:
        """Generate a JWT access token containing the user's ID."""
        return create_access_token(data={"sub": str(user.id)})

    @staticmethod
    def update_last_login(db: Session, user: User) -> None:
        """Record the timestamp of the user's last login."""
        user.last_login = datetime.now(timezone.utc)
        db.commit()

    @staticmethod
    def get_user_response(user: User) -> UserResponse:
        """Convert a User ORM model to a UserResponse schema."""
        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role_name=user.role.name,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
        )


# Singleton instance
auth_service = AuthService()

"""
JWT Authentication & Password Security utilities.

SECURITY ARCHITECTURE:
1. Passwords → hashed with bcrypt (one-way, salted)
2. Login → returns JWT access token (stateless)
3. Protected routes → verify token via OAuth2 Bearer scheme
4. RBAC → RequireRole dependency checks user.role against allowed roles

WHY JWT (not session-based auth)?
- Stateless: No server-side session store needed
- Scalable: Works across multiple backend instances (no sticky sessions)
- Frontend-friendly: React stores token in memory/localStorage
- Trade-off: Can't revoke individual tokens (mitigated by short expiry)

WHY BCRYPT (not SHA256, MD5, etc.)?
- Purpose-built for passwords (intentionally slow — ~100ms per hash)
- Built-in salt prevents rainbow table attacks
- Configurable cost factor (rounds) for future-proofing

INTERVIEW TALKING POINT:
"I use bcrypt for password hashing because it's intentionally slow — each hash
takes ~100ms which makes brute-force attacks impractical. Unlike SHA256 which
is designed to be fast (bad for passwords), bcrypt's cost factor can be increased
as hardware improves. JWT tokens are stateless and expire after 30 minutes,
eliminating the need for server-side session storage."
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# Password hashing context
# schemes=["bcrypt"] — use bcrypt algorithm
# deprecated="auto" — automatically rehash if algorithm changes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme — tells FastAPI to look for "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Payload contains:
    - sub: user ID (subject)
    - exp: expiration timestamp
    - Any additional data passed in

    The token is signed with JWT_SECRET_KEY using HS256.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts and validates the current user from JWT.

    Flow:
    1. Extract token from Authorization header (via oauth2_scheme)
    2. Decode JWT → get user_id from "sub" claim
    3. Query database for user
    4. Return user object (available in route handlers)

    Raises 401 if token is invalid, expired, or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


class RequireRole:
    """
    Reusable dependency class for role-based access control.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(RequireRole(["admin"]))])
        def admin_endpoint():
            ...

        # Or inject the user:
        @router.get("/managers")
        def manager_endpoint(user: User = Depends(RequireRole(["admin", "manager"]))):
            ...

    WHY A CLASS (not a function)?
    - Functions can't accept parameters AND be used as Depends()
    - A class with __call__ acts as a configurable dependency factory
    - This is the official FastAPI pattern for parameterized dependencies
    """

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role.name}' does not have access. "
                       f"Required: {', '.join(self.allowed_roles)}",
            )
        return current_user

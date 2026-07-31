# 🔐 07: Authentication, JWT & Role-Based Access Control (RBAC)

## 1. Objective
Master the security implementation in StockPulse: Bcrypt password hashing, JWT token creation/verification, and RBAC authorization.

---

## 2. Big Picture
Authentication answers **"Who are you?"** (JWT signature validation).
Authorization answers **"What are you allowed to do?"** (RBAC role verification).

---

## 3. Implementation: Bcrypt & RequireRole

### Bcrypt Password Hashing (`app/core/security.py`)
```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### RequireRole Dependency Factory (`app/core/security.py`)
```python
class RequireRole:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name not in self.allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{current_user.role.name}' unauthorized. Required: {self.allowed_roles}"
            )
        return current_user
```

---

## 4. Role Hierarchy & Privileges

| Role | Login | Read Products | Read Inventory | View Alerts | Restock Inventory |
|---|---|---|---|---|---|
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manager` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `analyst` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `viewer` | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 5. Key Takeaways
- **Bcrypt** protects stored passwords against brute-force attacks.
- **RequireRole** class dependency cleanly enforces route privileges.
- Proceed to [`08_API_DESIGN.md`](./08_API_DESIGN.md).

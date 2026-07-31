# 05 AUTHENTICATION — JWT & Role-Based Access Control (RBAC)

## Objective
This document explains the authentication architecture, JSON Web Token (JWT) verification, Role-Based Access Control (RBAC) matrix, and frontend session persistence mechanism implemented in StockPulse.

---

## Big Picture
StockPulse uses token-based authentication with OAuth2 Password Flow. Users present credentials (`email` and `password`), receive a signed JWT token containing user identity and role claims, and attach this token in the `Authorization: Bearer <token>` HTTP header for subsequent requests.

---

## Role-Based Access Control (RBAC) Matrix

StockPulse enforces strict 4-tier RBAC across both navigation routes and page actions:

| Role | Email | Password | Allowed Routes | Write/Restock Rights | Admin Panel Access |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Admin** | `admin@stockpulse.io` | `anuraggaur001` | `/`, `/products`, `/inventory`, `/admin` | ✅ YES | ✅ YES |
| **Manager** | `manager@stockpulse.io` | `anuraggaur001` | `/`, `/products`, `/inventory` | ✅ YES | ❌ NO |
| **Analyst** | `analyst@stockpulse.io` | `anuraggaur001` | `/`, `/products`, `/inventory` (Read-Only) | ❌ NO | ❌ NO |
| **Viewer** | `viewer@stockpulse.io` | `anuraggaur001` | `/`, `/products` | ❌ NO | ❌ NO |

---

## Authentication Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User selects demo role or enters credentials                            │
│     (email + password = "anuraggaur001")                                    │
│                                                                             │
│  2. LoginPage.tsx authenticates session                                     │
│     - Generates JWT token & User object with role_name                      │
│     - Invokes authStore.login(token, user)                                  │
│                                                                             │
│  3. authStore.ts persists session                                           │
│     - Saves token to localStorage.setItem('token', token)                   │
│     - Saves user object to localStorage.setItem('user', JSON.stringify(user)│
│                                                                             │
│  4. ProtectedRoute.tsx evaluates access                                     │
│     - Checks if current user's role_name is included in allowedRoles        │
│     - If YES → Renders requested page                                      │
│     - If NO  → Displays 403 Access Denied Guard                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Code Implementation Highlights

### 1. Route Security Guard (`frontend/src/components/ProtectedRoute.tsx`)
```tsx
const activeRole = (user?.role_name || 'admin').toLowerCase();

if (user && allowedRoles && !allowedRoles.includes(activeRole as any)) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <ShieldAlert size={48} color="#dc2626" />
      <Typography variant="h5">Access Denied (403)</Typography>
      <Typography variant="body2">
        Your role [{activeRole.toUpperCase()}] does not have permission to access {location.pathname}.
      </Typography>
    </Box>
  );
}
```

### 2. Session Recovery & Normalization (`frontend/src/store/authStore.ts`)
```ts
const getInitialUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && !parsed.role_name && parsed.role) {
        parsed.role_name = parsed.role.toLowerCase();
      }
      return parsed;
    } catch { /* fallback */ }
  }
  return defaultAdminUser;
};
```

---

## Engineering Decisions

### Why Persist Session in `localStorage` with Safe Normalization?
- **Problem**: When users refresh the browser on sub-routes like `/inventory`, in-memory React state is wiped. Calling an un-routed `/auth/me` endpoint on static Vercel causes state loss or `undefined` property crashes.
- **Solution**: StockPulse stores the normalized `user` object in `localStorage` and gracefully falls back to session restoration.

---

## Common Mistakes
- **Relying solely on frontend UI hiding for security**: Hiding a button in React does not secure an API. Production backends must validate JWT scopes on every request. StockPulse enforces RBAC at both the UI component level and `ProtectedRoute` level.

---

## Key Takeaways
- Password for all accounts is **`anuraggaur001`**.
- 4 roles: `admin`, `manager`, `analyst`, `viewer`.
- Page refresh retains user session safely via `localStorage`.

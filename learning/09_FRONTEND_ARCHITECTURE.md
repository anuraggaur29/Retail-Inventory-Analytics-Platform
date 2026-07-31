# 💻 09: Frontend Architecture (React, Material UI & Zustand)

## 1. Objective
Understand the React 18 SPA architecture, Material UI v6 customization (`theme.ts`), Zustand state management (`authStore.ts`), and Axios request interceptors.

---

## 2. Big Picture
The frontend is a single-page application built with React, TypeScript, Material UI v6, and Recharts. It uses Zustand to manage authentication state globally without Redux boilerplate.

---

## 3. Implementation Details

### A. Material UI Theme (`src/theme/theme.ts`)
```typescript
export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#020617', paper: '#0f172a' },
    primary: { main: '#10b981' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  typography: { fontFamily: '"Inter", sans-serif' },
});
```

### B. Axios JWT Interceptor (`src/services/api.ts`)
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### C. Zustand State Store (`src/store/authStore.ts`)
```typescript
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
```

---

## 4. Key Takeaways
- MUI v6 provides accessible, responsive dashboard components.
- Axios automatically injects JWT bearer tokens.
- Proceed to [`10_DEPLOYMENT_GUIDE.md`](./10_DEPLOYMENT_GUIDE.md).

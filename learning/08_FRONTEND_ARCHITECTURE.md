# 08 FRONTEND ARCHITECTURE — React 18 & Material UI

## Objective
This document outlines the React 18 frontend architecture, Material UI (MUI 5) dark theme design system, Zustand global state management, Recharts data visualization, and Vercel static deployment optimizations.

---

## Big Picture
The StockPulse frontend is an enterprise-grade Single Page Application (SPA) designed to display fast, interactive analytics. It uses a dark-mode theme inspired by modern developer platforms, responsive MUI grid layouts, and zero-latency client state management.

---

## Frontend Architecture Blueprint

```
frontend/src/
├── main.tsx             # Entry point wrapping App in MUI ThemeProvider & CssBaseline
├── App.tsx              # Router setup with React Router v6 & ProtectedRoute guards
├── index.css            # Custom CSS scrollbars, fonts, and dark theme tokens
├── lib/
│   └── supabase.ts      # Supabase JavaScript client singleton
├── store/
│   └── authStore.ts     # Zustand store for user session & token persistence
├── components/
│   ├── Layout.tsx       # Sidebar navigation layout with dynamic RBAC filter
│   └── ProtectedRoute.tsx # 403 Access Denied guard component
└── pages/
    ├── LoginPage.tsx    # Auth view with clickable demo role presets
    ├── DashboardPage.tsx# Analytics dashboard with Recharts bar chart
    ├── ProductsPage.tsx # Paginated catalog table with ILIKE search & category filter
    ├── InventoryPage.tsx# Live inventory table & restock modal
    └── AdminPage.tsx    # RBAC audit matrix & user directory
```

---

## Key Technical Patterns

### 1. Centralized Theme System (`main.tsx`)
Configured with MUI's `createTheme` using slate dark-mode tokens (`#020617` background, `#0f172a` cards, `#10b981` emerald primary accents):

```tsx
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#020617', paper: '#0f172a' },
    primary: { main: '#10b981' }, // Emerald green
    secondary: { main: '#6366f1' }, // Indigo
  },
});
```

### 2. Optimized Chart Rendering (`DashboardPage.tsx`)
Recharts `ResponsiveContainer` dynamically fits the grid layout, rendering bar charts of category inventory value without layout shift:

```tsx
<ResponsiveContainer width="100%" height={260}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
    <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

---

## Engineering Decisions

### Why Material UI (MUI 5) over Tailwind CSS?
- **Decision**: MUI 5 with Emotion CSS-in-JS.
- **Reasoning**: Provides pre-built enterprise components (`TablePagination`, `Select`, `Dialog`, `Chip`, `Drawer`, `Paper`) out-of-the-box, ensuring consistent typography and accessibility without building primitive table components from scratch.

---

## Key Takeaways
- React 18 + Vite 5 + MUI 5 + Recharts + Zustand.
- Custom dark theme system built with `#020617` slate palette.

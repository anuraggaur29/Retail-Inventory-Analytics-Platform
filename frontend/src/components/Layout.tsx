import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  LayoutDashboard,
  Package,
  Boxes,
  LogOut,
  ShieldCheck,
  Activity,
  UserCheck,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const DRAWER_WIDTH = 250;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // RBAC Navigation items filtered by logged-in role
  const allNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'analyst', 'viewer'] },
    { label: 'Products', path: '/products', icon: Package, roles: ['admin', 'manager', 'analyst', 'viewer'] },
    { label: 'Inventory', path: '/inventory', icon: Boxes, roles: ['admin', 'manager', 'analyst'] },
    { label: 'System Admin', path: '/admin', icon: UserCheck, roles: ['admin'] },
  ];

  const currentRole = (user?.role_name || (user as any)?.role || 'admin').toLowerCase();

  const visibleNavItems = allNavItems.filter(item =>
    user ? item.roles.includes(currentRole) : true
  );

  const roleColorMap: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    admin: 'error',
    manager: 'warning',
    analyst: 'info',
    viewer: 'default',
  };

  const roleLabelMap: Record<string, string> = {
    admin: 'Admin (Full Control)',
    manager: 'Manager (Restock & Write)',
    analyst: 'Analyst (Read-Only)',
    viewer: 'Viewer (Restricted)',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* MUI AppBar (Header) */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          bgcolor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldCheck size={18} color="#10b981" />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              PostgreSQL Analytics Engine
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.5 }}>
              • v1.0.0
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {user && (
              <Chip
                label={roleLabelMap[user.role_name] || user.role_name}
                size="small"
                color={roleColorMap[user.role_name] || 'default'}
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              />
            )}
            <Chip
              label="Live DB"
              size="small"
              color="success"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                bgcolor: 'rgba(16, 185, 129, 0.08)',
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* MUI Permanent Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderColor: '#1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          {/* Logo Brand Header */}
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #1e293b' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'background.default',
                width: 40,
                height: 40,
                borderRadius: 2.5,
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)',
              }}
            >
              <Activity size={24} strokeWidth={2.5} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'text.primary', leading: 1.2 }}>
                StockPulse
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }}>
                Retail Inventory Analytics
              </Typography>
            </Box>
          </Box>

          {/* Navigation List */}
          <List sx={{ px: 1.5, py: 2 }}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      px: 2,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(16, 185, 129, 0.1)',
                        color: 'primary.main',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(16, 185, 129, 0.15)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(30, 41, 59, 0.6)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' }}>
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'primary.main' : 'text.secondary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* User Card & Logout */}
        <Box sx={{ p: 2, borderTop: '1px solid #1e293b', bgcolor: 'rgba(2, 6, 23, 0.4)' }}>
          {user && (
            <Box
              sx={{
                p: 1.8,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #1e293b',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name}
                </Typography>
                <Chip
                  label={currentRole}
                  size="small"
                  color={roleColorMap[currentRole] || 'default'}
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<LogOut size={16} />}
            sx={{
              borderColor: 'rgba(244, 63, 94, 0.2)',
              bgcolor: 'rgba(244, 63, 94, 0.05)',
              color: '#f43f5e',
              '&:hover': {
                borderColor: 'rgba(244, 63, 94, 0.4)',
                bgcolor: 'rgba(244, 63, 94, 0.1)',
              },
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>

      {/* Main Dynamic View */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          mt: 8,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

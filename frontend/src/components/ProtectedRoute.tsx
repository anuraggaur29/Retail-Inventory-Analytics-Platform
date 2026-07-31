import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { RoleName } from '../types';

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, fetchProfile, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading && !user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} color="inherit" />
          <Typography variant="body2">Validating session...</Typography>
        </Box>
      </Box>
    );
  }

  const activeRole = (user?.role_name || (user as any)?.role || 'admin').toLowerCase();

  // RBAC Permission Check
  if (user && allowedRoles && !allowedRoles.includes(activeRole as any)) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card elevation={0} sx={{ maxWidth: 480, width: '100%', border: '1px solid #dc2626', bgcolor: 'rgba(15, 23, 42, 0.9)' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'rgba(220, 38, 38, 0.1)', mb: 2 }}>
              <ShieldAlert size={48} color="#dc2626" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
              Access Denied (403)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Your current role <strong>[{activeRole.toUpperCase()}]</strong> does not have permission to access the requested route <code>{location.pathname}</code>.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 3 }}>
              Required roles for this module: {(allowedRoles || []).map(r => (r || '').toUpperCase()).join(', ')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/"
              startIcon={<ArrowLeft size={16} />}
              sx={{ fontWeight: 600 }}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
};

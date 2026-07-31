import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Paper,
} from '@mui/material';
import { Activity, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@stockpulse.io');
  const [password, setPassword] = useState('anuraggaur001');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const res = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = res.data.access_token;
      
      const profileRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      login(token, profileRes.data);
      navigate('/');
    } catch (err: any) {
      // Fallback for Vercel static demo mode if API is unreachable
      const demoAccount = demoAccounts.find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase() && (acc.pass === password || password === 'anuraggaur001')
      );

      if (demoAccount || password === 'anuraggaur001') {
        const targetAcc = demoAccount || demoAccounts[0];
        const mockToken = `demo_jwt_token_${targetAcc.role.toLowerCase()}`;
        const mockUser: User = {
          id: targetAcc.role === 'Admin' ? 1 : targetAcc.role === 'Manager' ? 2 : targetAcc.role === 'Analyst' ? 3 : 4,
          email: email,
          full_name: `${targetAcc.role} User`,
          role_name: targetAcc.role.toLowerCase() as any,
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        login(mockToken, mockUser);
        navigate('/');
      } else {
        setError(err.response?.data?.detail || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@stockpulse.io', pass: 'anuraggaur001', desc: 'Full System Control' },
    { role: 'Manager', email: 'manager@stockpulse.io', pass: 'anuraggaur001', desc: 'Restock & Write Access' },
    { role: 'Analyst', email: 'analyst@stockpulse.io', pass: 'anuraggaur001', desc: 'Analytics & Alert Reports' },
    { role: 'Viewer', email: 'viewer@stockpulse.io', pass: 'anuraggaur001', desc: 'Read-only Access' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -150,
          left: -150,
          width: 400,
          height: 400,
          bgcolor: 'rgba(16, 185, 129, 0.08)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />

      <Grid container spacing={4} sx={{ maxWidth: 960, zIndex: 1, alignItems: 'center' }}>
        {/* Left Side: Brand Information */}
        <Grid item xs={12} md={6}>
          <Box sx={{ pr: { md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: 'primary.main',
                  color: 'background.default',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px 0 rgba(16, 185, 129, 0.3)',
                }}
              >
                <Activity size={30} strokeWidth={2.5} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                  StockPulse
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Enterprise Retail Analytics
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
              Internal analytics and dark-store inventory control engine powered by PostgreSQL, FastAPI clean architecture, and JWT role-based access control.
            </Typography>

            {/* Quick Demo Accounts Selection */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid #1e293b',
                borderRadius: 3,
              }}
            >
              <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>
                Demo Accounts Preset (Click to test)
              </Typography>
              <Grid container spacing={1.5}>
                {demoAccounts.map((acc) => (
                  <Grid item xs={6} key={acc.email}>
                    <Paper
                      elevation={0}
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.pass);
                      }}
                      sx={{
                        p: 1.5,
                        bgcolor: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid #1e293b',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(30, 41, 59, 0.8)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>
                          {acc.role}
                        </Typography>
                        <ArrowRight size={12} color="#10b981" />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
                        {acc.desc}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </Grid>

        {/* Right Side: MUI Card Login Form */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ p: 1, borderRadius: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                Sign In to Platform
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Enter credentials to authenticate session
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Work Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    startAdornment: <Mail size={18} color="#64748b" style={{ marginRight: 10 }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    startAdornment: <KeyRound size={18} color="#64748b" style={{ marginRight: 10 }} />,
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ py: 1.5, mt: 1, fontSize: '0.9rem' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Authenticate Session'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import { ShieldCheck, UserCheck, Key, Lock, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();

  const usersList = [
    { id: 1, name: 'Admin User', email: 'admin@stockpulse.io', role: 'admin', lastLogin: 'Just now', status: 'Active' },
    { id: 2, name: 'Warehouse Manager', email: 'manager@stockpulse.io', role: 'manager', lastLogin: '10 mins ago', status: 'Active' },
    { id: 3, name: 'Data Analyst', email: 'analyst@stockpulse.io', role: 'analyst', lastLogin: '2 hours ago', status: 'Active' },
    { id: 4, name: 'Store Viewer', email: 'viewer@stockpulse.io', role: 'viewer', lastLogin: '1 day ago', status: 'Active' },
  ];

  const rolePermissions = [
    { role: 'Admin', dash: true, prod: true, invRead: true, invWrite: true, adminPage: true, desc: 'Full System & Security Management' },
    { role: 'Manager', dash: true, prod: true, invRead: true, invWrite: true, adminPage: false, desc: 'Inventory Restock & Catalog Management' },
    { role: 'Analyst', dash: true, prod: true, invRead: true, invWrite: false, adminPage: false, desc: 'Read-Only Reports & Trend Analysis' },
    { role: 'Viewer', dash: true, prod: true, invRead: false, invWrite: false, adminPage: false, desc: 'Basic Catalog & Executive Overview' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>
          System Administration & RBAC Audit
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Role-Based Access Control matrix and system user management
        </Typography>
      </Box>

      {/* RBAC Overview Matrix */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid #1e293b' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <ShieldCheck size={22} color="#10b981" />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
              Role-Based Access Control (RBAC) Matrix
            </Typography>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #1e293b' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Dashboard</TableCell>
                  <TableCell>Catalog</TableCell>
                  <TableCell>Inventory Read</TableCell>
                  <TableCell>Inventory Write (Restock)</TableCell>
                  <TableCell>Admin & Security</TableCell>
                  <TableCell>Scope Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rolePermissions.map((row) => (
                  <TableRow key={row.role} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                      <Chip
                        label={row.role}
                        size="small"
                        color={row.role === 'Admin' ? 'error' : row.role === 'Manager' ? 'warning' : row.role === 'Analyst' ? 'info' : 'default'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell>{row.dash ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</TableCell>
                    <TableCell>{row.prod ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</TableCell>
                    <TableCell>{row.invRead ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</TableCell>
                    <TableCell>{row.invWrite ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</TableCell>
                    <TableCell>{row.adminPage ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{row.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* System Users Table */}
      <Card elevation={0} sx={{ border: '1px solid #1e293b' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <UserCheck size={22} color="#6366f1" />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
              Registered System Accounts
            </Typography>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #1e293b' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Assigned Role</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Account Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersList.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{u.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role.toUpperCase()}
                        size="small"
                        color={u.role === 'admin' ? 'error' : u.role === 'manager' ? 'warning' : u.role === 'analyst' ? 'info' : 'default'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{u.lastLogin}</TableCell>
                    <TableCell>
                      <Chip label={u.status} size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

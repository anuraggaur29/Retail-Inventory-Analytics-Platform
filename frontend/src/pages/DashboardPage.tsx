import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Package,
  DollarSign,
  AlertTriangle,
  Percent,
  Layers,
  TrendingDown,
  RefreshCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics/dashboard');
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ spaceY: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} sm={6} md={3} key={n}>
              <Skeleton variant="rounded" height={130} sx={{ bgcolor: 'background.paper' }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={320} sx={{ bgcolor: 'background.paper', mb: 4 }} />
        <Skeleton variant="rounded" height={280} sx={{ bgcolor: 'background.paper' }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }
        sx={{ borderRadius: 3 }}
      >
        {error || 'No data available'}
      </Alert>
    );
  }

  const { kpis, top_categories, recent_price_changes } = data;

  const kpiCards = [
    {
      title: 'Total SKU Catalog',
      value: kpis.total_products.toLocaleString(),
      subtext: `${kpis.total_categories} Active Categories`,
      icon: Package,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
    },
    {
      title: 'Total Inventory Valuation',
      value: `₹${kpis.total_inventory_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtext: 'Current Stock Selling Value',
      icon: DollarSign,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Out of Stock Rate',
      value: `${kpis.out_of_stock_percentage}%`,
      subtext: `${kpis.low_stock_count} Low Stock SKUs`,
      icon: AlertTriangle,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Average Discount',
      value: `${Number(kpis.avg_discount_percentage).toFixed(2)}%`,
      subtext: 'Across All Products',
      icon: Percent,
      color: '#c084fc',
      bg: 'rgba(192, 132, 252, 0.1)',
    },
  ];

  return (
    <Box sx={{ spaceY: 4 }}>
      {/* Top Bar Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>
            Executive Analytics Overview
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Real-time inventory metrics calculated directly in PostgreSQL
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<RefreshCcw size={14} />}
          onClick={fetchDashboardData}
          sx={{ borderColor: '#1e293b', bgcolor: 'background.paper', color: 'text.secondary' }}
        >
          Refresh Analytics
        </Button>
      </Box>

      {/* MUI Grid KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card elevation={0}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {card.title}
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: card.bg, display: 'flex' }}>
                      <Icon size={20} color={card.color} />
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    {card.subtext}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Category Valuation Bar Chart */}
      <Card elevation={0} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Layers size={18} color="#10b981" />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
              Category Inventory Valuation Rank
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Query uses <code style={{ color: '#10b981', fontFamily: 'monospace' }}>RANK() OVER (ORDER BY SUM(qty * price) DESC)</code>
          </Typography>
        </Box>

        <Box sx={{ height: 280, width: '100%', pt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top_categories} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="category_name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#38bdf8', fontSize: '12px' }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Inventory Value']}
                labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
              />
              <Bar dataKey="total_inventory_value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      {/* Historical Price Change Audit Trail Table */}
      <Card elevation={0} sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingDown size={18} color="#c084fc" />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
              Historical Price Change Audit Trail
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Query uses <code style={{ color: '#c084fc', fontFamily: 'monospace' }}>LAG() OVER (PARTITION BY product_id ORDER BY changed_at)</code>
          </Typography>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #1e293b', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Previous Price</TableCell>
                <TableCell>New Selling Price</TableCell>
                <TableCell>Variance</TableCell>
                <TableCell>Change Reason</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent_price_changes.map((item) => {
                const diff = item.new_selling_price - item.previous_price;
                return (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{item.product_name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>₹{item.previous_price.toFixed(2)}</TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>₹{item.new_selling_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={diff > 0 ? `+₹${diff.toFixed(2)}` : `-₹${Math.abs(diff).toFixed(2)}`}
                        size="small"
                        color={diff <= 0 ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.change_reason || 'System Logged'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{new Date(item.changed_at).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

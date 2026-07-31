import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, CircularProgress,
} from '@mui/material';
import {
  Package, DollarSign, AlertTriangle, Percent, Layers, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { supabase } from '../lib/supabase';

// ─── Types for aggregated SQL results ───────────────────────────────────────
interface KPIs {
  totalProducts: number;
  totalCategories: number;
  totalInventoryValue: number;
  outOfStockCount: number;
  outOfStockPct: number;
  avgDiscount: number;
  lowStockCount: number;
}

interface CategoryStat {
  category: string;
  product_count: number;
  avg_discount: number;
  out_of_stock_count: number;
  total_value: number;
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
const KPICard: React.FC<{
  title: string; value: string; subtitle: string;
  icon: React.ReactNode; color: string;
}> = ({ title, value, subtitle, icon, color }) => (
  <Card elevation={0} sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
    </CardContent>
  </Card>
);

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // ── SQL: SELECT COUNT(*), AVG(discount_percent), SUM(selling_price * available_quantity) FROM products
      const [
        { count: totalProducts },
        { count: outOfStockCount },
        { count: lowStockCount },
        { count: totalCategories },
        { data: allProducts },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('out_of_stock', true),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('out_of_stock', false).lt('available_quantity', 5),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('selling_price, available_quantity, discount_percent'),
      ]);

      // Compute aggregates from fetched data (mirrors SQL GROUP BY / AVG / SUM)
      const products = allProducts ?? [];
      const totalValue = products.reduce((sum, p) => sum + (Number(p.selling_price) * p.available_quantity), 0);
      const avgDisc = products.length ? products.reduce((sum, p) => sum + p.discount_percent, 0) / products.length : 0;

      setKpis({
        totalProducts: totalProducts ?? 0,
        totalCategories: totalCategories ?? 0,
        totalInventoryValue: totalValue,
        outOfStockCount: outOfStockCount ?? 0,
        outOfStockPct: totalProducts ? ((outOfStockCount ?? 0) / totalProducts) * 100 : 0,
        avgDiscount: parseFloat(avgDisc.toFixed(1)),
        lowStockCount: lowStockCount ?? 0,
      });

      // ── SQL: SELECT category, COUNT(*), AVG(discount_percent), SUM(selling_price*available_quantity)
      //         FROM products GROUP BY category ORDER BY total_value DESC
      const { data: catRaw } = await supabase
        .from('products')
        .select('category, selling_price, available_quantity, discount_percent, out_of_stock');

      if (catRaw) {
        const grouped: Record<string, CategoryStat> = {};
        catRaw.forEach(p => {
          if (!grouped[p.category]) {
            grouped[p.category] = { category: p.category, product_count: 0, avg_discount: 0, out_of_stock_count: 0, total_value: 0 };
          }
          grouped[p.category].product_count++;
          grouped[p.category].avg_discount += p.discount_percent;
          grouped[p.category].total_value += Number(p.selling_price) * p.available_quantity;
          if (p.out_of_stock) grouped[p.category].out_of_stock_count++;
        });
        const stats = Object.values(grouped).map(s => ({
          ...s,
          avg_discount: parseFloat((s.avg_discount / s.product_count).toFixed(1)),
          total_value: parseFloat(s.total_value.toFixed(2)),
        })).sort((a, b) => b.total_value - a.total_value);
        setCategoryStats(stats);
      }

      // ── SQL: SELECT * FROM products WHERE out_of_stock = true ORDER BY name LIMIT 8
      const { data: oos } = await supabase
        .from('products')
        .select('id, name, category, selling_price, available_quantity')
        .eq('out_of_stock', true)
        .order('name')
        .limit(8);
      setOutOfStockItems(oos ?? []);

      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
        <CircularProgress size={32} />
        <Typography color="text.secondary">Running SQL queries on Supabase…</Typography>
      </Box>
    );
  }

  const fmt = (n: number) => n.toLocaleString('en-IN');
  const fmtCr = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${fmt(Math.round(n))}`;

  // Bar chart — top 8 categories by inventory value
  const chartData = categoryStats.slice(0, 8).map(c => ({
    name: c.category.length > 14 ? c.category.substring(0, 14) + '…' : c.category,
    value: Math.round(c.total_value),
    discount: c.avg_discount,
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Executive Dashboard
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Real-time analytics — {kpis?.totalProducts.toLocaleString()} products from Supabase PostgreSQL
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KPICard title="Total SKUs" value={fmt(kpis?.totalProducts ?? 0)}
            subtitle="Unique products" icon={<Package size={20} />} color="#6366f1" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KPICard title="Categories" value={String(kpis?.totalCategories ?? 0)}
            subtitle="Product segments" icon={<Layers size={20} />} color="#06b6d4" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KPICard title="Inventory Value" value={fmtCr(kpis?.totalInventoryValue ?? 0)}
            subtitle="Total stock value" icon={<DollarSign size={20} />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KPICard title="Out of Stock" value={fmt(kpis?.outOfStockCount ?? 0)}
            subtitle={`${kpis?.outOfStockPct.toFixed(1)}% of catalog`}
            icon={<AlertTriangle size={20} />} color="#ef4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KPICard title="Low Stock" value={fmt(kpis?.lowStockCount ?? 0)}
            subtitle="< 5 units remaining" icon={<TrendingDown size={20} />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KPICard title="Avg Discount" value={`${kpis?.avgDiscount}%`}
            subtitle="Across all products" icon={<Percent size={20} />} color="#8b5cf6" />
        </Grid>
      </Grid>

      {/* Bar Chart — Inventory Value by Category */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Inventory Value by Category
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                SQL: SELECT category, SUM(selling_price * available_quantity) FROM products GROUP BY category ORDER BY 2 DESC
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }}
                    angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : `₹${v}`} />
                  <RechartsTooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Inventory Value']}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Avg Discount by Category */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Avg Discount by Category
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                SQL: SELECT category, AVG(discount_percent) GROUP BY category
              </Typography>
              <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                {categoryStats.map((cat) => (
                  <Box key={cat.category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px solid #1e293b' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>
                      {cat.category}
                    </Typography>
                    <Chip label={`${cat.avg_discount}% OFF`} size="small" color="success"
                      variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Out of Stock Products Table */}
      <Card elevation={0}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Out of Stock Alert — Products Needing Immediate Restock
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            SQL: SELECT * FROM products WHERE out_of_stock = true ORDER BY name LIMIT 8
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Selling Price</TableCell>
                  <TableCell>Available Qty</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outOfStockItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{item.category}</TableCell>
                    <TableCell>₹{Number(item.selling_price).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{item.available_quantity}</TableCell>
                    <TableCell>
                      <Chip label="OUT OF STOCK" size="small" color="error"
                        variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
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

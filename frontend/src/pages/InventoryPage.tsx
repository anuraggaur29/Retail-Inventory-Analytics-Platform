import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Alert, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar,
  Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress,
} from '@mui/material';
import { AlertTriangle, Boxes, Plus } from 'lucide-react';
import { supabase, DBProduct } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const InventoryPage: React.FC = () => {
  const { user } = useAuthStore();

  const [inventory, setInventory] = useState<DBProduct[]>([]);
  const [lowStockItems, setLowStockItems] = useState<DBProduct[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<DBProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [restockProduct, setRestockProduct] = useState<DBProduct | null>(null);
  const [restockQty, setRestockQty] = useState(50);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // SQL: SELECT * FROM products WHERE out_of_stock = true (for alerts panel)
  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('out_of_stock', true)
      .order('name')
      .limit(10)
      .then(({ data }) => setOutOfStockItems(data ?? []));

    // SQL: SELECT * FROM products WHERE available_quantity < 5 AND out_of_stock = false
    supabase
      .from('products')
      .select('*')
      .eq('out_of_stock', false)
      .lt('available_quantity', 5)
      .order('available_quantity')
      .limit(10)
      .then(({ data }) => setLowStockItems(data ?? []));
  }, []);

  // SQL: SELECT * FROM products [WHERE out_of_stock = ?] ORDER BY id LIMIT ? OFFSET ?
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (statusFilter === 'out') query = query.eq('out_of_stock', true);
      else if (statusFilter === 'low') query = query.eq('out_of_stock', false).lt('available_quantity', 5);
      else if (statusFilter === 'in') query = query.eq('out_of_stock', false).gte('available_quantity', 5);

      const { data, count } = await query
        .order('id')
        .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);

      setInventory(data ?? []);
      setTotalCount(count ?? 0);
      setLoading(false);
    };
    fetchInventory();
  }, [statusFilter, page, rowsPerPage]);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    const newQty = restockProduct.available_quantity + restockQty;

    // SQL: UPDATE products SET available_quantity = ?, out_of_stock = false WHERE id = ?
    const { error } = await supabase
      .from('products')
      .update({ available_quantity: newQty, out_of_stock: false })
      .eq('id', restockProduct.id);

    if (!error) {
      setSnackbarMsg(`✅ Restocked "${restockProduct.name}" with ${restockQty} units`);
      setRestockProduct(null);
      // Refresh
      setPage(p => p); // trigger re-fetch
    }
  };

  const getStockStatus = (item: DBProduct) => {
    if (item.out_of_stock || item.available_quantity === 0) return { label: 'OUT OF STOCK', color: 'error' as const };
    if (item.available_quantity < 5) return { label: 'LOW STOCK', color: 'warning' as const };
    if (item.available_quantity > 100) return { label: 'OVERSTOCKED', color: 'info' as const };
    return { label: 'NORMAL', color: 'success' as const };
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>
          Inventory Management
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Live data from Supabase PostgreSQL — {totalCount.toLocaleString()} SKUs tracked
        </Typography>
      </Box>

      {/* Stock Alert Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card elevation={0} sx={{ p: 2, border: '1px solid #dc2626', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AlertTriangle size={18} color="#dc2626" />
              <Typography variant="subtitle2" sx={{ color: '#dc2626', fontWeight: 700 }}>
                Out of Stock ({outOfStockItems.length}+)
              </Typography>
            </Box>
            {outOfStockItems.slice(0, 4).map(item => (
              <Typography key={item.id} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                • {item.name} — {item.category}
              </Typography>
            ))}
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card elevation={0} sx={{ p: 2, border: '1px solid #f59e0b', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AlertTriangle size={18} color="#f59e0b" />
              <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                Low Stock &lt;5 units ({lowStockItems.length}+)
              </Typography>
            </Box>
            {lowStockItems.slice(0, 4).map(item => (
              <Typography key={item.id} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                • {item.name} — {item.available_quantity} left
              </Typography>
            ))}
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Card elevation={0} sx={{ p: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Stock Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Stock Status Filter"
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <MenuItem value="">All Products</MenuItem>
            <MenuItem value="in">In Stock (≥5 units)</MenuItem>
            <MenuItem value="low">Low Stock (&lt;5 units)</MenuItem>
            <MenuItem value="out">Out of Stock</MenuItem>
          </Select>
        </FormControl>
      </Card>

      {/* Inventory Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #1e293b', borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Available Qty</TableCell>
              <TableCell>Inventory Value</TableCell>
              <TableCell>Status</TableCell>
              {user?.role_name !== 'analyst' && user?.role_name !== 'viewer' && (
                <TableCell>Action</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => {
                const status = getStockStatus(item);
                const value = (Number(item.selling_price) * item.available_quantity).toFixed(2);
                return (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                      {item.sku}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>{item.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{item.category}</TableCell>
                    <TableCell>₹{Number(item.selling_price).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {item.available_quantity}
                    </TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                      ₹{Number(value).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip label={status.label} size="small" color={status.color}
                        variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </TableCell>
                    {user?.role_name !== 'analyst' && user?.role_name !== 'viewer' && (
                      <TableCell>
                        <Button size="small" variant="outlined" startIcon={<Plus size={12} />}
                          onClick={() => { setRestockProduct(item); setRestockQty(50); }}
                          sx={{ fontSize: '0.7rem', py: 0.3 }}>
                          Restock
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ borderTop: '1px solid #1e293b' }}
        />
      </TableContainer>

      {/* Restock Dialog */}
      <Dialog open={!!restockProduct} onClose={() => setRestockProduct(null)}>
        <DialogTitle>Restock: {restockProduct?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Current stock: <strong>{restockProduct?.available_quantity} units</strong>
          </Typography>
          <Box component="form" onSubmit={handleRestock}>
            <TextField
              fullWidth label="Units to Add" type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(parseInt(e.target.value, 10))}
              inputProps={{ min: 1, max: 10000 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestockProduct(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleRestock}>
            Add {restockQty} Units
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbarMsg} autoHideDuration={4000}
        onClose={() => setSnackbarMsg('')} message={snackbarMsg} />
    </Box>
  );
};

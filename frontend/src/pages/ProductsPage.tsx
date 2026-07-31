import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, TextField, FormControl, InputLabel, Select,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination, Chip, InputAdornment, Grid,
  Card, CircularProgress, Alert,
} from '@mui/material';
import { Search } from 'lucide-react';
import { supabase, DBProduct, DBCategory } from '../lib/supabase';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Load categories once
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setCategories(data);
      });
  }, []);

  // Load products whenever filters/page change — real SQL query via Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      // Build Supabase query (translates to SQL WHERE / ILIKE / ORDER BY / LIMIT / OFFSET)
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (search.trim()) {
        // SQL: WHERE name ILIKE '%search%' OR sku ILIKE '%search%'
        query = query.or(`name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`);
      }
      if (selectedCategoryId !== '') {
        // SQL: WHERE category_id = ?
        query = query.eq('category_id', selectedCategoryId);
      }
      if (stockFilter === 'in') {
        // SQL: WHERE out_of_stock = false
        query = query.eq('out_of_stock', false);
      } else if (stockFilter === 'out') {
        // SQL: WHERE out_of_stock = true
        query = query.eq('out_of_stock', true);
      }

      // SQL: ORDER BY id LIMIT rowsPerPage OFFSET page*rowsPerPage
      query = query
        .order('id')
        .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);

      const { data, error: err, count } = await query;

      if (err) {
        setError(err.message);
      } else {
        setProducts(data ?? []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [search, selectedCategoryId, stockFilter, page, rowsPerPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>
          Product Catalog
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {loading ? 'Loading…' : `${totalCount.toLocaleString()} products in Supabase PostgreSQL`}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card elevation={0} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth size="small"
                placeholder="Search product name or SKU… (press Enter)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#64748b" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategoryId}
                label="Category"
                onChange={(e) => { setSelectedCategoryId(e.target.value as number | ''); setPage(0); }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.product_count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={stockFilter}
                label="Stock Status"
                onChange={(e) => { setStockFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">All Availability</MenuItem>
                <MenuItem value="in">In Stock Only</MenuItem>
                <MenuItem value="out">Out of Stock Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #1e293b', borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>MRP</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No products matched your filters
                </TableCell>
              </TableRow>
            ) : (
              products.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
                    {item.sku}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', maxWidth: 220 }}>
                    {item.name}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    {item.category}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                    ₹{Number(item.mrp).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: 'success.main', fontWeight: 700, fontSize: '0.85rem' }}>
                    {item.discount_percent}% OFF
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                    ₹{Number(item.selling_price).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    {item.weight_gms}g
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {item.available_quantity} units
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.out_of_stock ? 'OUT OF STOCK' : 'IN STOCK'}
                      size="small"
                      color={item.out_of_stock ? 'error' : 'success'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ borderTop: '1px solid #1e293b' }}
        />
      </TableContainer>
    </Box>
  );
};

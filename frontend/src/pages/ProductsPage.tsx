import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Skeleton,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Search } from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, PaginatedMeta } from '../types';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, page_size: 20, total_pages: 1 });
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState<string>('all');
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page: page + 1, page_size: rowsPerPage };
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;
      if (inStockOnly === 'true') params.in_stock = true;
      if (inStockOnly === 'false') params.in_stock = false;

      const res = await api.get('/products', { params });
      setProducts(res.data.data);
      setMeta(res.data.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, selectedCategory, inStockOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  return (
    <Box sx={{ spaceY: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>
          Product Catalog Search
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Search and filter across {meta.total.toLocaleString()} catalog SKUs
        </Typography>
      </Box>

      {/* MUI Filter Controls Grid */}
      <Card elevation={0} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                value={selectedCategory}
                label="Category"
                onChange={(e) => {
                  setSelectedCategory(e.target.value as number | '');
                  setPage(0);
                }}
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
                value={inStockOnly}
                label="Stock Status"
                onChange={(e) => {
                  setInStockOnly(e.target.value as string);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Availability</MenuItem>
                <MenuItem value="true">In Stock Only</MenuItem>
                <MenuItem value="false">Out of Stock Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* MUI Table Container */}
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
              <TableCell>Available Stock</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <TableRow key={n}>
                  <TableCell colSpan={8}>
                    <Skeleton variant="text" height={30} />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No products matched search & filter criteria
                </TableCell>
              </TableRow>
            ) : (
              products.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
                    {item.sku}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{item.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{item.category_name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                    ₹{item.mrp.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {item.discount_percent}% OFF
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                    ₹{item.selling_price.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                    {item.available_quantity} units
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.is_out_of_stock ? 'OUT OF STOCK' : 'IN STOCK'}
                      size="small"
                      color={item.is_out_of_stock ? 'error' : 'success'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* MUI TablePagination */}
        <TablePagination
          component="div"
          count={meta.total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ borderTop: '1px solid #1e293b' }}
        />
      </TableContainer>
    </Box>
  );
};

export interface User {
  id: number;
  email: string;
  full_name: string;
  role_name: 'admin' | 'manager' | 'analyst' | 'viewer';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export type RoleName = User['role_name'];

export interface Product {
  id: number;
  sku: string;
  name: string;
  category_name: string;
  mrp: number;
  discount_percent: number;
  selling_price: number;
  weight_gms: number | null;
  quantity_desc: string | null;
  available_quantity: number;
  is_out_of_stock: boolean;
}

export interface ProductDetail extends Product {
  category_id: number;
  mrp_paise: number;
  is_active: boolean;
  created_at: string;
  reorder_level: number;
  last_restocked_at: string | null;
  price_history: Array<{
    old_selling_price: number | null;
    new_selling_price: number;
    old_discount_percent: number | null;
    new_discount_percent: number;
    change_reason: string | null;
    changed_at: string;
  }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

export interface InventoryItem {
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string;
  available_quantity: number;
  reorder_level: number;
  is_out_of_stock: boolean;
  stock_status: 'Critical' | 'Low' | 'Normal' | 'Overstocked';
  selling_price: number;
  inventory_value: number;
  last_restocked_at: string | null;
}

export interface StockAlert {
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string;
  available_quantity: number;
  reorder_level: number;
  alert_type: 'OUT_OF_STOCK' | 'LOW_STOCK';
  selling_price: number;
}

export interface DashboardKPIs {
  total_products: number;
  total_inventory_value: number;
  out_of_stock_percentage: number;
  avg_discount_percentage: number;
  total_categories: number;
  low_stock_count: number;
}

export interface CategoryAnalyticsItem {
  category_id: number;
  category_name: string;
  product_count: number;
  total_inventory_value: number;
  avg_mrp: number;
  avg_discount: number;
  out_of_stock_count: number;
  rank_by_value: number;
}

export interface PriceChangeItem {
  id: number;
  product_id: number;
  product_name: string;
  new_selling_price: number;
  previous_price: number;
  changed_at: string;
  change_reason: string;
}

export interface DashboardSummary {
  kpis: DashboardKPIs;
  top_categories: CategoryAnalyticsItem[];
  recent_price_changes: PriceChangeItem[];
}

export interface PaginatedMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginatedMeta;
}

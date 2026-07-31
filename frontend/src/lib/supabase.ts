import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Type helpers matching our DB schema ───────────────────────────────────────

export interface DBProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  category_id: number;
  mrp: number;
  discount_percent: number;
  selling_price: number;
  weight_gms: number;
  available_quantity: number;
  out_of_stock: boolean;
  quantity_desc: string;
}

export interface DBCategory {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

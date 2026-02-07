export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  url?: string;
  logo?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  external_id: string;
  store_id: string;
  name: string;
  description?: string;
  category_id?: string;
  brand?: string;
  url: string;
  image?: string;
  sku?: string;
  ean?: string;
  active: boolean;
  last_price_update?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductWithDetails extends Product {
  category?: Category;
  store?: Store;
  price?: Price;
  lowest_price?: number;
  category_name?: string;
  store_name?: string;
  current_price?: number;
  old_price?: number;
  discount_percent?: number;
  last_price_update?: string;
}

export interface Price {
  id: string;
  product_id: string;
  current_price: number;
  old_price?: number;
  discount_percent?: number;
  available: boolean;
  currency: string;
  recorded_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: ProductWithDetails;
}

export interface Alert {
  id: string;
  user_id: string;
  product_id: string;
  alert_type: 'price_below' | 'new_minimum' | 'on_promotion';
  price_threshold?: number;
  active: boolean;
  last_triggered?: string;
  created_at: string;
  updated_at: string;
  product?: ProductWithDetails;
}

export interface Notification {
  id: string;
  user_id: string;
  alert_id?: string;
  type: 'email' | 'push';
  title: string;
  message: string;
  data?: Record<string, any>;
  sent: boolean;
  sent_at?: string;
  created_at: string;
  read: boolean;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  store?: string;
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  on_promotion?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'discount_desc' | 'name_asc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: ProductWithDetails[];
  total: number;
  page: number;
  limit: number;
  filters: SearchFilters;
}

export interface ComparisonData {
  product1: ProductWithDetails;
  product2: ProductWithDetails;
  differences: AttributeComparison[];
}

export interface AttributeComparison {
  attribute: {
    id: string;
    name: string;
    type: string;
    unit?: string;
  };
  value1?: string;
  value2?: string;
  different: boolean;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  current_price: number;
  old_price?: number;
  discount_percent?: number;
  recorded_at: string;
  previous_price?: number;
}

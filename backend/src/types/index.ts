export interface User {
  id: string;
  email: string;
  name?: string;
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
  api_config?: Record<string, any>;
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
  current_price?: Price;
  lowest_price?: number;
  attributes?: ProductAttribute[];
}

export interface Attribute {
  id: string;
  category_id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  unit?: string;
  options?: string[];
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  attribute_id: string;
  value?: string;
  source?: string;
  confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface Price {
  id: string;
  product_id: string;
  current_price: number;
  old_price?: number;
  discount_percent?: number;
  available: boolean;
  currency: string;
  payment_options?: Record<string, any>;
  recorded_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
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
}

export interface SpecFetchJob {
  id: string;
  product_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
  last_attempt?: string;
  error_message?: string;
  result?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SearchLog {
  id: string;
  user_id?: string;
  query: string;
  filters?: Record<string, any>;
  results_count?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Tipos para API
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
  attribute: Attribute;
  value1?: string;
  value2?: string;
  different: boolean;
}

// Tipos para adapters de API
export interface ExternalProduct {
  external_id: string;
  name: string;
  description?: string;
  brand?: string;
  url: string;
  image?: string;
  sku?: string;
  ean?: string;
  price: number;
  old_price?: number;
  discount_percent?: number;
  available: boolean;
  category?: string;
  attributes?: Record<string, any>;
}

export interface APIAdapter {
  name: string;
  storeId: string;
  searchProducts(query: string, filters?: SearchFilters): Promise<ExternalProduct[]>;
  getProductDetails(externalId: string): Promise<ExternalProduct | null>;
  normalizeProduct(product: ExternalProduct): Promise<Product>;
}

// Tipos para notificações
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

// Tipos para JWT
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Tipos para erros
export interface APIError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Tipos para cache
export interface CacheOptions {
  ttl?: number;
  key: string;
}

// Tipos para jobs
export interface JobConfig {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled: boolean;
}

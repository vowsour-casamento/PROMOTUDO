import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

let supabase: SupabaseClient;

export async function connectDatabase(): Promise<SupabaseClient> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Testar conexão
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    logger.info('Database connection established');
    return supabase;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDatabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return supabase;
}

// Helper functions para operações comuns
export const db = {
  // Users
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Products
  async getProducts(filters: any = {}) {
    let query = supabase
      .from('product_summary')
      .select('*');

    if (filters.category) {
      query = query.eq('category_name', filters.category);
    }
    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.store) {
      query = query.eq('store_name', filters.store);
    }
    if (filters.min_price) {
      query = query.gte('current_price', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('current_price', filters.max_price);
    }
    if (filters.min_discount) {
      query = query.gte('discount_percent', filters.min_discount);
    }
    if (filters.on_promotion) {
      query = query.gt('discount_percent', 0);
    }

    // Ordenação
    switch (filters.sort_by) {
      case 'price_asc':
        query = query.order('current_price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('current_price', { ascending: false });
        break;
      case 'discount_desc':
        query = query.order('discount_percent', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('last_price_update', { ascending: false });
    }

    // Paginação
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getProductById(productId: string) {
    const { data, error } = await supabase
      .from('product_summary')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProductAttributes(productId: string) {
    const { data, error } = await supabase
      .from('product_attributes')
      .select(`
        *,
        attribute:attributes(*)
      `)
      .eq('product_id', productId);
    
    if (error) throw error;
    return data;
  },

  async getPriceHistory(productId: string, limit = 30) {
    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .eq('product_id', productId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Favorites
  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        product:product_summary(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addFavorite(userId: string, productId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id: productId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeFavorite(userId: string, productId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (error) throw error;
  },

  // Alerts
  async getAlerts(userId: string) {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        product:product_summary(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createAlert(alertData: any) {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alertData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAlert(alertId: string, updates: any) {
    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAlert(alertId: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId);
    
    if (error) throw error;
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getCategoryAttributes(categoryId: string) {
    const { data, error } = await supabase
      .from('attributes')
      .select('*')
      .eq('category_id', categoryId)
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Search logs
  async logSearch(searchData: any) {
    const { data, error } = await supabase
      .from('search_logs')
      .insert(searchData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

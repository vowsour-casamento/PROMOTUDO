import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  Heart,
  ExternalLink,
  TrendingDown,
  Tag
} from 'lucide-react';

import { ProductWithDetails, SearchFilters } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilters as SearchFiltersComponent } from '@/components/SearchFilters';

export const SearchPage: React.FC = () => {
  const { token } = useAuthStore();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: searchResult, isLoading, refetch } = useQuery(
    ['search', query, filters],
    async () => {
      if (!query.trim() && !Object.keys(filters).length) return null;

      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters.category) params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.store) params.append('store', filters.store);
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.min_discount) params.append('min_discount', filters.min_discount.toString());
      if (filters.on_promotion) params.append('on_promotion', 'true');
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      return response.json();
    },
    {
      enabled: searchTriggered,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchTriggered(true);
    setFilters({ ...filters, page: 1 });
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters({ ...newFilters, page: 1 });
    setSearchTriggered(true);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    setSearchTriggered(true);
  };

  const addToFavorites = async (productId: string) => {
    if (!token) return;

    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos (ex: celular, microondas, geladeira)..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {Object.keys(filters).filter(key => filters[key as keyof SearchFilters]).length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    {Object.keys(filters).filter(key => filters[key as keyof SearchFilters]).length}
                  </span>
                )}
              </Button>
              
              <Button type="submit" loading={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {Object.keys(filters).filter(key => filters[key as keyof SearchFilters]).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  Categoria: {filters.category}
                  <button
                    onClick={() => handleFilterChange({ ...filters, category: undefined })}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.brand && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  Marca: {filters.brand}
                  <button
                    onClick={() => handleFilterChange({ ...filters, brand: undefined })}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.on_promotion && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                  Em promoção
                  <button
                    onClick={() => handleFilterChange({ ...filters, on_promotion: false })}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t"
          >
            <SearchFiltersComponent
              filters={filters}
              onChange={handleFilterChange}
            />
          </motion.div>
        )}
      </div>

      {/* Results */}
      {searchResult && (
        <div>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resultados da busca
              </h1>
              <p className="text-gray-600 mt-1">
                {searchResult.total} produto{searchResult.total !== 1 ? 's' : ''} encontrado{searchResult.total !== 1 ? 's' : ''}
                {query && ` para "${query}"`}
              </p>
            </div>
            
            {searchResult.total > 0 && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  Ordenar por:
                  <select
                    value={filters.sort_by || 'price_asc'}
                    onChange={(e) => handleFilterChange({ 
                      ...filters, 
                      sort_by: e.target.value as SearchFilters['sort_by'] 
                    })}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                    <option value="discount_desc">Maior desconto</option>
                    <option value="name_asc">Nome A-Z</option>
                  </select>
                </label>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {searchResult.products.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {searchResult.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToFavorites={() => addToFavorites(product.id)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600">
                Tente usar termos diferentes ou ajustar os filtros
              </p>
            </div>
          )}

          {/* Pagination */}
          {searchResult.total > searchResult.limit && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={!filters.page || filters.page <= 1}
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                >
                  Anterior
                </Button>
                
                <span className="px-4 py-2 text-sm text-gray-600">
                  Página {filters.page || 1} de {Math.ceil(searchResult.total / searchResult.limit)}
                </span>
                
                <Button
                  variant="outline"
                  disabled={!filters.page || filters.page >= Math.ceil(searchResult.total / searchResult.limit)}
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

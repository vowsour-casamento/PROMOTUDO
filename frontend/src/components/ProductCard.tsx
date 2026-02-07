import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, TrendingDown, Store, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { ProductWithDetails } from '@/types';
import { Button } from '@/components/Button';

interface ProductCardProps {
  product: ProductWithDetails;
  onAddToFavorites: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToFavorites,
  className = ''
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getDiscountBadge = () => {
    if (!product.discount_percent || product.discount_percent <= 0) return null;
    
    return (
      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
        -{product.discount_percent.toFixed(0)}%
      </div>
    );
  };

  const getLowestPriceBadge = () => {
    if (!product.lowest_price || product.current_price === product.lowest_price) return null;
    
    const isLowest = product.current_price <= product.lowest_price * 1.05; // Within 5% of lowest
    
    if (isLowest) {
      return (
        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center">
          <TrendingDown className="w-3 h-3 mr-1" />
          Menor preço
        </div>
      );
    }
    
    return (
      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
        Menor: {formatPrice(product.lowest_price)}
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm">Sem imagem</p>
            </div>
          </div>
        )}
        
        {getDiscountBadge()}
        {getLowestPriceBadge()}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Store and Category */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-xs text-gray-500">
            <Store className="w-3 h-3 mr-1" />
            {product.store_name}
          </div>
          {product.category_name && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(product.current_price || 0)}
              </div>
              {product.old_price && product.old_price > product.current_price && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.old_price)}
                </div>
              )}
            </div>
            
            {product.last_price_update && (
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(product.last_price_update), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(product.url, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver na loja
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddToFavorites}
            title="Adicionar aos favoritos"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

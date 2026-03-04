import { Heart, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onProductClick: (product: Product) => void;
  showActions?: boolean;
}

export function ProductCard({ product, onAddToCart, onBuyNow, onProductClick, showActions = true }: ProductCardProps) {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer">
      <div className="relative overflow-hidden" onClick={() => onProductClick(product)}>
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">Hết hàng</span>
          </div>
        )}
        {!isOutOfStock && discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
        {!isOutOfStock && (
          <button className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
        <h3 
          className="font-semibold text-gray-900 mb-2 hover:text-amber-600 transition-colors"
          onClick={() => onProductClick(product)}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-bold text-amber-600">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {product.originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-3">
          {isOutOfStock ? (
            <span className="text-red-600 font-semibold">Hết hàng</span>
          ) : (
            <span>Còn {product.stock} sản phẩm</span>
          )}
        </p>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={isOutOfStock}
              className={`flex-1 border-2 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                isOutOfStock 
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-amber-600 text-amber-600 hover:bg-amber-50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(product);
              }}
              disabled={isOutOfStock}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              Mua ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
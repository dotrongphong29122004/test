import { useState } from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Product, ProductCard } from './ProductCard';

interface ProductsPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function ProductsPage({ products, onAddToCart, onBuyNow, onProductClick }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under5' | '5to10' | '10to15' | 'over15'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'Phòng khách', name: 'Phòng khách' },
    { id: 'Phòng ngủ', name: 'Phòng ngủ' },
    { id: 'Phòng ăn', name: 'Phòng ăn' },
    { id: 'Phòng làm việc', name: 'Phòng làm việc' },
  ];

  // Filter products
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange === 'under5') matchesPrice = product.price < 5000000;
    else if (priceRange === '5to10') matchesPrice = product.price >= 5000000 && product.price < 10000000;
    else if (priceRange === '10to15') matchesPrice = product.price >= 10000000 && product.price < 15000000;
    else if (priceRange === 'over15') matchesPrice = product.price >= 15000000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  if (sortBy === 'price-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tất Cả Sản Phẩm</h1>
          <p className="text-gray-600">Khám phá bộ sưu tập đồ nội thất của chúng tôi</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none"
            >
              <option value="default">Sắp xếp mặc định</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name">Tên: A-Z</option>
            </select>

            {/* Toggle Filters Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Filter className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-gray-900">Bộ Lọc</h2>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Danh Mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-600"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-amber-600 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Khoảng Giá</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      value="all"
                      checked={priceRange === 'all'}
                      onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-amber-600 transition-colors">
                      Tất cả
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      value="under5"
                      checked={priceRange === 'under5'}
                      onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-amber-600 transition-colors">
                      Dưới 5 triệu
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      value="5to10"
                      checked={priceRange === '5to10'}
                      onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-amber-600 transition-colors">
                      5 - 10 triệu
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      value="10to15"
                      checked={priceRange === '10to15'}
                      onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-amber-600 transition-colors">
                      10 - 15 triệu
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      value="over15"
                      checked={priceRange === 'over15'}
                      onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-amber-600 transition-colors">
                      Trên 15 triệu
                    </span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange('all');
                  setSearchQuery('');
                  setSortBy('default');
                }}
                className="w-full py-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onProductClick={onProductClick}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
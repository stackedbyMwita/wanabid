'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import { Funnel } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.condition) params.condition = filters.condition;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      if (filters.search) params.search = filters.search;

      const data = await productsAPI.getAll(params);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    loadProducts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      search: '',
    });
    setTimeout(() => loadProducts(), 100);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 text-gray-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Browse Products
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>
              <Funnel />
            </span>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFilters(false)}
          />
          
          Filter Drawer
          <div className="fixed inset-x-0 top-0 m-8 max-w-4xl mx-auto bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className=" w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className=" w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">📱 Electronics</option>
                  <option value="Books">📚 Books</option>
                  <option value="Fashion">👕 Fashion</option>
                  <option value="Furniture">🪑 Furniture</option>
                  <option value="Sports">⚽ Sports</option>
                  <option value="Other">🎁 Other</option>
                </select>
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className=" w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (KES)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  onClick={applyFilters}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="text-gray-900 px-4 py-3 flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center gap-1 text-gray-900 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {filters.category}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
          {filters.condition && (
            <span className="inline-flex items-center gap-1 text-gray-900 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {filters.condition}
              <button
                onClick={() => handleFilterChange('condition', '')}
                className="hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 text-gray-900 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="text-gray-900 px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 text-center mb-4">
              Try adjusting your filters or search terms
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
              <select className="text-sm border border-gray-300 rounded-lg text-gray-900 px-3 py-1">
                <option>Sort by: Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Ending Soon</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
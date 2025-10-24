'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, formatTimeRemaining, getConditionColor, getStatusColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  DollarSign,
  Tag,
  User,
  TrendingUp,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type ProductStatus = 'all' | 'active' | 'sold' | 'expired' | 'cancelled';
type ProductCategory = 'all' | 'Electronics' | 'Books' | 'Fashion' | 'Furniture' | 'Sports' | 'Other';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

    // Category filter
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stats
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    sold: products.filter((p) => p.status === 'sold').length,
    expired: products.filter((p) => p.status === 'expired').length,
    cancelled: products.filter((p) => p.status === 'cancelled').length,
    totalValue: products
      .filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + p.currentBid, 0),
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Title',
      'Category',
      'Condition',
      'Starting Price',
      'Current Bid',
      'Buy Now Price',
      'Status',
      'Seller',
      'Created',
    ];
    const rows = filteredProducts.map((product) => [
      product.title,
      product.category,
      product.condition,
      product.startingPrice,
      product.currentBid,
      product.buyNowPrice || 'N/A',
      product.status,
      `${product.seller?.firstName || ''} ${product.seller?.lastName || ''}`.trim(),
      new Date(product.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanabid-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Products exported to CSV');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            </div>
            <p className="text-gray-600">{filteredProducts.length} products displayed</p>
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats.total || 0}</span>
              <div className='bg-blue-600/10 p-2 rounded-md'>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Total Products</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats.active || 0}</span>
              <div className='bg-green-600/10 p-2 rounded-md'>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Active</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats.sold || 0}</span>
              <div className='bg-teal-600/10 p-2 rounded-md'>
                <CheckCircle className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Sold</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats.expired || 0}</span>
              <div className='bg-orange-600/10 p-2 rounded-md'>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Expired</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats.cancelled || 0}</span>
              <div className='bg-red-600/10 p-2 rounded-md'>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Cancelled</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(stats.totalValue)}
              </div>
              <div className='bg-purple-600/10 p-2 rounded-md'>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Active Value</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or seller..."
                className="w-full pl-10 pr-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring focus:ring-purple-300 focus:border-transparent"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'sold', 'expired', 'cancelled'] as ProductStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          statusFilter === status
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'all',
                      'Electronics',
                      'Books',
                      'Fashion',
                      'Furniture',
                      'Sports',
                      'Other',
                    ] as ProductCategory[]
                  ).map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        categoryFilter === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const timeRemaining = formatTimeRemaining(product.auctionEndTime);
            const isEnded = timeRemaining === 'Ended' || product.status !== 'active';

            const isValidImageUrl = (url: string) => {
              try {
                new URL(url);
                return url.startsWith('http://') || url.startsWith('https://');
              } catch {
                return false;
              }
            };
            const hasValidImage =
              product.images &&
              product.images.length > 0 &&
              isValidImageUrl(product.images[0]);

            return (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row gap-4 p-4">
                  {/* Product Image */}
                  <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                    {hasValidImage ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      </div>
                      <Link href={`/products/${product._id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-2 flex-shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                    </div>

                    {/* Tags and Status */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                          product.condition
                        )}`}
                      >
                        <Tag className="w-3 h-3" />
                        {product.condition}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status === 'active' && <TrendingUp className="w-3 h-3" />}
                        {product.status === 'sold' && <CheckCircle className="w-3 h-3" />}
                        {product.status === 'expired' && <Clock className="w-3 h-3" />}
                        {product.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                        {product.status}
                      </span>
                    </div>

                    {/* Pricing and Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Starting Price</p>
                        <p className="font-bold text-gray-900">
                          {formatPrice(product.startingPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Current Bid</p>
                        <p className="font-bold text-blue-600">
                          {formatPrice(product.currentBid)}
                        </p>
                      </div>
                      {product.buyNowPrice && (
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Buy Now</p>
                          <p className="font-bold text-green-600">
                            {formatPrice(product.buyNowPrice)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600 text-xs mb-1">
                          {isEnded ? 'Ended' : 'Time Left'}
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <p
                            className={`font-medium ${
                              isEnded ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {timeRemaining}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="md:w-48 flex-shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
                    <p className="text-xs text-gray-600 mb-2">Seller</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {product.seller?.firstName?.[0] || 'U'}
                        {product.seller?.lastName?.[0] || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {product.seller?.firstName || 'Unknown'}{' '}
                          {product.seller?.lastName || 'Seller'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          {product.seller?.rating?.toFixed(1) || 'New'}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

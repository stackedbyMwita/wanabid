'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FaBoxOpen, FaUser } from 'react-icons/fa';

export default function MyListingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'expired'>('all');

  // Redirect if not a seller
  if (user?.userType !== 'seller') {
    router.push('/dashboard');
    return null;
  }

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsAPI.getMyProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true;
    return product.status === filter;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    sold: products.filter((p) => p.status === 'sold').length,
    expired: products.filter((p) => p.status === 'expired').length,
  };

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 border rounded-lg text-center transition ${
              filter === 'all'
                ? 'text-blue-600 border-blue-600 bg-blue-100'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-xs">All</div>
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`p-3 border rounded-lg text-center transition ${
              filter === 'active'
                ? 'text-green-600 border-green-600 bg-green-100'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.active}</div>
            <div className="text-xs">Active</div>
          </button>
          <button
            onClick={() => setFilter('sold')}
            className={`p-3 border rounded-lg text-center transition ${
              filter === 'sold'
                ? 'text-amber-600 border-amber-600 bg-amber-100'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.sold}</div>
            <div className="text-xs">Sold</div>
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`p-3 border rounded-lg text-center transition ${
              filter === 'expired'
                ? 'text-red-600 border-red-600 bg-red-100'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.expired}</div>
            <div className="text-xs">Expired</div>
          </button>
        </div>

        {/* Create Button */}
        <Link href="/create-listing">
          <Button variant="primary" size="lg" className="w-full mb-4">
            <Plus /> Create New Listing
          </Button>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your listings...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-200 mb-4">
              <FaBoxOpen size={100} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {filter === 'all'
                ? 'Start selling by creating your first listing'
                : `You don't have any ${filter} listings`}
            </p>
            {filter === 'all' && (
              <Link href="/create-listing">
                <Button variant="primary">Create Listing</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

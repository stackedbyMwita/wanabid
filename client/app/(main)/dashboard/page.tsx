'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI, bidsAPI, transactionsAPI } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Smartphone, Armchair, LibraryBig, Shirt, Volleyball, Gift, Gavel, CreditCard, Handshake, Plus } from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [myBidsCount, setMyBidsCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load active products
      const products = await productsAPI.getAll();
      setActiveProducts(products.slice(0, 6)); // Show first 6

      // Load user stats
      if (user?.userType === 'buyer') {
        const bids = await bidsAPI.getMyBids();
        setMyBidsCount(bids.length);
      }

      const purchases = await transactionsAPI.getMyPurchases();
      const sales = await transactionsAPI.getMySales();
      setTransactionsCount(purchases.length + sales.length);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="pt-4 pb-20">
      {/* Welcome Section */}
      <div className="text-gray-900 px-6 py-2 mb-2">
        <h1 className="text-2xl font-bold mb-2 ">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500">
          {user?.userType === 'seller' 
            ? 'Ready to list some items?' 
            : 'Find great deals on second-hand items'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          
          <Link
            href="/bids"
            className="bg-white p-4 flex flex-col rounded-lg shadow-md"
          >
            <div className='flex justify-between mb-2 items-center'>
              <p className="text-sm text-gray-600">Active Bids</p>
              <div className='rounded-md bg-blue-100 text-blue-600 p-2'>
                <Gavel />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{myBidsCount}</p>
          </Link>

          <Link
            href="/transactions"
            className="bg-white p-4 flex flex-col rounded-lg shadow-md"
          >
            <div className='flex justify-between mb-2 items-center'>
              <p className="text-sm text-gray-600">Transactions</p>
              <div className='rounded-md bg-blue-100 text-blue-600 p-2'>
                <CreditCard />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{transactionsCount}</p>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.userType === 'seller' && (
        <div className="px-4 mb-6">
          <Link href="/create-listing">
            <Button variant="primary" size="lg" className="w-full">
              <Plus /> Create New Listing
            </Button>
          </Link>
        </div>
      )}

      {/* Categories */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Browse Categories</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[
            { name: 'Electronics', icon: <Smartphone />, category: 'Electronics' },
            { name: 'Books', icon: <LibraryBig />, category: 'Books' },
            { name: 'Fashion', icon: <Shirt />, category: 'Fashion' },
            { name: 'Furniture', icon: <Armchair />, category: 'Furniture' },
            { name: 'Sports', icon: <Volleyball />, category: 'Sports' },
            { name: 'Other', icon: <Gift />, category: 'Other' },
          ].map((cat) => (
            <Link
              key={cat.category}
              href={`/products?category=${cat.category}`}
              className="group bg-white rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className={`text-3xl bg-gray-100 group-hover:bg-gray-200 text-gray-600 rounded-t-lg p-4 flex items-center justify-center mx-auto`}>
                {cat.icon}
              </div>
              <div className="text-gray-600 p-2 font-medium">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Auctions */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Active Auctions</h2>
          <Link href="/products" className="text-sm text-blue-600 font-medium">
            View All →
          </Link>
        </div>

        {activeProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-600">No active auctions right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
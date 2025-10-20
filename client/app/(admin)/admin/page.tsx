'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalTransactions: number;
  totalRevenue: number;
  activeAuctions: number;
  pendingDisputes: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.userType !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.userType === 'admin') {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.userType !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-purple-100">Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers || 0}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalProducts || 0}
            </div>
            <div className="text-sm text-gray-600">Products</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.activeAuctions || 0}
            </div>
            <div className="text-sm text-gray-600">Active Auctions</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalTransactions || 0}
            </div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl mb-2">💵</div>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(stats?.totalRevenue || 0)}
            </div>
            <div className="text-sm text-gray-600">Revenue (Fees)</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-2xl font-bold text-red-600">
              {stats?.pendingDisputes || 0}
            </div>
            <div className="text-sm text-gray-600">Disputes</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold text-gray-900 mb-1">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  View and manage all platform users
                </p>
              </div>
            </Link>

            <Link href="/admin/products">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-bold text-gray-900 mb-1">Products</h3>
                <p className="text-sm text-gray-600">
                  Monitor all product listings
                </p>
              </div>
            </Link>

            <Link href="/admin/transactions">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-gray-900 mb-1">Transactions</h3>
                <p className="text-sm text-gray-600">
                  View all platform transactions
                </p>
              </div>
            </Link>

            <Link href="/admin/disputes">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border-2 border-red-200">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="font-bold text-red-900 mb-1">Disputes</h3>
                <p className="text-sm text-red-700">
                  {stats?.pendingDisputes || 0} pending disputes
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Alert if disputes exist */}
        {stats && stats.pendingDisputes > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🚨</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Action Required: Pending Disputes
                </h3>
                <p className="text-red-800 mb-4">
                  You have {stats.pendingDisputes} dispute{stats.pendingDisputes > 1 ? 's' : ''} waiting for resolution.
                  Please review and resolve them as soon as possible.
                </p>
                <Link href="/admin/disputes">
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                    View Disputes
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

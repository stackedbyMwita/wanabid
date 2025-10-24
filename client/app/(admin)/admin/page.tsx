'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import {
  Users,
  Package,
  Target,
  DollarSign,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
} from 'lucide-react';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-purple-100">Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.totalUsers || 0}</span>
              <div className='bg-blue-600/10 p-2 rounded-md'>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Total Users</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.totalProducts || 0}</span>
              <div className='bg-purple-600/10 p-2 rounded-md'>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Products</div>
          </div>

          {/* Auctions */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.totalUsers || 0}</span>
              <div className='bg-green-600/10 p-2 rounded-md'>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Active Auctions</div>
          </div>
          {/* Transactions */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.totalTransactions || 0}</span>
              <div className='bg-orange-600/10 p-2 rounded-md'>
              <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Transactions</div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <div className="text-lg font-bold text-gray-900">
                  {formatPrice(stats?.totalRevenue || 0)}
                </div>
              <div className='bg-green-600/10 p-2 rounded-md'>
                <Wallet className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Revenue (Fees)</div>
          </div>
          {/* Transactions */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-red-600'>{stats?.pendingDisputes || 0}</span>
              <div className='bg-red-600/10 p-2 rounded-md'>
              <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Disputes</div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <Users className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  View and manage all platform users
                </p>
              </div>
            </Link>

            <Link href="/admin/products">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <Package className="w-10 h-10 text-purple-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Products</h3>
                <p className="text-sm text-gray-600">
                  Monitor all product listings
                </p>
              </div>
            </Link>

            <Link href="/admin/transactions">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <DollarSign className="w-10 h-10 text-green-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Transactions</h3>
                <p className="text-sm text-gray-600">
                  View all platform transactions
                </p>
              </div>
            </Link>

            <Link href="/admin/disputes">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border-2 border-red-200">
                <AlertTriangle className="w-10 h-10 text-red-600 mb-3" />
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
              <AlertTriangle className="w-10 h-10 text-red-600 flex-shrink-0" />
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

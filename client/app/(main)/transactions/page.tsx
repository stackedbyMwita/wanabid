'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { transactionsAPI } from '@/lib/api';
import { Transaction } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import {
  ShoppingBag,
  BanknoteArrowDown,
  BanknoteArrowUp,
  CreditCard,
  Truck,
  LockKeyhole
} from 'lucide-react';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const [purchasesData, salesData] = await Promise.all([
        transactionsAPI.getMyPurchases(),
        transactionsAPI.getMySales(),
      ]);
      setPurchases(purchasesData);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeTransactions = activeTab === 'purchases' ? purchases : sales;

  const stats = {
    purchases: purchases.length,
    sales: sales.length,
    totalSpent: purchases.reduce((sum, t) => sum + t.finalAmount + t.escrowFee, 0),
    totalEarned: sales
      .filter((t) => t.escrowStatus === 'released')
      .reduce((sum, t) => sum + t.finalAmount, 0),
  };

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Stats Card */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-6 mb-4">
          <h2 className="text-lg font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{stats.purchases}</div>
              <div className="text-xs text-green-100">Purchases</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.sales}</div>
              <div className="text-xs text-green-100">Sales</div>
            </div>
            <div>
              <div className="text-lg font-bold">{formatPrice(stats.totalSpent)}</div>
              <div className="text-xs text-green-100">Total Spent</div>
            </div>
            <div>
              <div className="text-lg font-bold">{formatPrice(stats.totalEarned)}</div>
              <div className="text-xs text-green-100">Total Earned</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-lg font-medium transition ${
              activeTab === 'purchases'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <BanknoteArrowUp /> Purchases ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-lg font-medium transition ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <BanknoteArrowDown /> Sales ({sales.length})
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : activeTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-600 text-center">
              {activeTab === 'purchases'
                ? 'Win an auction to create your first purchase'
                : 'Your sold items will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTransactions.map((transaction) => {
              const product = transaction.product;
              const otherParty =
                activeTab === 'purchases' ? transaction.seller : transaction.buyer;

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
                <Link
                  key={transaction._id}
                  href={`/transactions/${transaction._id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                        {hasValidImage ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {product.title}
                        </h3>

                        {/* Other Party */}
                        <p className="text-sm text-gray-600 mb-2">
                          {activeTab === 'purchases' ? 'Seller' : 'Buyer'}:{' '}
                          {otherParty.firstName} {otherParty.lastName}
                        </p>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span
                            className={`px-2 flex items-center gap-1 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              transaction.paymentStatus
                            )}`}
                          >
                            <CreditCard size={16} /> {transaction.paymentStatus}
                          </span>
                          <span
                            className={`px-2 flex items-center gap-1 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              transaction.escrowStatus
                            )}`}
                          >
                            <LockKeyhole size={16}/> {transaction.escrowStatus}
                          </span>
                          <span
                            className={`px-2 flex items-center gap-1 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              transaction.deliveryStatus
                            )}`}
                          >
                            <Truck size={16}/> {transaction.deliveryStatus}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(transaction.finalAmount)}
                            </p>
                            {activeTab === 'purchases' && (
                              <p className="text-xs text-gray-500">
                                + {formatPrice(transaction.escrowFee)} escrow fee
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Order #{transaction._id.slice(-8)}
                        </span>
                        <span className="text-sm text-blue-600 font-medium">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
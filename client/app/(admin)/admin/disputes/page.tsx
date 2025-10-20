'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Transaction } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setIsLoading(true);
    try {
      const transactions = await adminAPI.getAllTransactions();
      const disputed = transactions.filter((t) => t.deliveryStatus === 'disputed');
      setDisputes(disputed);
    } catch (error) {
      console.error('Error loading disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (transactionId: string, resolution: 'release' | 'refund') => {
    const confirmMessage =
      resolution === 'release'
        ? 'Release payment to seller? This action cannot be undone.'
        : 'Refund payment to buyer? This action cannot be undone.';

    if (!confirm(confirmMessage)) return;

    setResolvingId(transactionId);
    try {
      await adminAPI.resolveDispute(transactionId, resolution);
      toast.success(`Dispute resolved: ${resolution}`);
      loadDisputes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolvingId(null);
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
          <p className="text-gray-600">{disputes.length} pending disputes</p>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Disputes</h3>
          <p className="text-gray-600">All transactions are running smoothly!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((transaction) => (
            <div key={transaction._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {transaction.product.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Transaction ID: {transaction._id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    🚨 Disputed
                  </span>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">Seller</p>
                    <p className="font-semibold text-gray-900">
                      {transaction.seller.firstName} {transaction.seller.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.seller.email}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">Buyer</p>
                    <p className="font-semibold text-gray-900">
                      {transaction.buyer.firstName} {transaction.buyer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.buyer.email}</p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-bold text-gray-900">
                        {formatPrice(transaction.finalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Escrow Fee</p>
                      <p className="font-bold text-gray-900">
                        {formatPrice(transaction.escrowFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment</p>
                      <p className="font-medium capitalize">{transaction.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Escrow</p>
                      <p className="font-medium capitalize">{transaction.escrowStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href={`/transactions/${transaction._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    onClick={() => handleResolve(transaction._id, 'release')}
                    isLoading={resolvingId === transaction._id}
                    className="flex-1"
                  >
                    Release to Seller
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleResolve(transaction._id, 'refund')}
                    isLoading={resolvingId === transaction._id}
                    className="flex-1"
                  >
                    Refund to Buyer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

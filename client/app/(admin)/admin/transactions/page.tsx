'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Transaction } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
  CreditCard,
  Lock,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Package,
  User,
  Calendar,
} from 'lucide-react';

type TransactionStatus = 'all' | 'pending' | 'completed' | 'disputed';
type PaymentFilter = 'all' | 'pending' | 'completed' | 'refunded';
type DeliveryFilter = 'all' | 'pending' | 'shipped' | 'delivered' | 'disputed';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await adminAPI.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      transaction._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.seller?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (general)
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = transaction.escrowStatus === 'pending' || transaction.escrowStatus === 'held';
    } else if (statusFilter === 'completed') {
      matchesStatus = transaction.escrowStatus === 'released';
    } else if (statusFilter === 'disputed') {
      matchesStatus = transaction.deliveryStatus === 'disputed';
    }

    // Payment filter
    const matchesPayment =
      paymentFilter === 'all' || transaction.paymentStatus === paymentFilter;

    // Delivery filter
    const matchesDelivery =
      deliveryFilter === 'all' || transaction.deliveryStatus === deliveryFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesDelivery;
  });

  // Stats
  const stats = {
    total: transactions.length,
    pending: transactions.filter(
      (t) => t.escrowStatus === 'pending' || t.escrowStatus === 'held'
    ).length,
    completed: transactions.filter((t) => t.escrowStatus === 'released').length,
    disputed: transactions.filter((t) => t.deliveryStatus === 'disputed').length,
    totalRevenue: transactions
      .filter((t) => t.escrowStatus === 'released')
      .reduce((sum, t) => sum + t.escrowFee, 0),
    totalValue: transactions.reduce((sum, t) => sum + t.finalAmount, 0),
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Transaction ID',
      'Product',
      'Buyer',
      'Seller',
      'Amount',
      'Escrow Fee',
      'Payment Status',
      'Delivery Status',
      'Escrow Status',
      'Created',
    ];
    const rows = filteredTransactions.map((t) => [
      t._id,
      t.product?.title || 'N/A',
      t.buyer?.email || 'N/A',
      t.seller?.email || 'N/A',
      t.finalAmount,
      t.escrowFee,
      t.paymentStatus,
      t.deliveryStatus,
      t.escrowStatus,
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanabid-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Transactions exported to CSV');
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
              <Receipt className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Transactions
              </h1>
            </div>
            <p className="text-gray-600">
              {filteredTransactions.length} transactions displayed
            </p>
          </div>
          <Button
            variant="primary"
            onClick={exportToCSV}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <Receipt className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <Clock className="w-8 h-8 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.disputed}</div>
            <div className="text-sm text-gray-600">Disputed</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <DollarSign className="w-8 h-8 text-teal-600 mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(stats.totalValue)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
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
                placeholder="Search by ID, product, buyer, or seller..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  Transaction Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'pending', 'completed', 'disputed'] as TransactionStatus[]).map(
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
                  Payment Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'pending', 'completed', 'refunded'] as PaymentFilter[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setPaymentFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          paymentFilter === status
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
                  Delivery Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    ['all', 'pending', 'shipped', 'delivered', 'disputed'] as DeliveryFilter[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => setDeliveryFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        deliveryFilter === status
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const isValidImageUrl = (url: string) => {
              try {
                new URL(url);
                return url.startsWith('http://') || url.startsWith('https://');
              } catch {
                return false;
              }
            };
            const hasValidImage =
              transaction.product?.images &&
              transaction.product.images.length > 0 &&
              isValidImageUrl(transaction.product.images[0]);

            return (
              <div
                key={transaction._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                        {hasValidImage ? (
                          <img
                            src={transaction.product.images[0]}
                            alt={transaction.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {transaction.product?.title || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Transaction ID:{' '}
                          <span className="font-mono">{transaction._id.slice(-12)}</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </div>

                    <Link href={`/transactions/${transaction._id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.paymentStatus
                      )}`}
                    >
                      <CreditCard className="w-3 h-3" />
                      Payment: {transaction.paymentStatus}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.deliveryStatus
                      )}`}
                    >
                      <Truck className="w-3 h-3" />
                      Delivery: {transaction.deliveryStatus}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.escrowStatus
                      )}`}
                    >
                      <Lock className="w-3 h-3" />
                      Escrow: {transaction.escrowStatus}
                    </span>
                    {transaction.trackingCode && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        <Package className="w-3 h-3" />
                        Tracking: {transaction.trackingCode}
                      </span>
                    )}
                  </div>

                  {/* Parties and Amounts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Seller */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-800 font-medium">Seller</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        {transaction.seller?.firstName} {transaction.seller?.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {transaction.seller?.email}
                      </p>
                    </div>

                    {/* Buyer */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-800 font-medium">Buyer</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        {transaction.buyer?.firstName} {transaction.buyer?.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {transaction.buyer?.email}
                      </p>
                    </div>

                    {/* Amounts */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-800 font-medium">Amounts</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Product:</span>
                          <span className="font-bold text-gray-900">
                            {formatPrice(transaction.finalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Escrow Fee:</span>
                          <span className="font-bold text-purple-600">
                            {formatPrice(transaction.escrowFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-1 border-t">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className="font-bold text-gray-900">
                            {formatPrice(transaction.finalAmount + transaction.escrowFee)}
                          </span>
                        </div>
                      </div>
                    </div>
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

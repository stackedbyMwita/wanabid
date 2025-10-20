'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { transactionsAPI } from '@/lib/api';
import { Transaction } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import PaymentModal from '@/components/transactions/PaymentModal';
import {
  ShoppingBag,
  BanknoteArrowDown,
  BanknoteArrowUp,
  CreditCard,
  Truck,
  LockKeyhole,
  Frown,
  TriangleAlert,
  CircleCheckBig
} from 'lucide-react';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [params.id]);

  const loadTransaction = async () => {
    setIsLoading(true);
    try {
      const data = await transactionsAPI.getById(params.id as string);
      setTransaction(data);
    } catch (error) {
      console.error('Error loading transaction:', error);
      toast.error('Failed to load transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!transaction) return;
    setActionLoading(true);
    try {
      await transactionsAPI.updatePayment(transaction._id);
      toast.success('Payment confirmed! Funds held in escrow.');
      loadTransaction();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleShip = async () => {
    if (!transaction) return;
    setActionLoading(true);
    try {
      await transactionsAPI.markAsShipped(transaction._id, trackingNumber);
      toast.success('Item marked as shipped!');
      loadTransaction();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update shipping');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!transaction) return;
    setActionLoading(true);
    try {
      await transactionsAPI.confirmDelivery(transaction._id);
      toast.success('Delivery confirmed! Funds released to seller.');
      loadTransaction();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!transaction || !disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }
    setActionLoading(true);
    try {
      await transactionsAPI.raiseDispute(transaction._id, disputeReason);
      toast.success('Dispute raised. Admin will review.');
      setShowDispute(false);
      loadTransaction();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to raise dispute');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-6xl mb-4"><Frown /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction not found</h2>
        <Button variant="primary" onClick={() => router.push('/transactions')}>
          Back to Transactions
        </Button>
      </div>
    );
  }

  const isBuyer = user?.id.toString() === transaction?.buyer?._id.toString();
  const isSeller = user?.id.toString() === transaction?.seller?._id.toString();
  const product = transaction.product;

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };
  const hasValidImage =
    product.images && product.images.length > 0 && isValidImageUrl(product.images[0]);

  return (
    <div className="pb-20 md:pb-8">
      <h1 className="text-xl font-bold px-4 text-gray-900 mt-6">Order Details</h1>

      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* Order Number */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Order ID: <span className="font-mono font-bold">{transaction._id}</span>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Created: {formatDate(transaction.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-bold text-gray-900 mb-3">Product</h2>
            <div className="flex gap-4">
              <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                {hasValidImage ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-3xl">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Parties Info */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-bold text-gray-900 mb-3">Transaction Parties</h2>
            <div className="space-y-3">
              {/* Seller */}
              <div className='flex-col'>
                <p className="text-xs text-gray-500 mb-1">Seller</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {transaction.seller.firstName[0]}
                      {transaction.seller.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.seller.firstName} {transaction.seller.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{transaction.seller.email}</p>
                    </div>
                  </div>
                  <button className="px-4 text-blue-600 py-2 border border-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100">Contact
                  </button>
                </div>
              </div>
              {/* Buyer */}
              <div className='flex-col'>
                <p className="text-xs text-gray-500 mb-1">Buyer</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {transaction.buyer.firstName[0]}
                      {transaction.buyer.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.buyer.firstName} {transaction.buyer.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{transaction.buyer.email}</p>
                    </div>
                  </div>
                  <button className="px-4 text-blue-600 py-2 border border-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100">Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-gray-900 mb-3">
            <span className='font-bold mb-3'>
              Status
            </span>
            {transaction.trackingNumber && (
              <p className="text-xs bg-gray-50 p-2 border border-gray-200 rounded-md text-gray-500 ">
                Tracking Number: {transaction.trackingNumber}
              </p>
            )}
          </h2>
          <div className="flex justify-between px-2 items-center">
            {/* Payment Status */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.paymentStatus === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <CreditCard />
              </div>
              <div
                className={`flex flex-col items-center ${
                  transaction.paymentStatus === 'completed'
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}>
                <p className="font-medium">Payment</p>
                <p className='text-xs capitalize'>
                  {transaction.paymentStatus}
                </p>
              </div>
            </div>

            {/* Escrow Status */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.escrowStatus === 'held'
                    ? 'bg-blue-100 text-blue-600'
                    : transaction.escrowStatus === 'released'
                    ? 'bg-green-100 text-green-600'
                    : transaction.escrowStatus === 'refunded'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <LockKeyhole />
              </div>
              <div
                className={`flex flex-col items-center ${
                  transaction.escrowStatus === 'held'
                    ? 'text-blue-600'
                    : transaction.escrowStatus === 'released'
                    ? 'text-green-600'
                    : transaction.escrowStatus === 'refunded'
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}>
                <p className="font-medium">Escrow</p>
                <p className='text-xs capitalize'>
                  {transaction.escrowStatus}
                </p>
              </div>
            </div>

            {/* Deivery Status */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.deliveryStatus === 'delivered'
                    ? 'bg-green-100 text-green-600'
                    : transaction.deliveryStatus === 'shipped'
                    ? 'bg-purple-100 text-purple-600'
                    : transaction.deliveryStatus === 'disputed'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Truck />
              </div>
              <div
                className={`flex flex-col items-center ${
                  transaction.deliveryStatus === 'delivered'
                    ? 'text-green-600'
                    : transaction.deliveryStatus === 'shipped'
                    ? 'text-purple-600'
                    : transaction.deliveryStatus === 'disputed'
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}
              >
                <p className="font-medium">Delivery</p>
                <div className='flex items-center '>
                  <p className='text-xs capitalize'>{transaction.deliveryStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="font-bold text-gray-900 mb-3">Payment Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Item Price</span>
              <span className="font-medium text-gray-400">{formatPrice(transaction.finalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Escrow Fee (5%)</span>
              <span className="font-medium text-gray-400">{formatPrice(transaction.escrowFee)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-blue-600">
                {formatPrice(transaction.finalAmount + transaction.escrowFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Buyer Actions */}
          {isBuyer && transaction.paymentStatus === 'pending' && (
            <>
              <div className="bg-yellow-50 gap-2 items-center border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold flex items-center gap-2 text-yellow-900 mb-2"><TriangleAlert /> Payment Required</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Complete payment to proceed with this order. Your funds will be held securely in escrow.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowPaymentModal(true)}
                  isLoading={actionLoading}
                >
                  Confirm Payment
                </Button>
              </div>

              <PaymentModal
                isModalOpen={showPaymentModal}
                onModalClose={() => setShowPaymentModal(false)}
                transaction={transaction}
                onPaymentComplete={handlePayment}
              />
            </>
          )}

          {isBuyer &&
            transaction.deliveryStatus === 'shipped' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold flex gap-2 items-center text-blue-900 mb-2"><Truck /> Item Shipped</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Your item has been shipped. Once you receive it, confirm delivery to release
                  payment to the seller.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirmDelivery}
                  isLoading={actionLoading}
                >
                  Confirm Delivery
                </Button>
              </div>
            )}

          {/* Seller Actions */}
          {isSeller &&
            transaction.paymentStatus === 'completed' &&
            transaction.deliveryStatus === 'pending' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold flex items-center gap-2 text-green-900 mb-2"><CircleCheckBig /> Payment Received</h3>
                <p className="text-sm text-green-800 mb-3">
                  Buyer has paid. Ship the item and provide tracking details.
                </p>
                <Input
                  label="Tracking Number (Optional)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="mb-3"
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleShip}
                  isLoading={actionLoading}
                >
                  Mark as Shipped
                </Button>
              </div>
            )}

          {/* Dispute Button */}
          {transaction.deliveryStatus !== 'delivered' &&
            transaction.deliveryStatus !== 'disputed' &&
            transaction.escrowStatus !== 'released' &&
            transaction.escrowStatus !== 'refunded' && (
              <>
                {!showDispute ? (
                  <button
                    onClick={() => setShowDispute(true)}
                    className="w-full py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg border border-red-300 transition"
                  >
                    Report an Issue
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-bold text-red-900 mb-2">Report Issue</h3>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Describe the issue..."
                      rows={4}
                      className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={handleDispute}
                        isLoading={actionLoading}
                      >
                        Submit Dispute
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowDispute(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

          {transaction.deliveryStatus === 'disputed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold flex items-center gap-2 text-red-900 mb-2"><TriangleAlert /> Dispute Active</h3>
              <p className="text-sm text-red-800">
                This transaction is under review. Our team will contact you shortly.
              </p>
            </div>
          )}

          {transaction.escrowStatus === 'released' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <h3 className="flex justify-center items-center gap-2 font-bold text-green-900 mb-2"><CircleCheckBig /> Transaction Complete</h3>
              <p className="text-sm text-green-800">
                {isBuyer
                  ? 'Thank you for your purchase!'
                  : 'Funds have been released to your account.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

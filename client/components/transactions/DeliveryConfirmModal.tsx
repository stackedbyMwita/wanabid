'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { PackageCheck, TriangleAlert } from 'lucide-react';

interface DeliveryConfirmModalProps {
  isModalOpen: boolean;
  onModalClose: () => void;
  trackingCode: string | undefined;
  productTitle: string;
  onConfirm: (trackingCode: string) => Promise<void>;
}

export default function DeliveryConfirmModal({
  isModalOpen,
  onModalClose,
  trackingCode,
  productTitle,
  onConfirm,
}: DeliveryConfirmModalProps) {
  const [enteredTrackingCode, setEnteredTrackingCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setEnteredTrackingCode('');
    setError('');
    onModalClose();
  };

  const handleConfirm = async () => {
    // Clear previous errors
    setError('');

    // Validate tracking number is entered if required
    if (trackingCode && !enteredTrackingCode.trim()) {
      setError('Please enter the tracking code');
      toast.error('Tracking code is required');
      return;
    }

    // Submit to backend for validation
    setIsLoading(true);
    try {
      await onConfirm(trackingCode ? enteredTrackingCode : undefined);
      toast.success('Delivery confirmed successfully! 🎉');
      handleClose();
    } catch (error: any) {
      console.error('Confirmation error:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || 'Failed to confirm delivery';
      const invalidTracking = error.response?.data?.invalidTracking;
      
      if (invalidTracking) {
        setError('Tracking code does not match. Please check the package label.');
      } else {
        setError(errorMessage);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isModalOpen={isModalOpen} onModalClose={handleClose} title="Confirm Delivery">
      <div className="space-y-4">
        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <PackageCheck size={50} className="text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Verify Package</h3>
              <p className="text-sm text-blue-800">
                Enter the tracking number from your package to confirm you received the correct item.
              </p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Product</p>
          <p className="font-semibold text-gray-900">{productTitle}</p>
        </div>

        {/* Tracking Number Input */}
        <Input
          label="Enter Tracking Number"
          type="text"
          value={enteredTrackingCode}
          onChange={(e) => {
            setEnteredTrackingCode(e.target.value);
            if (error) setError('');
          }}
          error={error}
          placeholder="Enter tracking number from the package"
          className="font-mono"
        />

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-xs text-yellow-800">
            <span className="flex items-center gap-2 font-semibold mb-1">
              <TriangleAlert />
              Important:
            </span>
            <p>
              Only confirm delivery if you have received and verified your package. Once confirmed,
              payment will be released to the seller.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={handleClose} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="flex-1"
            isLoading={isLoading}
          >
            Confirm Delivery
          </Button>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { PackageCheck, TriangleAlert, Lightbulb } from 'lucide-react';

interface DeliveryConfirmModalProps {
  isModalOpen: boolean;
  onModalClose: () => void;
  trackingCode: string | undefined;
  productTitle: string;
  onConfirm: () => Promise<void>;
}

export default function DeliveryConfirmModal({
  isModalOpen,
  onModalClose,
  trackingCode,
  productTitle,
  onConfirm,
}: DeliveryConfirmModalProps) {
  const [enteredTrackingNumber, setEnteredTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setEnteredTrackingNumber('');
    setError('');
    onModalClose();
  };

  const handleConfirm = async () => {
    // Clear previous errors
    setError('');

    // Validate tracking number is entered
    if (!enteredTrackingNumber.trim()) {
      setError('Please enter the tracking number');
      toast.error('Tracking number is required');
      return;
    }

    // Check if seller provided a tracking number
    if (!trackingCode) {
      // If no tracking number from seller, just confirm delivery
      setIsLoading(true);
      try {
        await onConfirm();
        handleClose();
      } catch (error) {
        console.error('Confirmation error:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Validate tracking number matches (case-insensitive, trim whitespace)
    const enteredTrimmed = enteredTrackingNumber.trim().toLowerCase();
    const actualTrimmed = trackingCode.trim().toLowerCase();

    if (enteredTrimmed !== actualTrimmed) {
      setError('Tracking number does not match. Please check the package label.');
      toast.error('Incorrect tracking number');
      return;
    }

    // If validation passes, confirm delivery
    setIsLoading(true);
    try {
      await onConfirm();
      toast.success('Delivery confirmed successfully! 🎉');
      handleClose();
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error('Failed to confirm delivery. Please try again.');
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
                Please enter the tracking number written on the package to confirm you
                received the correct item.
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
          label="Enter Tracking Number from Package"
          type="text"
          value={enteredTrackingNumber}
          onChange={(e) => {
            setEnteredTrackingNumber(e.target.value);
            if (error) setError('');
          }}
          error={error}
          placeholder={'Enter tracking number'}
          className="font-mono"
        />

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-xs text-yellow-800">
            <span className='flex items-center gap-2 font-semibold mb-1'>
              <TriangleAlert />
              Important:
            </span>
             <p>Only confirm delivery if you have received the item and verified it matches the description. Once confirmed, payment will be released to the seller.
             </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
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
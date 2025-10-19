'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { DELIVERY_LOCATIONS, Location, getLocationById } from '@/lib/constants/locations';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isModalOpen: boolean;
  onModalClose: () => void;
  transaction: {
    _id: string;
    finalAmount: number;
    escrowFee: number;
    product: {
      title: string;
    };
  };
  onPaymentComplete: (paymentData: PaymentData) => Promise<void>;
}

export interface PaymentData {
  transactionId: string;
  paymentMethod: 'card' | 'mpesa';
  deliveryLocation: string;
  deliveryFee: number;
  phoneNumber: string;
  // Card details (if card payment)
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardName?: string;
  // M-Pesa details (if M-Pesa payment)
  mpesaNumber?: string;
}

export default function PaymentModal({
  isModalOpen,
  onModalClose,
  transaction,
  onPaymentComplete,
}: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa' | null>(null);

  // Card payment state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // M-Pesa state
  const [mpesaNumber, setMpesaNumber] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalAmount =
    transaction.finalAmount +
    transaction.escrowFee +
    (selectedLocation?.deliveryFee || 0);

  const resetForm = () => {
    setStep(1);
    setSelectedLocation(null);
    setPhoneNumber('');
    setPaymentMethod(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setMpesaNumber('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onModalClose();
  };

  // Step 1: Location Selection
  const validateStep1 = () => {
    if (!selectedLocation) {
      toast.error('Please select a delivery location');
      return false;
    }
    return true;
  };

  // Step 2: Phone & Payment Method
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^0[17]\d{8}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid Kenyan phone number (e.g., 0712345678)';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  // Step 3: Payment Details
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'card') {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = 'Format: MM/YY';
      }

      if (!cardCvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
      } else if (cardCvv.length !== 3) {
        newErrors.cardCvv = 'CVV must be 3 digits';
      }

      if (!cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
    } else if (paymentMethod === 'mpesa') {
      if (!mpesaNumber.trim()) {
        newErrors.mpesaNumber = 'M-Pesa number is required';
      } else if (!/^0[17]\d{8}$/.test(mpesaNumber)) {
        newErrors.mpesaNumber = 'Enter a valid Kenyan phone number';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all payment details');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const paymentData: PaymentData = {
        transactionId: transaction._id,
        paymentMethod: paymentMethod!,
        deliveryLocation: selectedLocation!.name,
        deliveryFee: selectedLocation!.deliveryFee,
        phoneNumber,
        ...(paymentMethod === 'card' && {
          cardNumber,
          cardExpiry,
          cardCvv,
          cardName,
        }),
        ...(paymentMethod === 'mpesa' && {
          mpesaNumber,
        }),
      };

      await onPaymentComplete(paymentData);
      toast.success('Payment initiated successfully!');
      handleClose();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  return (
    <Modal isModalOpen={isModalOpen} onModalClose={handleClose} title="Complete Payment">
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex w-full items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Location Selection */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Select Delivery Location
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {DELIVERY_LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedLocation?.id === location.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{location.name}</p>
                      <p className="text-sm text-gray-600">{location.area}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {location.deliveryFee === 0
                          ? 'Free'
                          : formatPrice(location.deliveryFee)}
                      </p>
                      <p className="text-xs text-gray-500">delivery</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Phone & Payment Method */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Contact & Payment Method
            </h3>

            <Input
              label="Phone Number for Delivery *"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
              }}
              error={errors.phoneNumber}
              placeholder="0712345678"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setPaymentMethod('card');
                    if (errors.paymentMethod)
                      setErrors({ ...errors, paymentMethod: '' });
                  }}
                  className={`p-4 rounded-lg border-2 transition ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">💳</div>
                  <p className="font-medium">Bank Card</p>
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod('mpesa');
                    if (errors.paymentMethod)
                      setErrors({ ...errors, paymentMethod: '' });
                  }}
                  className={`p-4 rounded-lg border-2 transition ${
                    paymentMethod === 'mpesa'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">📱</div>
                  <p className="font-medium">M-Pesa</p>
                </button>
              </div>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {paymentMethod === 'card' ? 'Card Details' : 'M-Pesa Details'}
            </h3>

            {paymentMethod === 'card' ? (
              <>
                <Input
                  label="Card Number *"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (/^\d*$/.test(value) && value.length <= 16) {
                      setCardNumber(formatCardNumber(value));
                      if (errors.cardNumber)
                        setErrors({ ...errors, cardNumber: '' });
                    }
                  }}
                  error={errors.cardNumber}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry Date *"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setCardExpiry(value);
                      if (errors.cardExpiry)
                        setErrors({ ...errors, cardExpiry: '' });
                    }}
                    error={errors.cardExpiry}
                    placeholder="MM/YY"
                    maxLength={5}
                  />

                  <Input
                    label="CVV *"
                    type="text"
                    value={cardCvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) {
                        setCardCvv(value);
                        if (errors.cardCvv) setErrors({ ...errors, cardCvv: '' });
                      }
                    }}
                    error={errors.cardCvv}
                    placeholder="123"
                    maxLength={3}
                  />
                </div>

                <Input
                  label="Cardholder Name *"
                  type="text"
                  value={cardName}
                  onChange={(e) => {
                    setCardName(e.target.value);
                    if (errors.cardName) setErrors({ ...errors, cardName: '' });
                  }}
                  error={errors.cardName}
                  placeholder="JOHN DOE"
                />
              </>
            ) : (
              <>
                <Input
                  label="M-Pesa Phone Number *"
                  type="tel"
                  value={mpesaNumber}
                  onChange={(e) => {
                    setMpesaNumber(e.target.value);
                    if (errors.mpesaNumber)
                      setErrors({ ...errors, mpesaNumber: '' });
                  }}
                  error={errors.mpesaNumber}
                  placeholder="0712345678"
                />

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    📱 You will receive an M-Pesa prompt on this number to authorize
                    the payment.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Review Order</h3>

            {/* Product */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Product</p>
              <p className="font-semibold text-gray-900">{transaction.product.title}</p>
            </div>

            {/* Delivery Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Delivery Location</p>
              <p className="font-semibold text-gray-900">{selectedLocation?.name}</p>
              <p className="text-xs text-gray-500">{selectedLocation?.area}</p>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Delivery Contact</p>
              <p className="font-semibold text-gray-900">{phoneNumber}</p>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Payment Method</p>
              <p className="font-semibold text-gray-900">
                {paymentMethod === 'card' ? '💳 Bank Card' : '📱 M-Pesa'}
              </p>
              {paymentMethod === 'card' && (
                <p className="text-sm text-gray-600">
                  •••• •••• •••• {cardNumber.slice(-4)}
                </p>
              )}
              {paymentMethod === 'mpesa' && (
                <p className="text-sm text-gray-600">{mpesaNumber}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-bold text-gray-900 mb-3">Payment Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item Price</span>
                  <span className="font-medium">
                    {formatPrice(transaction.finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Escrow Fee (5%)</span>
                  <span className="font-medium">
                    {formatPrice(transaction.escrowFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {formatPrice(selectedLocation?.deliveryFee || 0)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button variant="primary" onClick={handleNext} className="flex-1">
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex-1"
              isLoading={isLoading}
            >
              Confirm Payment - {formatPrice(totalAmount)}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
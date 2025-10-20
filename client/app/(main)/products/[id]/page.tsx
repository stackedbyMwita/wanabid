'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsAPI, bidsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Bid } from '@/types';
import { formatPrice, formatTimeRemaining, getConditionColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  MoveLeft,
  PackageSearch,
  Timer,
  Star,
  Ticket,
  TriangleAlert,
  PinOff,
  PackageOpen
} from 'lucide-react';
import SellerRating from '@/components/ui/SellerRating';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Images
  const hasImages = product?.images && product.images.length > 0;
  const mainImage = hasImages ? product.images[0] : null;
  const extraImages = hasImages ? product.images.slice(0, 4) : []; // Maximum of 4 thimbnails

  useEffect(() => {
    loadProductDetails();
  }, [params.id]);

  useEffect(() => {
    setActiveImage(mainImage);
  }, [mainImage]);

  const loadProductDetails = async () => {
    try {
      const data = await productsAPI.getById(params.id as string);
      setProduct(data.product);
      setBids(data.bids);
      
      // Set initial bid amount (current bid + min increment)
      if (data.product) {
        setBidAmount(String(data.product.currentBid + 50));
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!product) return;

    const amount = Number(bidAmount);
    if (amount <= product.currentBid) {
      toast.error('Bid must be higher than current bid');
      return;
    }

    setIsPlacingBid(true);
    try {
      await bidsAPI.placeBid({
        productId: product._id,
        amount,
      });
      toast.success('Bid placed successfully!');
      loadProductDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setIsBuyingNow(true);
    try {
      const result = await bidsAPI.buyNow(product._id);
      toast.success('Purchase successful!');
      router.push(`/transactions/${result.transaction._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to purchase');
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-6xl mb-4">
          <PackageOpen size={60} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <Button variant="primary" onClick={() => router.push('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === product.seller?._id;
  const timeRemaining = formatTimeRemaining(product.auctionEndTime);
  const isEnded = timeRemaining === 'Ended' || product.status !== 'active';
  
  // Safe access to seller data with fallbacks
  const sellerFirstName = product?.seller?.firstName ?? 'Unknown';
  const sellerLastName = product?.seller?.lastName ?? 'Seller';
  const sellerInitials = `${sellerFirstName[0] || 'U'}${sellerLastName[0] || 'S'}`;

  // Define sellerName safely
  let sellerName;
  if (sellerFirstName === 'Unknown') {
    sellerName = `${sellerFirstName} ${sellerLastName}`;
  } else {
    sellerName = `${sellerFirstName} ${sellerLastName}`;
  };

  return (
    <div className="pb-20 bg-white md:pb-8">
      {/* Image Gallery */}
      <div className="overflow-hidden relative group bg-gray-200 border m-2 rounded-md aspect-square md:aspect-video">
        {activeImage ? (
          <img
            src={activeImage}
            alt={product.title}
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.pageX - left) / width) * 100;
              const y = ((e.pageY - top) / height) * 100;
              e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
            }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-150 cursor-zoom-in"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <PackageSearch size='40' />
          </div>
        )}
      </div>

      {/* Thumbnail grid */}
      {extraImages.length > 0 && (
        <div
          className='flex justify-center gap-2 my-4 px-4 bg-white'
        >
          {extraImages.map((imgUrl, index) => (
            // Thumbnail rendered
            <button
              key={index}
              onClick={() => setActiveImage(imgUrl)}
              className='border h-20 w-20 border-gray-300 aspect-square overflow-hidden'
            >
              <img
                src={imgUrl}
                alt={`${product.title} thumbnail ${index + 1}`}
                className='w-full h-full object-cover'
              />
            </button>
          ))}
        </div>
      )}

      

      {/* Product Info */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(product.condition)}`}>
                {product.condition}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {sellerInitials}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {sellerName}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <SellerRating rating={product.seller?.rating || 0} />
            </div>
          </div>
          {!isOwner && (
            <button className="px-4 text-blue-600 py-2 border border-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100">
              Contact
            </button>
          )}
        </div>

        {/* Description */}
        <div className="mb-6 border border-dashed border-gray-300 bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Pricing Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Bid</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatPrice(product.currentBid)}
              </p>
            </div>
            {product.buyNowPrice && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Buy Now Price</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(product.buyNowPrice)}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium flex gap-2 ${isEnded ? 'text-red-600' : 'text-green-500 '}`}>
              <Timer size={18} />Ends {timeRemaining}
            </span>
            <span className="flex items-center gap-2 text-green-500 font-semibold">
              <Ticket size={18} /> {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
            </span>
          </div>
        </div>

        {/* Bidding Section */}
        {!isOwner && !isEnded && (
          <div className="space-y-3 mb-6">
            <div>
              <Input
                label="Your Bid Amount (KES)"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum bid: {formatPrice(product.currentBid + 10)}
              </p>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handlePlaceBid}
              isLoading={isPlacingBid}
              disabled={isEnded}
            >
              Place Bid
            </Button>

            {product.buyNowPrice && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleBuyNow}
                isLoading={isBuyingNow}
                disabled={isEnded}
              >
                Buy Now - {formatPrice(product.buyNowPrice)}
              </Button>
            )}
          </div>
        )}

        {isOwner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm flex items-center gap-2 text-yellow-600">
              <PinOff /> This is your listing. You cannot bid on your own products.
            </p>
          </div>
        )}

        {isEnded && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm flex items-center gap-2 text-yellow-600 font-medium">
              <TriangleAlert /> This auction has ended
            </p>
          </div>
        )}

        {/* Bid History */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Bid History</h2>
          {bids.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bids yet. Be the first to bid!
            </div>
          ) : (
            <div className="space-y-2">
              {bids.map((bid, index) => {
                const bidderFirstName = (bid.bidder as any)?.firstName || 'Anonymous';
                const bidderLastName = (bid.bidder as any)?.lastName || 'Bidder';
                const bidderInitial = bidderFirstName[0] || 'A';
                const bidderFullName = `${bidderFirstName} ${bidderLastName}`;
                
                return (
                  <div
                    key={bid._id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {bidderInitial}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {bidderFullName}
                          {index === 0 && (
                            <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                              {isEnded ? 'Winner' : 'Winning'}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">
                      {formatPrice(bid.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

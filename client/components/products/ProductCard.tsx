'use client';

import { Product } from '@/types';
import { formatPrice, formatTimeRemaining, getConditionColor } from '@/lib/utils';
import Link from 'next/link';
import { FaBoxOpen, FaUser } from 'react-icons/fa';
import { LuTimer } from 'react-icons/lu';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const timeRemaining = formatTimeRemaining(product.auctionEndTime);
  const isEnded = timeRemaining === 'Ended';

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
    <Link href={`/products/${product._id}`}>
      <div className="group bg-white rounded-md overflow-hidden border border-gray-100 hover:border-gray-300 transition-all duration-300">
        {/* Image */}
        <div className="relative h-56 bg-gray-100">
          {hasValidImage ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <FaBoxOpen size={60} />
            </div>
          )}

          {/* Condition Badge */}
          <div
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getConditionColor(
              product.condition
            )}`}
          >
            {product.condition}
          </div>

          {/* Status Badge */}
          {isEnded && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white uppercase">
              Ended
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-1">
            {product.description}
          </p>

          {/* Pricing */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase">Current Bid</p>
              <p className="text-lg md:text-xl font-bold text-blue-600">
                {formatPrice(product.currentBid)}
              </p>
            </div>
            {product.buyNowPrice && (
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Buy Now</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatPrice(product.buyNowPrice)}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <LuTimer className="text-gray-400" size={14} />
              <span className={isEnded ? 'text-red-600 font-medium' : 'font-medium'}>
                {timeRemaining}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaUser className="text-gray-400" size={14} />
              <span className="font-medium">{product.seller.firstName}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

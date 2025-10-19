'use client';

import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface BidSummaryCardProps {
  totalBids: number;
  winningBids: number;
  totalSpent: number;
}

export default function BidSummaryCard({ totalBids, winningBids, totalSpent }: BidSummaryCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">Bidding Summary</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-bold">{totalBids}</div>
          <div className="text-xs text-blue-100">Total Bids</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{winningBids}</div>
          <div className="text-xs text-blue-100">Winning</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
          <div className="text-xs text-blue-100">In Auctions</div>
        </div>
      </div>

      <Link href="/products">
        <button className="w-full mt-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
          Find More Deals
        </button>
      </Link>
    </div>
  );
}

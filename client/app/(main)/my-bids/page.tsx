'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bidsAPI } from '@/lib/api';
import { formatPrice, formatTimeRemaining } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Trophy, Timer, Ticket, Lightbulb, Target, TriangleAlert, MoveLeft } from 'lucide-react';

interface BidGroup {
  product: any;
  myBids: any[];
  isWinning: boolean;
  myHighestBid: number;
}

export default function MyBidsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bidGroups, setBidGroups] = useState<BidGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'winning' | 'outbid' | 'ended'>('all');

  useEffect(() => {
    loadMyBids();
  }, []);

  const loadMyBids = async () => {
    setIsLoading(true);
    try {
      const data = await bidsAPI.getMyBids();
      setBidGroups(data);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBids = bidGroups.filter((group) => {
    if (filter === 'all') return true;
    
    const isEnded = new Date() > new Date(group.product.auctionEndTime) || 
                    group.product.status !== 'active';
    
    if (filter === 'winning') return group.isWinning && !isEnded;
    if (filter === 'outbid') return !group.isWinning && !isEnded;
    if (filter === 'ended') return isEnded;
    
    return true;
  });

  const stats = {
    total: bidGroups.length,
    winning: bidGroups.filter((g) => {
      const isEnded = new Date() > new Date(g.product.auctionEndTime) || 
                      g.product.status !== 'active';
      return g.isWinning && !isEnded;
    }).length,
    outbid: bidGroups.filter((g) => {
      const isEnded = new Date() > new Date(g.product.auctionEndTime) || 
                      g.product.status !== 'active';
      return !g.isWinning && !isEnded;
    }).length,
    ended: bidGroups.filter((g) => {
      const isEnded = new Date() > new Date(g.product.auctionEndTime) || 
                      g.product.status !== 'active';
      return isEnded;
    }).length,
  };

  // Calculate total amount in winning bids
  const totalInWinningBids = bidGroups
    .filter((g) => {
      const isEnded = new Date() > new Date(g.product.auctionEndTime) || 
                      g.product.status !== 'active';
      return g.isWinning && !isEnded;
    })
    .reduce((sum, g) => sum + g.myHighestBid, 0);

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      {/* Back Button */}
      <div className="z-30 flex items-center gap-4 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 border border-gray-200 p-2 rounded-md  text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
        >
          <span className="">
            <MoveLeft size={20} />
          </span>
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Bids</h1>
      </div>

      {/* Summary Card */}
      {!isLoading && bidGroups.length > 0 && (
        <div className="px-4 py-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Bidding Summary</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-blue-100">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.winning}</div>
                <div className="text-xs text-blue-100">Winning</div>
              </div>
              <div>
                <div className="text-lg font-bold">{formatPrice(totalInWinningBids)}</div>
                <div className="text-xs text-blue-100">If Won</div>
              </div>
            </div>

            {stats.winning > 0 && (
              <div className="flex items-center gap-2 bg-white text-blue-500 bg-opacity-20 rounded-lg p-3 text-sm">
                <Lightbulb /> You're winning {stats.winning} {stats.winning === 1 ? 'auction' : 'auctions'}! Keep watching them.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Filter */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-lg text-center transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-xs">All</div>
          </button>
          <button
            onClick={() => setFilter('winning')}
            className={`p-3 rounded-lg text-center transition ${
              filter === 'winning'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.winning}</div>
            <div className="text-xs">Winning</div>
          </button>
          <button
            onClick={() => setFilter('outbid')}
            className={`p-3 rounded-lg text-center transition ${
              filter === 'outbid'
                ? 'bg-orange-600 text-white'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.outbid}</div>
            <div className="text-xs">Outbid</div>
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`p-3 rounded-lg text-center transition ${
              filter === 'ended'
                ? 'bg-gray-600 text-white'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-xl font-bold">{stats.ended}</div>
            <div className="text-xs">Ended</div>
          </button>
        </div>
      </div>

      {/* Bids List */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your bids...</p>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4"><Target size='30' /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No bids yet' : `No ${filter} bids`}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {filter === 'all'
                ? 'Start bidding on products you like'
                : `You don't have any ${filter} bids`}
            </p>
            {filter === 'all' && (
              <Link href="/products">
                <Button variant="primary">Browse Products</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBids.map((group) => {
              const timeRemaining = formatTimeRemaining(group.product.auctionEndTime);
              const isEnded = timeRemaining === 'Ended' || group.product.status !== 'active';
              const isValidImageUrl = (url: string) => {
                try {
                  new URL(url);
                  return url.startsWith('http://') || url.startsWith('https://');
                } catch {
                  return false;
                }
              };
              const hasValidImage = group.product.images && 
                                   group.product.images.length > 0 && 
                                   isValidImageUrl(group.product.images[0]);

              return (
                <div key={group.product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link href={`/products/${group.product._id}`}>
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                        {hasValidImage ? (
                          <img
                            src={group.product.images[0]}
                            alt={group.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-3xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {group.product.title}
                        </h3>
                        
                        {/* Status Badge */}
                        <div className="mb-2">
                          {isEnded ? (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              Ended
                            </span>
                          ) : group.isWinning ? (
                            <span className="inline-block items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <div className='flex items-center gap-1'><Trophy size={14} /> Winning</div>
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              <div className='flex items-center gap-1'><TriangleAlert size={14} /> Outbid</div>
                            </span>
                          )}
                        </div>

                        {/* Bid Info */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Your highest:</span>
                            <span className="font-bold text-gray-900">
                              {formatPrice(group.myHighestBid)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Current bid:</span>
                            <span className={`font-bold ${
                              group.isWinning ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {formatPrice(group.product.currentBid)}
                            </span>
                          </div>
                        </div>

                        {/* Time Remaining */}
                        {!isEnded && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <span><Timer size={20}/></span>
                            <span>{timeRemaining}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Action Footer */}
                  <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      {group.myBids.length} {group.myBids.length === 1 ? 'bid' : 'bids'}
                    </div>
                    {!isEnded && !group.isWinning ? (
                      <Link href={`/products/${group.product._id}`}>
                        <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                          Bid Higher
                        </button>
                      </Link>
                    ) : isEnded && group.isWinning ? (
                      <Link href={`/products/${group.product._id}`}>
                        <button className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition">
                          Complete
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/products/${group.product._id}`}>
                        <button className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition">
                          View
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

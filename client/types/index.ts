export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'seller' | 'buyer' | 'admin';
  rating?: number;
  totalTransactions?: number;
  isVerified: boolean;
}

export interface Product {
  _id: string;
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  startingPrice: number;
  currentBid: number;
  buyNowPrice?: number;
  auctionEndTime: string;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface Bid {
  _id: string;
  product: string | Product;
  bidder: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  amount: number;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  product: Product;
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    rating?: number;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  finalAmount: number;
  escrowStatus: 'pending' | 'held' | 'released' | 'refunded';
  deliveryStatus: 'pending' | 'shipped' | 'delivered' | 'disputed';
  paymentStatus: 'pending' | 'completed' | 'refunded';
  escrowFee: number;
  trackingCode?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  seller: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  startingPrice: number;
  currentBid: number;
  buyNowPrice?: number;
  auctionEndTime: Date;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], required: true },
  images: [{ type: String }],
  startingPrice: { type: Number, required: true },
  currentBid: { type: Number, required: true },
  buyNowPrice: { type: Number },
  auctionEndTime: { type: Date, required: true },
  status: { type: String, enum: ['active', 'sold', 'expired', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProduct>('Product', ProductSchema);
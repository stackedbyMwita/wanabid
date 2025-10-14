import mongoose, { Document, Schema } from 'mongoose';

export interface IBid extends Document {
  product: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const BidSchema = new Schema<IBid>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBid>('Bid', BidSchema);
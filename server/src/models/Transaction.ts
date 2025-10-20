import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  finalAmount: number;
  escrowStatus: 'pending' | 'held' | 'released' | 'refunded';
  deliveryStatus: 'pending' | 'shipped' | 'delivered' | 'disputed';
  paymentStatus: 'pending' | 'completed' | 'refunded';
  escrowFee: number;
  trackingCode?: string;
  createdAt: Date;
  completedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  finalAmount: { type: Number, required: true },
  escrowStatus: { type: String, enum: ['pending', 'held', 'released', 'refunded'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'disputed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  escrowFee: { type: Number, required: true },
  trackingCode: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

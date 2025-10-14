import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userType: 'seller' | 'buyer' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  rating?: number;
  totalTransactions?: number;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: [true, 'First name is required.'] },
  lastName: { type: String, required: [true, 'Last name is required.'] },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['seller', 'buyer', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);

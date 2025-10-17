import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Transaction from '../models/Transaction';
import Product from '../models/Product';
import User from '../models/User';
import Bid from '../models/Bid';
import { auth, isAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create transaction after auction ends (winner pays)
router.post(
  '/create/:productId',
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findById(req.params.productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if auction has ended
      if (new Date() < product.auctionEndTime) {
        return res.status(400).json({ message: 'Auction is still active' });
      }

      if (product.status !== 'active') {
        return res.status(400).json({ message: 'Product already sold or cancelled' });
      }

      // Get the highest bidder
      const highestBid = await Bid.findOne({ product: product._id })
        .sort({ amount: -1 })
        .populate('bidder');

      if (!highestBid) {
        product.status = 'expired';
        await product.save();
        return res.status(400).json({ message: 'No bids placed on this product' });
      }

      // Verify the user is the highest bidder
      if (highestBid.bidder._id.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Only the winning bidder can create transaction' });
      }

      // Check if transaction already exists
      const existingTransaction = await Transaction.findOne({ product: product._id });
      if (existingTransaction) {
        return res.status(400).json({ message: 'Transaction already exists for this product' });
      }

      // Calculate escrow fee (5%)
      const escrowFeePercent = 0.05;
      const escrowFee = highestBid.amount * escrowFeePercent;

      // Create transaction
      const transaction = new Transaction({
        product: product._id,
        seller: product.seller,
        buyer: highestBid.bidder._id,
        finalAmount: highestBid.amount,
        escrowFee,
        escrowStatus: 'pending',
        deliveryStatus: 'pending',
        paymentStatus: 'pending'
      });

      await transaction.save();

      // Update product status
      product.status = 'sold';
      await product.save();

      await transaction.populate(['product', 'seller', 'buyer']);

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction,
        totalAmount: highestBid.amount + escrowFee,
        breakdown: {
          productPrice: highestBid.amount,
          escrowFee: escrowFee,
          total: highestBid.amount + escrowFee
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update payment status (simulate M-Pesa payment)
router.post(
  '/:transactionId/payment',
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const transaction = await Transaction.findById(req.params.transactionId);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Only buyer can mark payment
      if (transaction.buyer.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Only buyer can update payment status' });
      }

      if (transaction.paymentStatus === 'completed') {
        return res.status(400).json({ message: 'Payment already completed' });
      }

      transaction.paymentStatus = 'completed';
      transaction.escrowStatus = 'held';

      await transaction.save();

      res.json({
        message: 'Payment confirmed. Funds held in escrow.',
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Seller marks item as shipped
router.post(
  '/:transactionId/ship',
  auth,
  [body('trackingNumber').optional().isString()],
  async (req: AuthRequest, res: Response) => {
    try {
      const transaction = await Transaction.findById(req.params.transactionId);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Only seller can mark as shipped
      if (transaction.seller.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Only seller can update shipping status' });
      }

      if (transaction.paymentStatus !== 'completed') {
        return res.status(400).json({ message: 'Payment must be completed first' });
      }

      if (transaction.deliveryStatus !== 'pending') {
        return res.status(400).json({ message: 'Item already shipped or delivered' });
      }

      transaction.deliveryStatus = 'shipped';
      if (req.body.trackingNumber) {
        transaction.trackingNumber = req.body.trackingNumber;
      }

      await transaction.save();

      res.json({
        message: 'Item marked as shipped',
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Buyer confirms delivery
router.post(
  '/:transactionId/confirm-delivery',
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const transaction = await Transaction.findById(req.params.transactionId);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Only buyer can confirm delivery
      if (transaction.buyer.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Only buyer can confirm delivery' });
      }

      // Prevent confirming if already delivered
      if (transaction.deliveryStatus === 'delivered') {
        return res.status(400).json({ message: 'Delivery already confirmed' });
      }
      
      // Require item to be shipped before confirming delivery
      if (transaction.deliveryStatus !== 'shipped') {
        return res.status(400).json({ message: 'Item must be shipped first' });
      }

      
      // Mark as delivered and release escrow
      transaction.deliveryStatus = 'delivered';
      transaction.escrowStatus = 'released';
      transaction.completedAt = new Date();

      await transaction.save();

      // Update user ratings/transactions count
      const seller = await User.findById(transaction.seller);
      const buyer = await User.findById(transaction.buyer);

      if (seller) {
        seller.totalTransactions = (seller.totalTransactions || 0) + 1;
        await seller.save();
      }

      if (buyer) {
        buyer.totalTransactions = (buyer.totalTransactions || 0) + 1;
        await buyer.save();
      }

      res.json({
        message: 'Delivery confirmed. Funds released to seller.',
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Dispute transaction
router.post(
  '/:transactionId/dispute',
  auth,
  [body('reason').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transaction = await Transaction.findById(req.params.transactionId);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Only buyer or seller can raise dispute
      const userId = req.user.userId;
      if (
        transaction.buyer.toString() !== userId &&
        transaction.seller.toString() !== userId
      ) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (transaction.escrowStatus === 'released' || transaction.escrowStatus === 'refunded') {
        return res.status(400).json({ message: 'Transaction already completed' });
      }

      transaction.deliveryStatus = 'disputed';
      // You can add a disputes field to track dispute details

      await transaction.save();

      res.json({
        message: 'Dispute raised. Admin will review.',
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user's transactions (as buyer)
router.get('/my-purchases', auth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ buyer: req.user.userId })
      .populate('product')
      .populate('seller', 'firstName lastName phone rating')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's transactions (as seller)
router.get('/my-sales', auth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ seller: req.user.userId })
      .populate('product')
      .populate('buyer', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single transaction details
router.get('/:transactionId', auth, async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('product')
      .populate('seller', 'firstName lastName phone email rating')
      .populate('buyer', 'firstName lastName phone email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Only buyer, seller, or admin can view
    const userId = req.user.userId;
    if (
      transaction.buyer._id.toString() !== userId &&
      transaction.seller._id.toString() !== userId &&
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Resolve dispute
router.post(
  '/:transactionId/resolve',
  [auth, isAdmin],
  [body('resolution').isIn(['release', 'refund'])],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transaction = await Transaction.findById(req.params.transactionId);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.deliveryStatus !== 'disputed') {
        return res.status(400).json({ message: 'Transaction is not disputed' });
      }

      const { resolution } = req.body;

      if (resolution === 'release') {
        transaction.escrowStatus = 'released';
        transaction.deliveryStatus = 'delivered';
        transaction.completedAt = new Date();
      } else if (resolution === 'refund') {
        transaction.escrowStatus = 'refunded';
        transaction.paymentStatus = 'refunded';
      }

      await transaction.save();

      res.json({
        message: `Dispute resolved: ${resolution}`,
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin: Get all transactions
router.get('/admin/all', [auth, isAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .populate('product')
      .populate('seller', 'firstName lastName email')
      .populate('buyer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

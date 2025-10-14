import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Bid from '../models/Bid';
import Product from '../models/Product';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { auth, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Place a bid
router.post(
  '/',
  [
    auth,
    body('productId').isMongoId(),
    body('amount').isFloat({ min: 1 })
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, amount } = req.body;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if auction is still active
      if (product.status !== 'active') {
        return res.status(400).json({ message: 'Auction is not active' });
      }

      if (new Date() > product.auctionEndTime) {
        product.status = 'expired';
        await product.save();
        return res.status(400).json({ message: 'Auction has ended' });
      }

      // Sellers can't bid on their own products
      if (product.seller.toString() === req.user.userId) {
        return res.status(400).json({ message: 'Cannot bid on your own product' });
      }

      // Check minimum bid increment (e.g., at least KES 10 more than current bid)
      const minIncrement = 10;
      if (amount < product.currentBid + minIncrement) {
        return res.status(400).json({ 
          message: `Bid must be at least KES ${minIncrement} higher than current bid` 
        });
      }

      // Check if user is already the highest bidder
      const lastBid = await Bid.findOne({ product: productId })
        .sort({ createdAt: -1 });

      if (lastBid && lastBid.bidder.toString() === req.user.userId) {
        return res.status(400).json({ message: 'You are already the highest bidder' });
      }

      // Create the bid
      const bid = new Bid({
        product: productId,
        bidder: req.user.userId,
        amount
      });

      await bid.save();

      // Update product's current bid
      product.currentBid = amount;
      await product.save();

      await bid.populate('bidder', 'name');

      res.status(201).json({
        message: 'Bid placed successfully',
        bid,
        product: {
          id: product._id,
          currentBid: product.currentBid
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Buy now (instant purchase)
router.post(
  '/buy-now/:productId',
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findById(req.params.productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (!product.buyNowPrice) {
        return res.status(400).json({ message: 'Buy now option not available' });
      }

      if (product.status !== 'active') {
        return res.status(400).json({ message: 'Product is not available' });
      }

      if (product.seller.toString() === req.user.userId) {
        return res.status(400).json({ message: 'Cannot buy your own product' });
      }

      // Mark product as sold
      product.status = 'sold';
      product.currentBid = product.buyNowPrice;
      await product.save();

      // Create transaction
      const escrowFeePercent = 0.05; // 5% escrow fee
      const escrowFee = product.buyNowPrice * escrowFeePercent;

      const transaction = new Transaction({
        product: product._id,
        seller: product.seller,
        buyer: req.user.userId,
        finalAmount: product.buyNowPrice,
        escrowFee,
        escrowStatus: 'pending',
        deliveryStatus: 'pending',
        paymentStatus: 'pending'
      });

      await transaction.save();

      res.json({
        message: 'Purchase successful',
        transaction,
        totalAmount: product.buyNowPrice + escrowFee
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user's bids
router.get('/my-bids', auth, async (req: AuthRequest, res: Response) => {
  try {
    const bids = await Bid.find({ bidder: req.user.userId })
      .populate('product')
      .sort({ createdAt: -1 });

    // Group by product and show if user is winning
    const bidsByProduct = bids.reduce((acc: any, bid: any) => {
      const productId = bid.product._id.toString();
      if (!acc[productId]) {
        acc[productId] = {
          product: bid.product,
          myBids: [],
          isWinning: false,
          myHighestBid: 0
        };
      }
      acc[productId].myBids.push(bid);
      if (bid.amount > acc[productId].myHighestBid) {
        acc[productId].myHighestBid = bid.amount;
      }
      // Check if this is the current highest bid
      if (bid.product.currentBid === bid.amount) {
        acc[productId].isWinning = true;
      }
      return acc;
    }, {});

    res.json(Object.values(bidsByProduct));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bid history for a product
router.get('/product/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const bids = await Bid.find({ product: req.params.productId })
      .populate('bidder', 'name')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

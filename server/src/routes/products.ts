import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product';
import { auth, isSeller, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Get all active products (public)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, condition, minPrice, maxPrice, search } = req.query;
    
    let query: any = { status: 'active', auctionEndTime: { $gt: new Date() } };
    
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.currentBid = {};
      if (minPrice) query.currentBid.$gte = Number(minPrice);
      if (maxPrice) query.currentBid.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('seller', 'firstName lastName rating')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product with bid history
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'firstName lastName email phone rating totalTransactions');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get bid history
    const Bid = mongoose.model('Bid');
    const bids = await Bid.find({ product: product._id })
      .populate('bidder', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ product, bids });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (sellers only)
router.post(
  '/',
  [
    auth,
    isSeller,
    body('title').trim().isLength({ min: 5, max: 100 }),
    body('description').trim().isLength({ min: 20, max: 1000 }),
    body('category').notEmpty(),
    body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']),
    body('startingPrice').isFloat({ min: 1 }),
    body('auctionDuration').isInt({ min: 1, max: 30 }) // days
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        category,
        condition,
        startingPrice,
        buyNowPrice,
        auctionDuration,
        images
      } = req.body;

      const auctionEndTime = new Date();
      auctionEndTime.setDate(auctionEndTime.getDate() + auctionDuration);

      const product = new Product({
        seller: req.user.userId,
        title,
        description,
        category,
        condition,
        images: images || [],
        startingPrice,
        currentBid: startingPrice,
        buyNowPrice,
        auctionEndTime,
        status: 'active'
      });

      await product.save();
      await product.populate('seller', 'firstName lastName rating');

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update product (seller only, only if no bids yet)
router.put('/:id', auth, isSeller, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if there are any bids
    const Bid = mongoose.model('Bid');
    const bidCount = await Bid.countDocuments({ product: product._id });
    
    if (bidCount > 0) {
      return res.status(400).json({ message: 'Cannot edit product with existing bids' });
    }

    const { title, description, category, condition, images, buyNowPrice } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (images) product.images = images;
    if (buyNowPrice) product.buyNowPrice = buyNowPrice;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel product (seller only, only if no bids)
router.delete('/:id', auth, isSeller, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const Bid = mongoose.model('Bid');
    const bidCount = await Bid.countDocuments({ product: product._id });
    
    if (bidCount > 0) {
      return res.status(400).json({ message: 'Cannot cancel product with existing bids' });
    }

    product.status = 'cancelled';
    await product.save();

    res.json({ message: 'Product cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get seller's products
router.get('/seller/my-products', auth, isSeller, async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find({ seller: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

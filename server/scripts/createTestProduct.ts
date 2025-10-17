import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product';
import User from '../src/models/User';

dotenv.config();

const createTestProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');

    // Find a seller (or use the first user)
    const seller = await User.findOne({ userType: 'seller' });
    
    if (!seller) {
      console.log('No seller found. Please register a seller first.');
      process.exit(1);
    }

    const testProducts = [
      {
        seller: seller._id,
        title: 'iPhone 12 Pro Max 256GB - Like New',
        description: 'Barely used for 6 months. Perfect condition with original box, charger, and earphones. No scratches on screen.',
        category: 'Electronics',
        condition: 'like-new',
        images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500'],
        startingPrice: 45000,
        currentBid: 45000,
        buyNowPrice: 60000,
        auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'active'
      },
      {
        seller: seller._id,
        title: 'MacBook Air M1 2020 - 8GB RAM',
        description: 'Excellent condition. Used for light coding and browsing. Battery health 95%. Comes with original charger.',
        category: 'Electronics',
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        startingPrice: 70000,
        currentBid: 70000,
        buyNowPrice: 85000,
        auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        seller: seller._id,
        title: 'Engineering Mathematics Textbook',
        description: 'Complete set of engineering math books. Minimal highlighting. Perfect for first and second year students.',
        category: 'Books',
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
        startingPrice: 1500,
        currentBid: 1500,
        buyNowPrice: 3000,
        auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        seller: seller._id,
        title: 'Nike Air Force 1 - Size 42',
        description: 'Authentic Nike shoes. Worn a few times. Still in great shape. Perfect for casual wear.',
        category: 'Fashion',
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
        startingPrice: 3000,
        currentBid: 3000,
        buyNowPrice: 5000,
        auctionEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        seller: seller._id,
        title: 'Study Desk with Chair',
        description: 'Wooden desk with matching chair. Perfect for students. Sturdy and spacious. Local pickup only.',
        category: 'Furniture',
        condition: 'fair',
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'],
        startingPrice: 2500,
        currentBid: 2500,
        auctionEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ];

    await Product.insertMany(testProducts);
    console.log('✅ Test products created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestProduct();

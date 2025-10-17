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
    description: 'Barely used for 6 months. Perfect condition with original box, charger, and earphones.',
    category: 'Electronics',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500'],
    startingPrice: 45000,
    currentBid: 45000,
    buyNowPrice: 60000,
    auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'MacBook Air M1 2020 - 8GB RAM',
    description: 'Excellent condition. Used for light coding and browsing. Battery health 95%. Comes with charger.',
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
    description: 'Minimal highlighting. Perfect for first and second-year engineering students.',
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
    description: 'Authentic Nike sneakers. Worn twice. Great condition.',
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
    description: 'Wooden desk with matching chair. Perfect for students. Sturdy and spacious.',
    category: 'Furniture',
    condition: 'fair',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'],
    startingPrice: 2500,
    currentBid: 2500,
    buyNowPrice: 4000,
    auctionEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Samsung 55" 4K Smart TV',
    description: 'Crystal UHD display, HDR support, barely used for a year.',
    category: 'Electronics',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500'],
    startingPrice: 35000,
    currentBid: 35000,
    buyNowPrice: 48000,
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Gaming Chair - Ergonomic Design',
    description: 'High back, lumbar support, and reclining function for ultimate comfort.',
    category: 'Furniture',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1606813902911-7bdb97e3b55a?w=500'],
    startingPrice: 8000,
    currentBid: 8000,
    buyNowPrice: 12000,
    auctionEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Canon EOS M50 Mirrorless Camera',
    description: 'Compact, 24MP, includes kit lens and original box. Perfect for creators.',
    category: 'Electronics',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500'],
    startingPrice: 50000,
    currentBid: 50000,
    buyNowPrice: 65000,
    auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Adidas Ultraboost 22 - Size 43',
    description: 'Top-tier running shoes. Lightly worn, clean soles, no odor.',
    category: 'Fashion',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1600180758890-6c3a3aa59b70?w=500'],
    startingPrice: 4000,
    currentBid: 4000,
    buyNowPrice: 6500,
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'HP Envy 15 Laptop - i7 16GB RAM',
    description: 'Great condition. Powerful performance for professionals.',
    category: 'Electronics',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500'],
    startingPrice: 60000,
    currentBid: 60000,
    buyNowPrice: 75000,
    auctionEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Noise-canceling, wireless, used for 3 months. Superb condition.',
    category: 'Electronics',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1580894908361-967195033215?w=500'],
    startingPrice: 25000,
    currentBid: 25000,
    buyNowPrice: 32000,
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Leather Office Chair - Reclining',
    description: 'Premium black leather. Ergonomic and adjustable.',
    category: 'Furniture',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1606813902911-7bdb97e3b55a?w=500'],
    startingPrice: 7000,
    currentBid: 7000,
    buyNowPrice: 10000,
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Apple Watch Series 7',
    description: 'Starlight color, GPS + Cellular, with box and charger.',
    category: 'Electronics',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=500'],
    startingPrice: 35000,
    currentBid: 35000,
    buyNowPrice: 48000,
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Wooden Bookshelf - 5 Tier',
    description: 'Modern minimalistic design. Perfect for living rooms or offices.',
    category: 'Furniture',
    condition: 'fair',
    images: ['https://images.unsplash.com/photo-1586105251261-72a756497a12?w=500'],
    startingPrice: 3000,
    currentBid: 3000,
    buyNowPrice: 4500,
    auctionEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Kitchen Blender - Philips HR2221',
    description: '600W motor, 2L jar, and multiple speed settings.',
    category: 'Appliances',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1606813902911-7bdb97e3b55a?w=500'],
    startingPrice: 3500,
    currentBid: 3500,
    buyNowPrice: 5000,
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Gucci Leather Belt - Authentic',
    description: 'Real leather, minimal wear, original buckle.',
    category: 'Fashion',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1618354691542-3b4a7030c9e4?w=500'],
    startingPrice: 9000,
    currentBid: 9000,
    buyNowPrice: 13000,
    auctionEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Samsung Galaxy S21 Ultra 5G',
    description: '12GB RAM, 256GB storage, with charger and case.',
    category: 'Electronics',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1616486338812-3d51d58b4f87?w=500'],
    startingPrice: 65000,
    currentBid: 65000,
    buyNowPrice: 82000,
    auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
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

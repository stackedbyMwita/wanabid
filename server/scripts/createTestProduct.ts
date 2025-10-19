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
    images: ['https://images.unsplash.com/photo-1605389086558-f7397e55097e?w=500'], // Updated: Image of an iPhone 12 Pro Max
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
    images: ['https://images.unsplash.com/photo-1541807084509-6799052b46a2?w=500'], // Updated: Image of a MacBook Air M1
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
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'], // Valid book stack image
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
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d2a?w=500'], // Updated: Image of white Nike Air Force 1
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
    images: ['https://images.unsplash.com/photo-1592078615299-0ef780074251?w=500'], // Updated: Image of a study desk and chair setup
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
    images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500'], // Updated: Image of a large modern smart TV
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
    images: ['https://images.unsplash.com/photo-1591850122709-32201b22557e?w=500'], // Updated: Image of an ergonomic gaming chair
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
    images: ['https://images.unsplash.com/photo-1517030588806-8d6f51944e05?w=500'], // Updated: Image of a mirrorless camera
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
    images: ['https://images.unsplash.com/photo-1606107555858-f4017743714c?w=500'], // Updated: Image of Adidas running shoes
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
    images: ['https://images.unsplash.com/photo-1546879853-41ed499a099f?w=500'], // Updated: Image of an HP laptop
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
    images: ['https://images.unsplash.com/photo-1594247065963-71f654060803?w=500'], // Updated: Image of Sony WH-1000XM4 style headphones
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
    images: ['https://images.unsplash.com/photo-1597014169736-2184d2f0945a?w=500'], // Updated: Image of a leather office chair
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
    images: ['https://images.unsplash.com/photo-1617043325875-a8e1329a43a7?w=500'], // Updated: Image of an Apple Watch
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
    images: ['https://images.unsplash.com/photo-1574932014902-8a9d1d374d6c?w=500'], // Updated: Image of a wooden bookshelf
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
    images: ['https://images.unsplash.com/photo-1585888636919-4971c0c6913c?w=500'], // Updated: Image of a kitchen blender
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
    images: ['https://images.unsplash.com/photo-1599815049926-0e5a8f4c3917?w=500'], // Updated: Image of a designer leather belt
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
    images: ['https://images.unsplash.com/photo-1610945415295-d97f50d3d520?w=500'], // Updated: Image of a Samsung Galaxy S21 Ultra
    startingPrice: 65000,
    currentBid: 65000,
    buyNowPrice: 82000,
    auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Bose Portable Home Speaker',
    description: '360° sound, built-in voice control. Perfect for parties or home use.',
    category: 'Electronics',
    condition: 'new',
    images: ['https://images.unsplash.com/photo-1598462706531-158229497ce9?w=500'], // New: Portable Speaker
    startingPrice: 18000,
    currentBid: 18000,
    buyNowPrice: 24000,
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Espresso Tamper & Mat Set',
    description: 'Professional stainless steel tamper (58mm) and silicone tamping mat.',
    category: 'Appliances',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1597486414777-24a64010531c?w=500'], // New: Coffee Accessories
    startingPrice: 4000,
    currentBid: 4000,
    buyNowPrice: 6000,
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Tumi Alpha 3 Briefcase',
    description: 'Ballistic nylon travel briefcase. Laptop sleeve, multiple pockets. Monogram removed.',
    category: 'Fashion',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1634812328731-01f786938363?w=500'], // New: Professional Briefcase
    startingPrice: 45000,
    currentBid: 45000,
    buyNowPrice: 60000,
    auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Nintendo Switch OLED - White',
    description: 'Console with a vibrant 7-inch OLED screen. Used for 4 months. Complete in box.',
    category: 'Gaming',
    condition: 'new',
    images: ['https://images.unsplash.com/photo-1611186871348-aa1da6a85810?w=500'], // New: Nintendo Switch Console
    startingPrice: 38000,
    currentBid: 38000,
    buyNowPrice: 48000,
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Vintage Persian Rug (2m x 3m)',
    description: 'Hand-knotted wool rug. Rich colors, minimal wear. Recently professionally cleaned.',
    category: 'Home Goods',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1511210926861-5369661f4c71?w=500'], // New: Vintage Rug
    startingPrice: 20000,
    currentBid: 20000,
    buyNowPrice: 35000,
    auctionEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Patagonia Puffer Jacket - Men\'s M',
    description: 'Down-filled jacket, black. Ideal for cold weather. No rips or stains.',
    category: 'Fashion',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1600813089408-4107147814b2?w=500'], // New: Puffer Jacket
    startingPrice: 9000,
    currentBid: 9000,
    buyNowPrice: 14000,
    auctionEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Electric Scooter - Segway Ninebot Max',
    description: 'Max speed 30km/h, 65km range. Foldable. Great for city commute. Minor scratches.',
    category: 'Vehicles',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1563273398-e7e685f00e39?w=500'], // New: Electric Scooter
    startingPrice: 40000,
    currentBid: 40000,
    buyNowPrice: 55000,
    auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Air Purifier - HEPA Filter and UV-C',
    description: 'Covers up to 30m². Used for a few months, needs filter replacement soon.',
    category: 'Appliances',
    condition: 'fair',
    images: ['https://images.unsplash.com/photo-1630138986877-e230872851d0?w=500'], // New: Air Purifier
    startingPrice: 7000,
    currentBid: 7000,
    buyNowPrice: 10000,
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Set of Dumbbells (2x10kg)',
    description: 'Cast iron hexagonal dumbbells. Great for home gym setup.',
    category: 'Sports & Fitness',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1581452140409-9f796078d461?w=500'], // New: Dumbbells
    startingPrice: 3500,
    currentBid: 3500,
    buyNowPrice: 5000,
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Nikon Z6 II Mirrorless Camera',
    description: 'Full-frame mirrorless. Body only, low shutter count. Purchased last year.',
    category: 'Electronics',
    condition: 'new',
    images: ['https://images.unsplash.com/photo-1600185387498-f29e31d5ac63?w=500'], // New: High-end Camera
    startingPrice: 150000,
    currentBid: 150000,
    buyNowPrice: 185000,
    auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'Diamond Stud Earrings (1.0 Total Carat)',
    description: 'Round brilliant cut diamonds set in 14K white gold. GIA certified.',
    category: 'Jewelry',
    condition: 'like-new',
    images: ['https://images.unsplash.com/photo-1621259182978-fbf852c0616e?w=500'], // New: Diamond Studs
    startingPrice: 80000,
    currentBid: 80000,
    buyNowPrice: 110000,
    auctionEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'LEGO Star Wars Millennium Falcon',
    description: '75257 set. Complete with instructions and box. Displayed only, never played with.',
    category: 'Toys & Collectibles',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1598380387588-4e0828551980?w=500'], // New: LEGO Millennium Falcon
    startingPrice: 15000,
    currentBid: 15000,
    buyNowPrice: 20000,
    auctionEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    seller: seller._id,
    title: 'French Press Coffee Maker (1L)',
    description: 'Stainless steel insulated design. Keeps coffee hot for hours. Clean filter.',
    category: 'Appliances',
    condition: 'new',
    images: ['https://images.unsplash.com/photo-1596489392263-d15f2105156f?w=500'], // New: French Press
    startingPrice: 1800,
    currentBid: 1800,
    buyNowPrice: 3000,
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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

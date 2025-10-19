'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { MoveLeft, Smartphone, LibraryBig, Shirt, Armchair, Volleyball, Gift } from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics', icon: <Smartphone />, value: 'Electronics' },
  { name: 'Books', icon: <LibraryBig />, value: 'Books' },
  { name: 'Fashion', icon: <Shirt />, value: 'Fashion' },
  { name: 'Furniture', icon: <Armchair />, value: 'Furniture' },
  { name: 'Sports', icon: <Volleyball />, value: 'Sports' },
  { name: 'Other', icon: <Gift />, value: 'Other' },
];

const CONDITIONS = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like-new', label: 'Like New', description: 'Barely used, excellent condition' },
  { value: 'good', label: 'Good', description: 'Used with minor wear' },
  { value: 'fair', label: 'Fair', description: 'Used with visible wear' },
  { value: 'poor', label: 'Poor', description: 'Heavy wear, functional' },
];

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    startingPrice: '',
    buyNowPrice: '',
    auctionDuration: '7',
    images: '',
  });
  const [errors, setErrors] = useState<any>({});

  // Redirect if not a seller
  if (user?.userType !== 'seller') {
    router.push('/dashboard');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.title.trim() || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select item condition';
    }

    const startPrice = Number(formData.startingPrice);
    if (!formData.startingPrice || startPrice < 1) {
      newErrors.startingPrice = 'Starting price must be at least KES 1';
    }

    if (formData.buyNowPrice) {
      const buyPrice = Number(formData.buyNowPrice);
      if (buyPrice <= startPrice) {
        newErrors.buyNowPrice = 'Buy now price must be higher than starting price';
      }
    }

    const duration = Number(formData.auctionDuration);
    if (!duration || duration < 1 || duration > 30) {
      newErrors.auctionDuration = 'Duration must be between 1 and 30 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const imageUrls = formData.images
        ? formData.images.split('\n').map(url => url.trim()).filter(url => url)
        : [];

      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        startingPrice: Number(formData.startingPrice),
        buyNowPrice: formData.buyNowPrice ? Number(formData.buyNowPrice) : undefined,
        auctionDuration: Number(formData.auctionDuration),
        images: imageUrls,
      };

      const product = await productsAPI.create(productData);
      toast.success('Listing created successfully!');
      router.push(`/products/${product._id}`);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10 md:pb-8">
      {/* Back Button */}
      <div className="sticky top-32.5 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 border border-gray-200 p-2 rounded-md  text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
        >
          <span className="">
            <MoveLeft size={20} />
          </span>
          <span>Back</span>
        </button>
      </div>
      <div className="max-w-2xl bg-white mx-auto px-4 py-6">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Tips for Success</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use clear, descriptive titles</li>
                <li>• Add detailed descriptions with condition info</li>
                <li>• Set competitive starting prices</li>
                <li>• Add high-quality image URLs</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Product Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g., iPhone 12 Pro Max 256GB - Like New"
            maxLength={100}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your item in detail. Include:
- Current condition
- Age/usage history
- What's included
- Any defects or issues
- Reason for selling"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 transition text-center cursor-pointer ${
                    formData.category === cat.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl text-blue-600">{cat.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{cat.value}</div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <div className="space-y-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: cond.value })}
                  className={`w-full p-4 rounded-lg border-2 transition text-left ${
                    formData.condition === cond.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-gray-900">{cond.label}</div>
                  <div className="text-sm text-gray-600">{cond.description}</div>
                </button>
              ))}
            </div>
            {errors.condition && (
              <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-gray-100 text-gray-600 border border-dashed border-gray-300 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-600">Pricing</h3>
            
            <Input
              label="Starting Price (KES)"
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              error={errors.startingPrice}
              placeholder="5000"
              min="1"
            />

            <Input
              label="Buy Now Price (KES) - Optional"
              type="number"
              name="buyNowPrice"
              value={formData.buyNowPrice}
              onChange={handleChange}
              error={errors.buyNowPrice}
              placeholder="7000"
              min="1"
            />
            <p className="text-xs text-gray-500">
              Buyers can instantly purchase at this price without waiting for auction to end
            </p>
          </div>

          {/* Auction Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auction Duration
            </label>
            <select
              name="auctionDuration"
              value={formData.auctionDuration}
              onChange={handleChange}
              className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days (Recommended)</option>
              <option value="10">10 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
            {errors.auctionDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.auctionDuration}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URLs (Optional)
            </label>
            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              rows={4}
              className="w-full text-gray-400 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg
(One URL per line)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add image URLs from Imgur, Unsplash, or other image hosting services
            </p>
          </div>

          {/* Submit Button */}
          <div className="py-4 bg-white border-t border-gray-200 -mx-4 px-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { apiClient } from './client';
import { Product } from '@/types';

export const productsAPI = {
  getAll: async (params?: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Product[]> => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ product: Product; bids: any[] }> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description: string;
    category: string;
    condition: string;
    startingPrice: number;
    buyNowPrice?: number;
    auctionDuration: number;
    images?: string[];
  }): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  getMyProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products/seller/my-products');
    return response.data;
  },
};

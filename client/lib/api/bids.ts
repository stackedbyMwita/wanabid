import { apiClient } from './client';
import { Bid } from '@/types';

export const bidsAPI = {
  placeBid: async (data: {
    productId: string;
    amount: number;
  }): Promise<{ message: string; bid: Bid; product: any }> => {
    const response = await apiClient.post('/bids', data);
    return response.data;
  },

  buyNow: async (productId: string): Promise<any> => {
    const response = await apiClient.post(`/bids/buy-now/${productId}`);
    return response.data;
  },

  getMyBids: async (): Promise<any[]> => {
    const response = await apiClient.get('/bids/my-bids');
    return response.data;
  },

  getProductBids: async (productId: string): Promise<Bid[]> => {
    const response = await apiClient.get(`/bids/product/${productId}`);
    return response.data;
  },
};

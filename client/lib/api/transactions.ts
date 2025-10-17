import { apiClient } from './client';
import { Transaction } from '@/types';

export const transactionsAPI = {
  create: async (productId: string): Promise<any> => {
    const response = await apiClient.post(`/transactions/create/${productId}`);
    return response.data;
  },

  updatePayment: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.post(`/transactions/${transactionId}/payment`);
    return response.data;
  },

  markAsShipped: async (
    transactionId: string,
    trackingNumber?: string
  ): Promise<Transaction> => {
    const response = await apiClient.post(`/transactions/${transactionId}/ship`, {
      trackingNumber,
    });
    return response.data;
  },

  confirmDelivery: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.post(`/transactions/${transactionId}/confirm-delivery`);
    return response.data;
  },

  raiseDispute: async (
    transactionId: string,
    reason: string
  ): Promise<Transaction> => {
    const response = await apiClient.post(`/transactions/${transactionId}/dispute`, {
      reason,
    });
    return response.data;
  },

  getMyPurchases: async (): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions/my-purchases');
    return response.data;
  },

  getMySales: async (): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions/my-sales');
    return response.data;
  },

  getById: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return response.data;
  },
};

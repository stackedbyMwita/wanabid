import { apiClient } from './client';
import { User, Product, Transaction } from '@/types';

export const adminAPI = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/auth/users');
    return response.data.users;
  },

  // Get all transactions
  getAllTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions/admin/all');
    return response.data;
  },

  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  // Resolve dispute
  resolveDispute: async (
    transactionId: string,
    resolution: 'release' | 'refund'
  ): Promise<Transaction> => {
    const response = await apiClient.post(`/transactions/${transactionId}/resolve`, {
      resolution,
    });
    return response.data.transaction;
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalTransactions: number;
    totalRevenue: number;
    activeAuctions: number;
    pendingDisputes: number;
  }> => {
    // This will aggregate data from multiple endpoints
    const [users, products, transactions] = await Promise.all([
      adminAPI.getAllUsers(),
      adminAPI.getAllProducts(),
      adminAPI.getAllTransactions(),
    ]);

    return {
      totalUsers: users.length,
      totalProducts: products.length,
      totalTransactions: transactions.length,
      totalRevenue: transactions
        .filter((t) => t.escrowStatus === 'released')
        .reduce((sum, t) => sum + t.escrowFee, 0),
      activeAuctions: products.filter((p) => p.status === 'active').length,
      pendingDisputes: transactions.filter((t) => t.deliveryStatus === 'disputed').length,
    };
  },
};

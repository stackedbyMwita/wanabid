'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Star,
  ShoppingBag,
  Store,
  Shield,
  Filter,
  Download,
} from 'lucide-react';

type UserFilter = 'all' | 'buyer' | 'seller' | 'admin';
type StatusFilter = 'all' | 'verified' | 'unverified';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    // User type filter
    const matchesUserType = userFilter === 'all' || user.userType === userFilter;

    // Verification filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && user.isVerified) ||
      (statusFilter === 'unverified' && !user.isVerified);

    return matchesSearch && matchesUserType && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    buyers: users.filter((u) => u.userType === 'buyer').length,
    sellers: users.filter((u) => u.userType === 'seller').length,
    admins: users.filter((u) => u.userType === 'admin').length,
    verified: users.filter((u) => u.isVerified).length,
  };

  // Export users to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Verified', 'Joined'];
    const rows = filteredUsers.map((user) => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.phone,
      user.userType,
      user.isVerified ? 'Yes' : 'No',
      formatDate(user.createdAt || new Date().toISOString()),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanabid-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Users exported to CSV');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>
            <p className="text-gray-600">{filteredUsers.length} users displayed</p>
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.total || 0}</span>
              <div className='bg-blue-600/10 p-2 rounded-md'>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Total Users</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.buyers || 0}</span>
              <div className='bg-green-600/10 p-2 rounded-md'>
                <ShoppingBag className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Buyers</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.sellers || 0}</span>
              <div className='bg-orange-600/10 p-2 rounded-md'>
                <Store className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Sellers</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.admins || 0}</span>
              <div className='bg-purple-600/10 p-2 rounded-md'>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Admins</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
              <span className='text-gray-900'>{stats?.verified || 0}</span>
              <div className='bg-teal-600/10 p-2 rounded-md'>
                <UserCheck className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 py-2">Verified</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <div className="flex gap-2">
                  {(['all', 'buyer', 'seller', 'admin'] as UserFilter[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setUserFilter(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        userFilter === type
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <div className="flex gap-2">
                  {(['all', 'verified', 'unverified'] as StatusFilter[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        statusFilter === status
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          user.userType === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.userType === 'seller'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.userType === 'admin' && <Shield className="w-3 h-3" />}
                        {user.userType === 'seller' && <Store className="w-3 h-3" />}
                        {user.userType === 'buyer' && <ShoppingBag className="w-3 h-3" />}
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-gray-900">
                            {user.rating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          {user.totalTransactions || 0} transactions
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <UserCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          <UserX className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {user.createdAt
                          ? formatDate(user.createdAt)
                          : 'Unknown'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.userType === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.userType === 'seller'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.userType === 'admin' && <Shield className="w-3 h-3" />}
                        {user.userType === 'seller' && <Store className="w-3 h-3" />}
                        {user.userType === 'buyer' && <ShoppingBag className="w-3 h-3" />}
                        {user.userType}
                      </span>
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <UserCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          <UserX className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{user.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-gray-500">
                        • {user.totalTransactions || 0} transactions
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

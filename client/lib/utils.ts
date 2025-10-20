import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatTimeRemaining(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  
  if (now > end) {
    return 'Ended';
  }
  
  return formatDistanceToNow(end, { addSuffix: true });
}

export function formatDate(date: string): string {
  return format(new Date(date), 'PPp');
}

export function getConditionColor(condition: string): string {
  const colors = {
    new: 'text-green-600 bg-green-50',
    'like-new': 'text-blue-600 bg-blue-50',
    good: 'text-yellow-600 bg-yellow-50',
    fair: 'text-orange-600 bg-orange-50',
    poor: 'text-red-600 bg-red-50',
  };
  return colors[condition as keyof typeof colors] || 'text-gray-600 bg-gray-50';
}

export function getStatusColor(status: string): string {
  const colors = {
    active: 'text-green-600 bg-green-50',
    sold: 'text-blue-600 bg-blue-50',
    expired: 'text-gray-600 bg-gray-50',
    cancelled: 'text-red-600 bg-red-50',
    pending: 'text-yellow-600 bg-yellow-50',
    released: 'text-green-600 bg-green-50',
    shipped: 'text-blue-600 bg-blue-50',
    delivered: 'text-green-600 bg-green-50',
    completed: 'text-green-600 bg-green-50',
    disputed: 'text-red-600 bg-red-50',
  };
  return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
}

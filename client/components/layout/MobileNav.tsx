'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Search,
  PlusCircle,
  Target,
  User,
} from 'lucide-react';
import { TbMoneybag } from "react-icons/tb";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/products', icon: Search, label: 'Browse' },
    ...(user?.userType === 'seller'
      ? [{ href: '/create-listing', icon: PlusCircle, label: 'Sell' }]
      : [{ href: '/my-bids', icon: Target, label: 'Bids' }]),
    { href: '/transactions', icon: TbMoneybag, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-blue-500'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 mb-1 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )}
              />
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-[2px] bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

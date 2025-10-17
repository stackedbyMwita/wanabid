'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import Input from '../ui/Input';
import {
  FaUserCircle,
  FaBullseye,
  FaBoxOpen,
  FaPlusCircle,
  FaMoneyBillWave,
  FaSignOutAlt,
} from 'react-icons/fa';

export default function Header() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
              WanaBid
            </span>
          </Link>

          {/* Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-800">
                {user?.firstName}
              </span>
            </button>

            {showMenu && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    <FaUserCircle className="text-blue-600" />
                    My Profile
                  </Link>

                  <Link
                    href="/my-bids"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    <FaBullseye className="text-blue-600" />
                    My Bids
                  </Link>

                  {user?.userType === 'seller' && (
                    <>
                      <Link
                        href="/my-listings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowMenu(false)}
                      >
                        <FaBoxOpen className="text-blue-600" />
                        My Listings
                      </Link>

                      <Link
                        href="/create-listing"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowMenu(false)}
                      >
                        <FaPlusCircle className="text-blue-600" />
                        Create Listing
                      </Link>
                    </>
                  )}

                  <Link
                    href="/transactions"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    <FaMoneyBillWave className="text-blue-600" />
                    Transactions
                  </Link>

                  <hr className="my-2 border-gray-200" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <input
            type="search"
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>
      </div>
    </header>
  );
}

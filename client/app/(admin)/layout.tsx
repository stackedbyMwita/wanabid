import ProtectedRoute from '@/components/layout/ProtectedRoute';
import BreadCrumb from '@/components/ui/BreadCrumb';
import { Shield } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Navigation */}
        <nav className="bg-purple-600 text-white border-b border-purple-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <a href="/admin" className="flex items-center gap-2 text-xl font-bold">
                  <Shield className="w-6 h-6" />
                  Admin Panel
                </a>
                <div className="hidden md:flex gap-4">
                  <a href="/admin/users" className="hover:text-purple-200 transition">
                    Users
                  </a>
                  <a href="/admin/products" className="hover:text-purple-200 transition">
                    Products
                  </a>
                  <a href="/admin/transactions" className="hover:text-purple-200 transition">
                    Transactions
                  </a>
                  <a href="/admin/disputes" className="hover:text-purple-200 transition">
                    Disputes
                  </a>
                </div>
              </div>

              <a
                href="/dashboard"
                className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-800 transition text-sm"
              >
                Exit Admin
              </a>
            </div>
          </div>
        </nav>
        <BreadCrumb />

        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}

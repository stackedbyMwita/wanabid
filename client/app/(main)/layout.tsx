import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
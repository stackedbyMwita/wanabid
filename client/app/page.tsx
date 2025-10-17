import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FaShieldAlt } from "react-icons/fa";
import { TbMoneybag } from "react-icons/tb";
import { PiGraduationCapBold } from "react-icons/pi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">WanaBid</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            The fair marketplace for Kakamega students. Buy and sell second-hand items
            without exploitative middlemen. Bid smart, trade fair.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="secondary" size="lg">
                Browse Items
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 text-blue-600 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">
              <FaShieldAlt />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Escrow</h3>
            <p className="text-gray-600">
              Your money is safe with our escrow system. Payment released only after delivery confirmation.
            </p>
          </div>
          <div className="bg-white text-amber-500 p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">
              <TbMoneybag />
            </div>
            <h3 className="text-xl font-bold mb-2">Fair Prices</h3>
            <p className="text-gray-600">
              No greedy brokers. Bid directly with sellers and get the best deals for your budget.
            </p>
          </div>
          <div className="bg-white text-gray-600 p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">
              <PiGraduationCapBold />
            </div>
            <h3 className="text-xl font-bold mb-2">Student-Focused</h3>
            <p className="text-gray-600">
              Built for comrades. We understand your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

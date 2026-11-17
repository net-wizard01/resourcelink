'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Wallet, Hexagon } from 'lucide-react';

export default function Navbar({ balance }: { balance: number }) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Hexagon className="text-blue-600 fill-blue-600" size={28} />
        <span className="text-xl font-bold text-gray-800 tracking-tight">ResourceLink</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium border border-green-200">
          <Wallet size={18} />
          <span>{balance.toFixed(2)} Credits</span>
        </div>
        <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
                 <Link href="/trades" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            My Trades
          </Link>
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800">{user?.full_name}</p>
            <p className="text-xs text-gray-500">Neighbor</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
}

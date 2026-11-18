'use client';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Wallet, Hexagon, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar({ balance }: { balance: number }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Hexagon className="text-blue-600 fill-blue-600" size={28} />
          <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight hidden md:block">ResourceLink</span>
        </Link>
        
        {pathname !== '/' && (
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg ml-4">
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-medium border border-green-200 dark:border-green-800">
          <Wallet size={18} />
          <span>{balance.toFixed(2)}</span>
          <span className="hidden md:inline">Credits</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 border-l pl-4 md:pl-6 border-gray-200 dark:border-gray-700">
          <Link href="/my-listings" className="hidden md:block text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            My Listings
          </Link>
          <Link href="/messages" className="hidden md:block text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Messages
          </Link>
          <Link href="/trades" className="hidden md:block text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            My Trades
          </Link>
          
          <div className="flex items-center gap-3 ml-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <Link href="/profile" className="text-right hidden lg:block hover:opacity-80 transition-opacity cursor-pointer">
              <p className="text-sm font-bold text-gray-800 dark:text-white">{user?.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
            </Link>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

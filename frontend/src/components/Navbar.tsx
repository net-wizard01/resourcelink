'use client';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Wallet, Hexagon, ArrowLeft, Home, Sun, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Navbar({ balance }: { balance: number }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [pendingTrades, setPendingTrades] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const [msgRes, tradeRes] = await Promise.all([
          api.get('/messages/unread'),
          api.get('/users/me/pending-trades')
        ]);
        setUnreadMsgs(msgRes.data.count);
        setPendingTrades(tradeRes.data.count);
      } catch (err) {
        // Silently fail if token expired
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const Badge = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return (
      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
        {count}
      </span>
    );
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Hexagon className="text-blue-600 fill-blue-600" size={28} />
          <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight hidden md:block">ResourceLink</span>
        </Link>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 ml-4">
          {pathname !== '/' && (
            <Link href="/" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition-colors bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              <Home size={16} /> Home
            </Link>
          )}
          
          {pathname !== '/' && (
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-medium border border-green-200 dark:border-green-800">
          <Wallet size={18} />
          <span>{balance.toFixed(2)}</span>
          <span className="hidden md:inline">Credits</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 border-l pl-4 md:pl-6 border-gray-200 dark:border-slate-700">
          <Link href="/my-listings" className="hidden md:block text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            My Listings
          </Link>
          
          <Link href="/messages" className="hidden md:block relative text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Messages
            <Badge count={unreadMsgs} />
          </Link>

          <Link href="/trades" className="hidden md:block relative text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            My Trades
            <Badge count={pendingTrades} />
          </Link>
          
          <div className="flex items-center gap-3 ml-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <Link href="/profile" className="text-right hidden lg:block hover:opacity-80 transition-opacity cursor-pointer">
              <p className="text-sm font-bold text-gray-800 dark:text-white">{user?.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">View Profile</p>
            </Link>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-slate-800 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

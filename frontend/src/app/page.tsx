'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CreateListing from '@/components/CreateListing';
import NearbyListings from '@/components/NearbyListings';
import MapView from '@/components/MapView';
import { Clock, ShieldCheck, Activity, Wallet, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [nearby, setNearby] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState({ lat: 0, lon: 0 });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    refreshData(user.id);

    const interval = setInterval(() => refreshData(user.id), 10000);
    return () => clearInterval(interval);
  }, [user, router]);

  const refreshData = async (userId: string) => {
    try {
      const balanceRes = await api.get('/users/me/balance');
      setBalance(balanceRes.data.balance);
      setUserLocation({ 
        lat: Number(balanceRes.data.user.latitude), 
        lon: Number(balanceRes.data.user.longitude) 
      });

      const listingsRes = await api.get('/listings/nearby');
      const myId = userId.toLowerCase().trim();
      const others = listingsRes.data.filter((l: any) => l.user_id && l.user_id.toLowerCase().trim() !== myId);
      setNearby(others);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <Navbar balance={balance} />
      
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back, {user.full_name.split(' ')[0]} ??
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-lg">
              What are you looking to trade in your neighborhood today?
            </p>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-500"/> Verified Community</div>
            <div className="flex items-center gap-2"><Activity size={18} className="text-blue-500"/> Hyper-local 5km</div>
          </div>
        </div>

        {/* Main Grid: 3 columns (Left=Wallet, Middle=Create, Right=Listings) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Wallet, How it works, & Map (span 3) */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 p-6 rounded-2xl shadow-lg dark:shadow-blue-900/20 text-white transition-colors duration-300">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-blue-100 flex items-center gap-2">
                  <Wallet size={18}/> Your Wallet
                </h3>
                <TrendingUp size={18} className="text-blue-200" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold">{balance.toFixed(2)}</span>
                <span className="text-blue-200 font-medium">hrs</span>
              </div>
              <p className="text-sm text-blue-200 mt-4">
                Time is the only currency here. Trade your skills or tools to earn more.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">How it works</h3>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">1</div> 
                  Post a skill or tool you have.
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">2</div> 
                  Find neighbors who need it.
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">3</div> 
                  Trade hours and build community.
                </li>
              </ul>
            </div>

            {/* Compact Map in the left column */}
            {userLocation.lat !== 0 && (
              <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <MapView listings={nearby} userLat={userLocation.lat} userLon={userLocation.lon} />
              </div>
            )}

          </div>
          
          {/* Middle Column: Create Listing (span 3 or 4) */}
          <div className="lg:col-span-4">
            <CreateListing onCreated={() => refreshData(user.id)} />
          </div>
          
          {/* Right Column: Nearby Listings (span 5) */}
          <div className="lg:col-span-5">
            <NearbyListings listings={nearby} onTraded={() => refreshData(user.id)} />
          </div>

        </div>
      </main>
    </div>
  );
}

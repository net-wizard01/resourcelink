'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CreateListing from '@/components/CreateListing';
import NearbyListings from '@/components/NearbyListings';
import MapView from '@/components/MapView';
import { Clock, ShieldCheck, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [nearby, setNearby] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState({ lat: 0, lon: 0 });

  useEffect(() => {
    if (!user) { 
      router.push('/login'); 
      return; 
    }
    
    refreshData(user.id);
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
      
      // Filter out our own listings
      const others = listingsRes.data.filter((l: any) => l.user_id && l.user_id.toLowerCase().trim() !== myId);   setNearby(others);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar balance={balance} />
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user.full_name.split(' ')[0]} ??</h1>
            <p className="text-gray-500 mt-2 text-lg">What are you looking to trade in your neighborhood today?</p>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-500"/> Verified Community</div>
            <div className="flex items-center gap-2"><Activity size={18} className="text-blue-500"/> Hyper-local 5km</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="font-medium text-blue-100 flex items-center gap-2"><Clock size={18}/> Your Wallet</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold">{balance.toFixed(2)}</span>
                <span className="text-blue-200 font-medium">hrs</span>
              </div>
              <p className="text-sm text-blue-200 mt-4">Time is the only currency here. Trade your skills or tools to earn more.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">How it works</h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3"><div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">1</div> Post a skill or tool you have.</li>
                <li className="flex gap-3"><div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div> Find neighbors who need it.</li>
                <li className="flex gap-3"><div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">3</div> Trade hours and build community.</li>
              </ul>
            </div>

            {/* Interactive Map */}
            {userLocation.lat !== 0 && (
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <MapView listings={nearby} userLat={userLocation.lat} userLon={userLocation.lon} />
              </div>
            )}
          </div>
          
          <div>
            <CreateListing onCreated={() => refreshData(user.id)} />
          </div>
          
          <div className="lg:col-span-1">
            <NearbyListings listings={nearby} onTraded={() => refreshData(user.id)} />
          </div>
        </div>
      </main>
    </div>
  );
}

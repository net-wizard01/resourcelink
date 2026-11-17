const fs = require("fs");

fs.mkdirSync("src/components", { recursive: true });

fs.writeFileSync("src/components/Navbar.tsx", `'use client';
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
`);

fs.writeFileSync("src/components/CreateListing.tsx", `'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { PlusCircle, Wrench, BookOpen, Hammer, Sprout } from 'lucide-react';

export default function CreateListing({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tools');
  const [listingType, setListingType] = useState('OFFER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/listings', { listing_type: listingType, category, title, description: '' });
      setTitle('');
      onCreated();
    } catch (err) { alert('Failed to create listing'); }
    finally { setIsLoading(false); }
  };

  const categories = [
    { name: 'Tools', icon: <Wrench size={14} /> },
    { name: 'Tutoring', icon: <BookOpen size={14} /> },
    { name: 'Repairs', icon: <Hammer size={14} /> },
    { name: 'Gardening', icon: <Sprout size={14} /> },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <PlusCircle size={22} className="text-blue-600" /> Post a Listing
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button type="button" onClick={() => setListingType('OFFER')} 
            className={"flex-1 py-2 text-sm font-medium rounded-md transition-all " + (listingType === 'OFFER' ? 'bg-white shadow text-blue-600' : 'text-gray-500')}>
            I am Offering
          </button>
          <button type="button" onClick={() => setListingType('REQUEST')} 
            className={"flex-1 py-2 text-sm font-medium rounded-md transition-all " + (listingType === 'REQUEST' ? 'bg-white shadow text-blue-600' : 'text-gray-500')}>
            I am Requesting
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <button key={c.name} type="button" onClick={() => setCategory(c.name)}
                className={"flex items-center gap-2 p-3 rounded-lg border text-sm transition-all " + (category === c.name ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50 text-gray-600')}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input placeholder="e.g. 6ft Ladder for lending" className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <button disabled={isLoading} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all disabled:opacity-50">
          {isLoading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
}
`);

fs.writeFileSync("src/components/NearbyListings.tsx", `'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { MapPin, ArrowRight } from 'lucide-react';

export default function NearbyListings({ listings, onTraded }: { listings: any[], onTraded: () => void }) {
  const [processing, setProcessing] = useState<string | null>(null);

  const requestTrade = async (listing: any) => {
    const hoursStr = prompt("How many hours to trade for '" + listing.title + "'? (e.g. 1.5)");
    if (!hoursStr) return;
    const hours = parseFloat(hoursStr);
    if (isNaN(hours) || hours <= 0) return alert("Invalid hours");

    setProcessing(listing.id);
    try {
      await api.post('/ledger/transfer', {
        receiver_id: listing.user_id,
        listing_id: listing.id,
        hours: hours,
        idempotency_key: crypto.randomUUID()
      });
      alert("Trade initiated for " + hours + " hours! Waiting for " + listing.full_name + " to confirm.");
      onTraded();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate trade');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <MapPin size={22} className="text-red-500" /> Nearby (5km)
        </h2>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{listings.length} results</span>
      </div>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {listings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No listings nearby. Be the first to post one!</div>
        ) : null}
        {listings.map((l, i) => (
          <div key={i} className="group border border-gray-100 p-4 rounded-xl flex flex-col justify-between bg-white hover:shadow-md hover:border-blue-100 transition-all gap-4">
            <div>
              <div className="flex justify-between items-start">
                <span className={"text-xs font-bold px-2 py-1 rounded-full " + (l.listing_type === 'OFFER' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                  {l.listing_type}
                </span>
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> {Math.round(l.distance_meters)}m away
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mt-2">{l.title}</h3>
              <p className="text-sm text-gray-500">{l.category} • By {l.full_name}</p>
            </div>
            <button onClick={() => requestTrade(l)} disabled={processing === l.id}
              className="w-full bg-gray-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 font-semibold text-sm py-2 rounded-lg transition-all flex items-center justify-center gap-2">
              {processing === l.id ? 'Processing...' : 'Request Trade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

fs.writeFileSync("src/app/page.tsx", `'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CreateListing from '@/components/CreateListing';
import NearbyListings from '@/components/NearbyListings';
import { Clock, ShieldCheck, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [nearby, setNearby] = useState<any[]>([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    refreshData();
  }, [user, router]);

  const refreshData = () => {
    api.get('/users/me/balance').then(res => setBalance(res.data.balance));
    api.get('/listings/nearby').then(res => {
      setNearby(res.data.filter((l: any) => l.user_id !== user?.id));
    });
  };

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
          </div>
          <div>
            <CreateListing onCreated={refreshData} />
          </div>
          <div className="lg:col-span-1">
            <NearbyListings listings={nearby} onTraded={refreshData} />
          </div>
        </div>
      </main>
    </div>
  );
}
`);

console.log("All files written successfully!");

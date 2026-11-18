'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Trash2, Clock, Tag, Image as ImageIcon } from 'lucide-react';

export default function MyListingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchListings();
    api.get('/users/me/balance').then(res => setBalance(res.data.balance)).catch(console.error);
  }, [user, router]);

  const fetchListings = async () => {
    try {
      const res = await api.get('/listings/me');
      setListings(res.data);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    
    setIsDeleting(id);
    try {
      await api.delete(`/listings/${id}`);
      // Remove it from the UI instantly without needing a page reload
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete listing. Check console for details.');
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <Navbar balance={balance} />
      
      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Listings</h1>
            <p className="text-gray-500 mt-2">Manage the skills and tools you have posted.</p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No listings yet</h3>
            <p className="text-gray-500 mt-1 max-w-sm">You haven't posted anything to the community yet. Go to the dashboard to create your first listing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group relative">
                {l.image_url ? (
                  <div className="h-48 bg-gray-100 w-full relative">
                    <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-50 w-full flex items-center justify-center border-b border-gray-100">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${l.listing_type === 'OFFER' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {l.listing_type}
                      </span>
                      <button 
                        onClick={() => handleDelete(l.id)} 
                        disabled={isDeleting === l.id}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 disabled:opacity-50" 
                        title="Delete Listing"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{l.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{l.description || 'No description provided.'}</p>
                    
                    <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100"><Tag size={14} /> {l.category}</span>
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100"><Clock size={14} /> {l.estimated_hours} hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

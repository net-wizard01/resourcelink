'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ReviewModal from '@/components/ReviewModal';
import { CheckCircle, Clock, Star } from 'lucide-react';

export default function TradesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [reviewTrade, setReviewTrade] = useState<any | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchTrades();
    api.get('/users/me/balance').then(res => setBalance(res.data.balance));
  }, [user, router]);

  const fetchTrades = () => {
    api.get('/users/me/transactions').then(res => {
      // Add reviewer_name logic for the modal
      const enriched = res.data.map((t: any) => ({
        ...t,
        reviewer_name: user?.full_name
      }));
      setTrades(enriched);
    });
  };

  const completeTrade = async (id: string) => {
    if (!confirm('Are you sure you want to confirm this trade? Credits will be transferred.')) return;
    try {
      await api.post(`/ledger/${id}/complete`);
      fetchTrades();
      api.get('/users/me/balance').then(res => setBalance(res.data.balance));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete trade');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar balance={balance} />
      
      <main className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Trades</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {trades.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No trades yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {trades.map((t) => {
                const isReceiver = t.receiver_id === user.id;
                const isPending = t.status === 'PENDING';
                
                return (
                  <li key={t.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          t.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {t.status}
                        </span>
                        <h3 className="font-bold text-gray-800 text-lg">{t.listing_title}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {isReceiver ? (
                          <><span className="font-medium text-green-600">+{t.hours_exchanged} hrs</span> from {t.sender_name}</>
                        ) : (
                          <><span className="font-medium text-red-500">-{t.hours_exchanged} hrs</span> to {t.receiver_name}</>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {isPending && isReceiver && (
                        <button onClick={() => completeTrade(t.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
                          <CheckCircle size={18} /> Confirm Trade
                        </button>
                      )}

                      {t.status === 'COMPLETED' && (
                        <button onClick={() => setReviewTrade(t)} className="bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
                          <Star size={18} /> Leave a Review
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {reviewTrade && (
        <ReviewModal 
          trade={reviewTrade} 
          onClose={() => setReviewTrade(null)} 
          onSuccess={() => alert('Review submitted!')} 
        />
      )}
    </div>
  );
}

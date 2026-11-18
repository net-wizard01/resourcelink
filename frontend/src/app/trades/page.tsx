'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ReviewModal from '@/components/ReviewModal';
import { CheckCircle, Clock, Star, User } from 'lucide-react';
import Link from 'next/link';

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

    const interval = setInterval(() => {
      fetchTrades();
      api.get('/users/me/balance').then(res => setBalance(res.data.balance));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user, router]);

  const fetchTrades = () => {
    api.get('/users/me/transactions').then(res => {
      const enriched = res.data.map((t: any) => ({
        ...t,
        isReceiver: t.receiver_id === user?.id
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      <Navbar balance={balance} />
      
      <main className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">My Trades</h1>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          {trades.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-slate-400">No trades yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-slate-800">
              {trades.map((t) => {
                const isReceiver = t.receiver_id === user.id;
                const isPending = t.status === 'PENDING';
                const otherPersonId = isReceiver ? t.sender_id : t.receiver_id;
                const otherPersonName = isReceiver ? t.sender_name : t.receiver_name;
                
                return (
                  <li key={t.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          t.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          t.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {t.status}
                        </span>
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg">{t.listing_title}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                        {isReceiver ? (
                          <><span className="font-medium text-green-600 dark:text-green-400">+{t.hours_exchanged} hrs</span> from</>
                        ) : (
                          <><span className="font-medium text-red-500 dark:text-red-400">-{t.hours_exchanged} hrs</span> to</>
                        )}
                        <Link href={`/profile/${otherPersonId}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                          <User size={14} /> {otherPersonName}
                        </Link>
                      </p>
                      
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 flex items-center gap-1">
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
                        <button onClick={() => setReviewTrade(t)} className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
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

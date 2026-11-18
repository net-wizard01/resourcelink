'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/StarRating';
import { User, ShieldCheck, Clock, Star } from 'lucide-react';

export default function PublicProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const targetUserId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (targetUserId === user.id) {
      router.push('/profile');
      return;
    }

    api.get('/users/me/balance').then(res => setBalance(res.data.balance));
    api.get(`/users/${targetUserId}/profile`).then(res => {
      setProfile(res.data);
      api.get(`/reviews/user/${targetUserId}`).then(r => setReviews(r.data)).catch(console.error);
    }).catch(err => {
      alert('Could not find this user.');
      router.push('/');
    });
  }, [user, router, targetUserId]);

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <Navbar balance={balance} />
      
      <main className="max-w-5xl mx-auto px-8 py-10">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900"></div>
          
          <div className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="-mt-20 shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover bg-white shadow-md" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-5xl font-bold shadow-md">
                  {profile.full_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 w-full mt-2 md:mt-0">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                {profile.full_name} <ShieldCheck size={24} className="text-green-500" />
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">{profile.email}</p>
              <p className="text-gray-700 dark:text-slate-300 mt-4 max-w-2xl text-sm leading-relaxed">
                {profile.bio || "This neighbor hasn't written a bio yet."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={24} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.completed_trades}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Completed Trades</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star size={24} />
              </div>
              <div className="flex justify-center mb-1">
                <StarRating rating={Math.round(Number(profile.average_rating))} readonly />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{Number(profile.average_rating).toFixed(1)}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Average Rating ({profile.review_count} reviews)</p>
            </div>
          </div>

          <div className="md:col-span-2">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 min-h-[300px]">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Reviews from Neighbors</h3>
                
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-48">
                    <User size={48} className="mb-4 text-gray-300 dark:text-slate-600" />
                    <p>No reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {review.reviewer_name.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{review.reviewer_name}</span>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mb-2">
                          <StarRating rating={review.rating} readonly />
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 dark:text-slate-300">"{review.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

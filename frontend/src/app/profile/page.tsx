'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/StarRating';
import { User, Save, ShieldCheck, Clock, Star, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', bio: '', avatar_url: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    
    api.get('/users/me/balance').then(res => setBalance(res.data.balance));
    api.get('/users/me/profile').then(res => {
      setProfile(res.data);
      setForm({ 
        full_name: res.data.full_name, 
        bio: res.data.bio || '', 
        avatar_url: res.data.avatar_url || '' 
      });
    }).catch(console.error);
  }, [user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/users/me/profile', form);
      
      // Update local auth state
      if (user) {
        const updatedUser = { ...user, full_name: form.full_name, avatar_url: form.avatar_url };
        const token = localStorage.getItem('token') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        login(token, refreshToken, updatedUser);
      }
      
      setIsEditing(false);
      // Refresh the page data
      const res = await api.get('/users/me/profile');
      setProfile(res.data);
    } catch (err) {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      <Navbar balance={balance} />
      
      <main className="max-w-4xl mx-auto px-8 py-10">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          
          <div className="px-8 pb-8 relative">
            <div className="absolute -top-12 left-8">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-4xl font-bold shadow-sm">
                  {profile.full_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                <Edit3 size={16} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="mt-6 space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                  <input type="url" placeholder="https://example.com/photo.jpg" value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell your neighbors a bit about yourself..." className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                </div>
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-70">
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="mt-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  {profile.full_name} <ShieldCheck size={24} className="text-green-500" />
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{profile.email}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-2xl text-sm leading-relaxed">
                  {profile.bio || "This neighbor hasn't written a bio yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stats Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={24} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.completed_trades}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Trades</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star size={24} />
              </div>
              <div className="flex justify-center mb-1">
                <StarRating rating={Math.round(Number(profile.average_rating))} readonly />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{Number(profile.average_rating).toFixed(1)}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating ({profile.review_count} reviews)</p>
            </div>
          </div>

          {/* Reviews List (Placeholder for now) */}
          <div className="md:col-span-2">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 min-h-[300px]">
                <User size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400">Reviews coming soon</h3>
                <p className="text-sm mt-1 max-w-xs text-center">We will list the specific reviews and comments left by your neighbors here.</p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

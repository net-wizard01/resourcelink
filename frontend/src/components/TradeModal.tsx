'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { X, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';
import ChatModal from './ChatModal';
import { MessageSquare } from 'lucide-react';

export default function TradeModal({ listing, onClose, onSuccess }: { listing: any, onClose: () => void, onSuccess: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [hours, setHours] = useState('1.0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the neighbor's profile when modal opens
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${listing.user_id}/profile`);
        if (isMounted) setProfile(res.data);
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else if (err.response?.status === 404) {
          setError("User not found.");
        } else {
          setError("Failed to load neighbor profile.");
        }
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [listing]);

  const submitTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      setError('Please enter a valid number of hours.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/ledger/transfer', {
        receiver_id: listing.user_id,
        listing_id: listing.id,
        hours: parsedHours,
        idempotency_key: crypto.randomUUID()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initiate trade');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Request Trade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${listing.listing_type === 'OFFER' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {listing.listing_type}
            </span>
            <h3 className="font-bold text-lg text-gray-800 mt-2">{listing.title}</h3>
            <p className="text-sm text-gray-500">{listing.category} ? {Math.round(listing.distance_meters)}m away</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Neighbor Profile</h4>
            {error ? (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>
            ) : profile ? (
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
                    {profile.full_name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start w-full">
                    <p className="font-bold text-gray-800 flex items-center gap-1">
                      {profile.full_name} <ShieldCheck size={16} className="text-green-500" />
                    </p>
                    <button onClick={() => setShowChat(true)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-semibold hover:bg-blue-100 flex items-center gap-1">
                      <MessageSquare size={12} /> Message
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={Math.round(Number(profile.average_rating) || 0)} readonly />
                    <span className="text-sm font-medium text-gray-600">
                      {Number(profile.average_rating || 0).toFixed(1)} ({profile.review_count} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.completed_trades} completed trades ? {profile.active_listings} active listings
                  </p>
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submitTrade} className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock size={16} /> How many hours?
              </label>
              <input 
                type="number" 
                step="0.5" 
                min="0.5" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black text-lg font-semibold"
                value={hours} 
                onChange={e => setHours(e.target.value)} 
              />
              <p className="text-xs text-gray-500 mt-1">This amount will be deducted from your wallet and held in escrow until confirmed.</p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !!error} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Initiating...' : <><CheckCircle2 size={18} /> Initiate Trade</>}
            </button>
          </form>
        </div>
      </div>
      {showChat && (
        <ChatModal listing={listing} otherUser={profile} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

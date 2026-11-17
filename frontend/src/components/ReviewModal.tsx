'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { X, CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';

export default function ReviewModal({ trade, onClose, onSuccess }: { trade: any, onClose: () => void, onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        ledger_id: trade.id,
        rating,
        comment
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review');
      setIsSubmitting(false);
    }
  };

  const neighborName = trade.sender_name === trade.reviewer_name ? trade.receiver_name : trade.sender_name;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Leave a Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        
        <form onSubmit={submitReview} className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">How was your trade with <span className="font-bold text-gray-800">{neighborName}</span>?</p>
            <div className="flex justify-center py-2">
              <StarRating rating={rating} setRating={setRating} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave a comment (optional)</label>
            <textarea 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black h-24 resize-none"
              placeholder="e.g. Great communication, tool was in perfect condition!"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : <><CheckCircle2 size={18} /> Submit Review</>}
          </button>
        </form>
      </div>
    </div>
  );
}

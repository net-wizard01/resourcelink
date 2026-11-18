'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { PlusCircle, Wrench, BookOpen, Hammer, Sprout } from 'lucide-react';

export default function CreateListing({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1.0');
  const [imageUrl, setImageUrl] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [category, setCategory] = useState('Tools');
  const [listingType, setListingType] = useState('OFFER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/listings', { 
        listing_type: listingType, 
        category, 
        title, 
        description, 
        estimated_hours: parseFloat(estimatedHours),
        image_url: imageUrl,
        is_urgent: isUrgent 
      });
      setTitle('');
      setDescription('');
      setEstimatedHours('1.0');
      setImageUrl('');
      setIsUrgent(false);
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
    <div className="bg-white dark:bg-slate-800 dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
        <PlusCircle size={22} className="text-blue-600" /> Post a Listing
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <button type="button" onClick={() => setListingType('OFFER')} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${listingType === 'OFFER' ? 'bg-white dark:bg-slate-800 dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
            I am Offering
          </button>
          <button type="button" onClick={() => setListingType('REQUEST')} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${listingType === 'REQUEST' ? 'bg-white dark:bg-slate-800 dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
            I am Requesting
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <button key={c.name} type="button" onClick={() => setCategory(c.name)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${category === c.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Title</label>
          <input placeholder="e.g. 6ft Ladder for lending" className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
          <textarea placeholder="Condition, availability, or specific details..." className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none" 
            value={description} onChange={e => setDescription(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Estimated Hours</label>
          <input type="number" step="0.5" min="0.5" placeholder="1.0" className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Image URL (Optional)</label>
          <input placeholder="https://example.com/image.jpg" className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </div>

        
        <label className="flex items-center gap-3 p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <input 
            type="checkbox" 
            checked={isUrgent} 
            onChange={e => setIsUrgent(e.target.checked)}
            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 dark:border-slate-600"
          />
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">Mark as Urgent</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">Highlight this listing at the top of the feed.</p>
          </div>
        </label>

        <button disabled={isLoading} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all disabled:opacity-50">
          {isLoading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
}

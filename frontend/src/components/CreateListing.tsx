'use client';
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

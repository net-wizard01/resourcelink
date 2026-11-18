'use client';
import { useState } from 'react';
import { MapPin, ArrowRight, Wrench, BookOpen, Hammer, Sprout, User } from 'lucide-react';
import TradeModal from './TradeModal';

export default function NearbyListings({ listings, onTraded }: { listings: any[], onTraded: () => void }) {
  const [selectedListing, setSelectedListing] = useState<any | null>(null);

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Tools': return <Wrench size={16} />;
      case 'Tutoring': return <BookOpen size={16} />;
      case 'Repairs': return <Hammer size={16} />;
      case 'Gardening': return <Sprout size={16} />;
      default: return <User size={16} />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <MapPin size={22} className="text-red-500" /> Nearby (5km)
        </h2>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{listings.length} results</span>
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {listings.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No listings nearby. Be the first to post one!
          </div>
        ) : null}
        
        {listings.map((l, i) => (
          <div key={i} className="group border border-gray-100 rounded-xl bg-white hover:shadow-md hover:border-blue-100 transition-all flex flex-col overflow-hidden">
            {l.image_url && (
              <div className="w-full h-40 bg-gray-100 relative">
                <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {l.avatar_url ? (
                  <img src={l.avatar_url} alt={l.full_name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {l.full_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800 leading-tight">{l.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    {getCategoryIcon(l.category)} {l.category} ? By {l.full_name}
                  </p>
                  {l.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{l.description}</p>
                  )}
                  <p className="text-xs font-semibold text-blue-600 mt-1">Est: {l.estimated_hours} hrs</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${l.listing_type === 'OFFER' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {l.listing_type}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                <MapPin size={12} /> {Math.round(l.distance_meters)}m away
              </span>
              <button 
                onClick={() => setSelectedListing(l)}
                className="bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 font-semibold text-xs py-1.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1"
              >
                View & Request <ArrowRight size={14} />
              </button>
            </div>
          </div>
          </div>
        ))}
      </div>

      {selectedListing && (
        <TradeModal 
          listing={selectedListing} 
          onClose={() => setSelectedListing(null)} 
          onSuccess={() => {
            onTraded();
            alert('Trade requested successfully! Check "My Trades" to confirm.');
          }} 
        />
      )}
    </div>
  );
}

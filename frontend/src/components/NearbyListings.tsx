'use client';
import { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import TradeModal from './TradeModal';

export default function NearbyListings({ listings, onTraded }: { listings: any[], onTraded: () => void }) {
  const [selectedListing, setSelectedListing] = useState<any | null>(null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <MapPin size={22} className="text-red-500" /> Nearby (5km)
        </h2>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{listings.length} results</span>
      </div>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {listings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No listings nearby. Be the first to post one!</div>
        ) : null}
        
        {listings.map((l, i) => (
          <div key={i} className="group border border-gray-100 p-4 rounded-xl flex flex-col justify-between bg-white hover:shadow-md hover:border-blue-100 transition-all gap-4">
            <div>
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${l.listing_type === 'OFFER' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {l.listing_type}
                </span>
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> {Math.round(l.distance_meters)}m away
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mt-2">{l.title}</h3>
              <p className="text-sm text-gray-500">{l.category} ? By {l.full_name}</p>
            </div>
            <button 
              onClick={() => setSelectedListing(l)}
              className="w-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 font-semibold text-sm py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              View & Request <ArrowRight size={16} />
            </button>
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

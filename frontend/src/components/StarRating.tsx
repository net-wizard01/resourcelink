'use client';
import { Star } from 'lucide-react';

export default function StarRating({ rating, setRating, readonly = false }: { rating: number, setRating?: (r: number) => void, readonly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => setRating && setRating(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star 
            size={readonly ? 16 : 28} 
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
          />
        </button>
      ))}
    </div>
  );
}

import React from 'react';
import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating, onRate, size = 20 }) {
  const stars = [1, 2, 3, 4, 5];

  if (onRate) {
    // Interactive rating
    return (
      <div className="flex gap-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`Rate ${star} stars`}
          >
            <FiStar
              size={size}
              className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    );
  }

  // Display-only rating
  return (
    <div className="flex gap-0.5">
      {stars.map((star) => (
        <FiStar
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

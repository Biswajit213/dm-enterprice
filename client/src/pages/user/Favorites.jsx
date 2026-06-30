import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

// Favorites are managed client-side with localStorage
const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch {
    return [];
  }
};

export default function Favorites() {
  const favorites = getFavorites();

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 md:px-8 py-10">
        <h1 className="text-3xl font-heading font-bold text-dark mb-8">My Favorites</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <FiHeart className="text-gray-200 mx-auto mb-4" size={56} />
            <p className="text-gray-400 text-lg mb-4">No favorites yet</p>
            <p className="text-gray-400 text-sm mb-6">Click the heart icon on any product to save it here</p>
            <Link to="/category" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div key={product._id} className="card">
                <img
                  src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-heading font-bold text-dark">{product.name}</h3>
                  <p className="text-primary font-semibold">₹{product.price?.toFixed(2)}</p>
                  <Link to={`/menu/${product._id}`} className="btn-primary text-sm mt-3 inline-block">View Product</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

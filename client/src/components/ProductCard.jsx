import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop';

  return (
    <div className="card group flex flex-col h-full">
      <Link to={`/menu/${product._id}`} className="block overflow-hidden">
        <div className="relative overflow-hidden aspect-square sm:h-48 md:h-52">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.isBestSeller && <span className="badge bg-accent text-dark text-xs">Best Seller</span>}
            {product.isFeatured && <span className="badge bg-primary text-white text-xs">Featured</span>}
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <span className="text-xs text-secondary font-medium uppercase tracking-wide">{product.category}</span>
        <Link to={`/menu/${product._id}`} className="flex-1">
          <h3 className="font-heading font-semibold text-dark mt-0.5 hover:text-primary transition-colors line-clamp-1 text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="flex items-center gap-1 mt-2">
          <FiStar className="star-filled fill-current" size={12} />
          <span className="text-xs sm:text-sm font-medium">{product.ratings?.toFixed(1) || '0.0'}</span>
          <span className="text-gray-400 text-xs">({product.numReviews})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg sm:text-xl font-bold text-primary">₹{product.price?.toFixed(2)}</span>
          <button
            onClick={() => addToCart(product._id)}
            disabled={product.stock === 0}
            className="flex items-center gap-1 sm:gap-2 bg-primary text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            <FiShoppingCart size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiZap } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, r] = await Promise.all([api.get(`/products/${id}`), api.get(`/reviews/${id}`)]);
        const currentProduct = p.data.product;
        setProduct(currentProduct);
        setReviews(r.data.reviews);

        // Fetch related products from same category
        const related = await api.get(`/products?category=${encodeURIComponent(currentProduct.category)}&limit=5`);
        const filtered = related.data.products.filter((item) => item._id !== id).slice(0, 4);
        setRelatedProducts(filtered);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => addToCart(product._id, quantity);

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    navigate(`/customise/${product._id}`, { state: { product, quantity } });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    try {
      setSubmittingReview(true);
      const { data } = await api.post('/reviews', { productId: id, ...reviewForm });
      setReviews((prev) => [data.review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted');
      const p = await api.get(`/products/${id}`);
      setProduct(p.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-screen" />;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  const images = product.images?.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', public_id: 'default' }];

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 md:px-8 py-6 sm:py-8">

        {/* Back */}
        <Link to="/category" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary mb-5 sm:mb-6 transition-colors text-sm sm:text-base">
          <FiArrowLeft size={16} /> Back to Category
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">

          {/* Images */}
          <div>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-md mb-3 sm:mb-4 aspect-square sm:aspect-auto sm:h-80 md:h-96">
              <img src={images[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.public_id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="mt-2 lg:mt-0">
            <span className="text-primary font-semibold uppercase tracking-widest text-xs sm:text-sm">{product.category}</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-dark mt-1 sm:mt-2 mb-2 sm:mb-3 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              <StarRating rating={product.ratings} size={16} />
              <span className="font-semibold text-sm sm:text-base">{product.ratings?.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({product.numReviews} reviews)</span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4">₹{product.price?.toFixed(2)}</p>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{product.description}</p>

            <div className="mb-3 sm:mb-4">
              <span className={`font-medium text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-gray-100 transition-colors" aria-label="Decrease">
                    <FiMinus size={14} />
                  </button>
                  <span className="px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base min-w-[40px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-gray-100 transition-colors" aria-label="Increase">
                    <FiPlus size={14} />
                  </button>
                </div>
                <span className="text-gray-400 text-sm">Max: {product.stock}</span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base sm:text-lg py-3 sm:py-4"
            >
              <FiShoppingCart size={18} />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {product.stock > 0 && (
              <button
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 text-base sm:text-lg py-3 sm:py-4 mt-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                <FiZap size={18} />
                Buy Now
              </button>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-5 sm:mb-8">Customer Reviews</h2>

          {/* Review Form */}
          {user && (
            <form onSubmit={handleReviewSubmit} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-5 sm:mb-8">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Write a Review</h3>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm((p) => ({ ...p, rating: r }))} size={24} />
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  rows={3}
                  required
                  maxLength={500}
                  placeholder="Share your experience..."
                  className="input-field resize-none"
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm sm:text-base">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {review.user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-dark text-sm sm:text-base">{review.user?.name}</p>
                        <p className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StarRating rating={review.rating} size={13} />
                      {user && (user._id === review.user?._id || user.role === 'admin') && (
                        <button onClick={() => handleDeleteReview(review._id)} className="text-red-400 hover:text-red-600 text-xs ml-1">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-20">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div>
                <span className="text-primary font-semibold uppercase tracking-widest text-xs sm:text-sm">More Like This</span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark mt-1">Related Products</h2>
              </div>
              <Link
                to={`/category?category=${encodeURIComponent(product.category)}`}
                className="text-primary text-sm font-medium hover:underline flex-shrink-0"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

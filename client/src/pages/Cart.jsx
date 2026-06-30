import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';

export default function Cart() {
  const { cart, cartLoading, cartTotal, updateQuantity, removeFromCart } = useCart();

  const tax = cartTotal * 0.1;
  const shipping = cartTotal > 50 ? 0 : 5.99;
  const total = cartTotal + tax + shipping;

  if (cartLoading) return <Spinner size="lg" className="min-h-screen" />;

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 md:px-8 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-5 sm:mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <FiShoppingBag className="text-gray-300 mx-auto mb-4" size={56} />
            <p className="text-gray-400 text-base sm:text-xl mb-5 sm:mb-6">Your cart is empty</p>
            <Link to="/category" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cart.items.map((item) => {
                const imgUrl = item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200';
                return (
                  <div key={item.product?._id} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img src={imgUrl} alt={item.product?.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-dark text-sm sm:text-base truncate">{item.product?.name}</h3>
                        <p className="text-primary font-bold text-sm sm:text-base">&#8377;{item.price?.toFixed(2)}</p>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateQuantity(item.product?._id, item.quantity - 1)} className="px-2 py-1.5 sm:px-3 sm:py-2 hover:bg-gray-50" aria-label="Decrease">
                            <FiMinus size={12} />
                          </button>
                          <span className="px-2 sm:px-3 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm min-w-[28px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)} disabled={item.quantity >= item.product?.stock} className="px-2 py-1.5 sm:px-3 sm:py-2 hover:bg-gray-50 disabled:opacity-40" aria-label="Increase">
                            <FiPlus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-dark text-sm sm:text-base w-16 text-right">&#8377;{(item.price * item.quantity).toFixed(2)}</p>
                          <button onClick={() => removeFromCart(item.product?._id)} className="text-red-400 hover:text-red-600 p-1 transition-colors" aria-label="Remove">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm h-fit lg:sticky lg:top-20">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-dark mb-4 sm:mb-6">Order Summary</h2>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>&#8377;{cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (10%)</span><span>&#8377;{tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `\u20b9${shipping.toFixed(2)}`}</span>
                </div>
                {cartTotal < 50 && (
                  <p className="text-xs text-gray-400">Add &#8377;{(50 - cartTotal).toFixed(2)} more for free shipping</p>
                )}
                <div className="border-t border-gray-200 pt-2 sm:pt-3 flex justify-between font-bold text-base sm:text-lg text-dark">
                  <span>Total</span><span>&#8377;{total.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 text-center">
                Checkout <FiArrowRight size={16} />
              </Link>
              <Link to="/category" className="block text-center text-primary text-xs sm:text-sm mt-3 sm:mt-4 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiImage } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const INITIAL_SHIPPING = { name: '', phone: '', address: '', city: '', state: '', zipCode: '' };

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState(INITIAL_SHIPPING);
  const [loading, setLoading] = useState(false);
  const [customisation, setCustomisation] = useState(null);

  const tax = cartTotal * 0.1;
  const shipping = cartTotal > 50 ? 0 : 5.99;
  const total = cartTotal + tax + shipping;

  // Load customisation data from sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem('customisation');
    if (data) {
      try { setCustomisation(JSON.parse(data)); } catch { /* ignore */ }
    }
  }, []);

  const handleChange = (e) => setShippingInfo((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload custom photo to Cloudinary if present
      let customPhotos = {};
      if (customisation?.customPhoto && customisation?.productId) {
        toast.loading('Uploading your custom photo...', { id: 'upload' });
        const { data: uploadData } = await api.post('/orders/upload-custom-photo', {
          base64Image: customisation.customPhoto,
          productId: customisation.productId,
        });
        toast.dismiss('upload');
        if (uploadData.success) {
          customPhotos[customisation.productId] = uploadData.url;
        }
      }

      const { data } = await api.post('/orders', { shippingInfo, customPhotos });
      if (!data.order || !data.order._id) {
        throw new Error('Order creation failed. Please try again.');
      }

      // Clear customisation from session
      sessionStorage.removeItem('customisation');
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.dismiss('upload');
      toast.error(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', col: 2 },
    { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210', col: 2 },
    { name: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main St', col: 2 },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Kolkata', col: 1 },
    { name: 'state', label: 'State', type: 'text', placeholder: 'WB', col: 1 },
    { name: 'zipCode', label: 'ZIP Code', type: 'text', placeholder: '700001', col: 1 },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 md:px-8 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-5 sm:mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

            {/* Left — Shipping + Payment */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

              {/* Customisation preview */}
              {customisation?.customPhoto && (
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border-2 border-primary/20">
                  <h2 className="font-semibold text-dark text-sm sm:text-base mb-3 flex items-center gap-2">
                    <FiImage className="text-primary" size={16} /> Your Custom Photo
                  </h2>
                  <div className="flex items-center gap-4">
                    <img
                      src={customisation.customPhoto}
                      alt="Custom"
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-dark text-sm">{customisation.productName}</p>
                      <p className="text-gray-400 text-xs mt-1">This photo will be printed on your product</p>
                      <span className="inline-block mt-1.5 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        ✓ Customisation added
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-xl font-heading font-bold text-dark mb-4 sm:mb-5 flex items-center gap-2">
                  <FiTruck className="text-primary" size={18} /> Shipping Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {fields.map((f) => (
                    <div key={f.name} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                      <label htmlFor={f.name} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input
                        id={f.name}
                        name={f.name}
                        type={f.type}
                        required
                        value={shippingInfo[f.name]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        className="input-field"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment — Cash on Delivery only */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-xl font-heading font-bold text-dark mb-3 sm:mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 p-3 sm:p-4 border-2 border-primary bg-primary/5 rounded-xl">
                  <span className="text-xl">💵</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Cash on Delivery</p>
                    <p className="text-gray-400 text-xs mt-0.5">Pay when your order arrives</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm h-fit lg:sticky lg:top-20">
              <h2 className="text-base sm:text-xl font-heading font-bold text-dark mb-4 sm:mb-5">Order Summary</h2>
              <div className="space-y-2 mb-4 text-xs sm:text-sm max-h-48 sm:max-h-none overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.product?._id} className="flex justify-between gap-2">
                    <span className="text-gray-600 truncate flex-1">{item.product?.name} x{item.quantity}</span>
                    <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2 mb-4 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (10%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm sm:text-base text-dark border-t pt-2">
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading || cart.items.length === 0} className="btn-primary w-full text-sm sm:text-base py-3 sm:py-4">
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

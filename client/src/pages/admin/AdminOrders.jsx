import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiDownload, FiImage, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

function downloadImage(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'custom-photo.jpg';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, orderStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}`, { orderStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  // Count orders with custom photos
  const customOrders = orders.filter((o) => o.items?.some((i) => i.customPhoto));

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-dark">Orders ({orders.length})</h1>
        {customOrders.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <FiImage size={13} /> {customOrders.length} custom order{customOrders.length > 1 ? 's' : ''} with photos
          </span>
        )}
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const hasCustom = order.items?.some((i) => i.customPhoto);
          const isExpanded = expandedOrder === order._id;

          return (
            <div
              key={order._id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                hasCustom ? 'border-primary' : 'border-transparent'
              }`}
            >
              {/* Order Row */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-3 justify-between">

                  {/* Left info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      {hasCustom && (
                        <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          <FiImage size={11} /> Custom Photo
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-dark text-sm mt-0.5">{order.user?.name}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Right — total + status */}
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-dark text-sm">&#8377;{order.totalPrice?.toFixed(2)}</p>
                    {updating === order._id ? (
                      <FiRefreshCw className="animate-spin text-primary" size={16} />
                    ) : (
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.orderStatus]}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                    >
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      {isExpanded ? 'Hide' : 'View'} items
                    </button>
                  </div>
                </div>

                {/* Quick custom photo strip — always visible if has custom */}
                {hasCustom && !isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    {order.items.filter((i) => i.customPhoto).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
                        <img
                          src={item.customPhoto}
                          alt="Custom"
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-xs text-dark font-medium truncate max-w-[100px]">{item.name}</span>
                        <button
                          onClick={() => downloadImage(item.customPhoto, `custom-${item.name}-${order._id.slice(-6)}.jpg`)}
                          className="flex items-center gap-1 bg-primary text-white text-xs px-2 py-1 rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
                          title="Download custom photo"
                        >
                          <FiDownload size={11} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Items */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Items</p>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-3 sm:p-4 flex flex-wrap gap-4 items-start">

                        {/* Product image */}
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=80'}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />

                        {/* Item info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-dark text-sm">{item.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            Qty: {item.quantity} · &#8377;{item.price?.toFixed(2)} each
                          </p>
                        </div>

                        {/* Custom photo section */}
                        {item.customPhoto && (
                          <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <p className="text-xs font-medium text-primary flex items-center gap-1">
                              <FiImage size={11} /> Customer's Photo
                            </p>
                            <div className="relative group">
                              <img
                                src={item.customPhoto}
                                alt="Customer custom photo"
                                className="w-24 h-24 object-cover rounded-xl border-2 border-primary/30"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors" />
                            </div>
                            <button
                              onClick={() => downloadImage(
                                item.customPhoto,
                                `custom-${item.name.replace(/\s+/g, '-')}-order-${order._id.slice(-6)}.jpg`
                              )}
                              className="flex items-center gap-1.5 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors w-full justify-center"
                            >
                              <FiDownload size={12} /> Download Photo
                            </button>
                            <p className="text-xs text-gray-400 text-center">
                              Use this to print on product
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <p className="font-semibold text-dark mb-1">Ship To</p>
                      <p>{order.shippingInfo?.name}</p>
                      <p>{order.shippingInfo?.address}</p>
                      <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}</p>
                      <p>{order.shippingInfo?.phone}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-dark mb-1">Payment</p>
                      <p className="capitalize">{order.paymentInfo?.method} · {order.paymentInfo?.status}</p>
                      <p className="mt-1 font-bold text-dark text-sm">Total: &#8377;{order.totalPrice?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 text-sm">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}

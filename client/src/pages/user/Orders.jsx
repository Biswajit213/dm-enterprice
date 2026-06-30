import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" className="min-h-screen" />;

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 md:px-8 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-5 sm:mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow-sm">
            <FiShoppingBag className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-base sm:text-lg mb-4">No orders yet</p>
            <Link to="/category" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold text-dark mt-0.5 text-sm sm:text-base">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <p className="text-lg sm:text-xl font-bold text-dark">₹{order.totalPrice?.toFixed(2)}</p>
                    <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex items-center gap-1.5 text-primary hover:underline text-xs sm:text-sm font-medium self-start sm:self-auto"
                  >
                    <FiEye size={14} /> View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiHeart, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.orders.slice(0, 5))).finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { to: '/profile', icon: FiUser, label: 'Edit Profile', color: 'bg-blue-50 text-blue-600' },
    { to: '/orders', icon: FiShoppingBag, label: 'My Orders', color: 'bg-green-50 text-green-600' },
    { to: '/favorites', icon: FiHeart, label: 'Favorites', color: 'bg-red-50 text-red-600' },
    { to: '/category', icon: FiPackage, label: 'Shop Now', color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 md:px-8 py-6 sm:py-10">

        {/* Welcome Banner */}
        <div className="bg-primary rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-5 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white/30 flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 text-white flex items-center justify-center text-xl sm:text-2xl font-bold border-4 border-white/30 flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white/70 text-xs sm:text-sm">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">{user?.name}</h1>
              <p className="text-secondary text-xs sm:text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-8">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="bg-white rounded-xl p-4 sm:p-5 flex flex-col items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <span className="font-medium text-dark text-xs sm:text-sm text-center">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-xl font-heading font-bold text-dark">Recent Orders</h2>
            <Link to="/orders" className="text-primary text-xs sm:text-sm hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-400">
              <FiShoppingBag size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm sm:text-base">No orders yet. Start shopping!</p>
              <Link to="/category" className="btn-primary inline-block mt-3 sm:mt-4 text-sm">Browse Products</Link>
            </div>
          ) : (
            /* Mobile: cards layout. Desktop: table */
            <>
              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {orders.map((order) => (
                  <Link key={order._id} to={`/orders/${order._id}`} className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`badge text-xs ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-sm text-dark">₹{order.totalPrice?.toFixed(2)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Order ID', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                        <th key={h} className="text-left py-3 text-gray-500 font-medium text-xs sm:text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3">
                          <Link to={`/orders/${order._id}`} className="text-primary hover:underline font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</Link>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-xs">{order.items.length}</td>
                        <td className="py-3 font-semibold text-xs">₹{order.totalPrice?.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`badge text-xs ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

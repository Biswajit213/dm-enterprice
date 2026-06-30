import React, { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;
  if (!data) return <p className="text-red-500 text-sm">Failed to load dashboard</p>;

  const cards = [
    { label: 'Total Users', value: data.stats.totalUsers, icon: FiUsers, color: 'bg-blue-500' },
    { label: 'Total Orders', value: data.stats.totalOrders, icon: FiShoppingBag, color: 'bg-green-500' },
    { label: 'Revenue', value: `\u20b9${data.stats.revenue.toFixed(2)}`, icon: FiDollarSign, color: 'bg-amber-500' },
    { label: 'Products', value: data.stats.totalProducts, icon: FiPackage, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-5 sm:mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-3 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-gray-500 text-xs truncate">{label}</p>
              <p className="text-lg sm:text-2xl font-bold text-dark truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="font-bold text-dark mb-3 sm:mb-4 text-sm sm:text-base">Orders by Status</h2>
          {Object.keys(data.ordersByStatus).length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(data.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`badge ${STATUS_COLORS[status]}`}>{status}</span>
                  <span className="font-semibold text-dark text-sm">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="font-bold text-dark mb-3 sm:mb-4 text-sm sm:text-base">Best Selling Products</h2>
          {data.bestSellers.length === 0 ? (
            <p className="text-gray-400 text-sm">No best sellers marked</p>
          ) : (
            <div className="space-y-3">
              {data.bestSellers.map((p) => (
                <div key={p._id} className="flex items-center gap-3">
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=60'}
                    alt={p.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark text-xs sm:text-sm truncate">{p.name}</p>
                    <p className="text-gray-400 text-xs">{p.numReviews} reviews</p>
                  </div>
                  <p className="font-bold text-primary text-sm flex-shrink-0">&#8377;{p.price?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Revenue */}
        {data.monthlyOrders.length > 0 && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm md:col-span-2">
            <h2 className="font-bold text-dark mb-3 sm:mb-4 text-sm sm:text-base">Monthly Revenue</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2 font-medium">Month</th>
                    <th className="text-left py-2 font-medium">Orders</th>
                    <th className="text-left py-2 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyOrders.map((m) => (
                    <tr key={`${m._id.year}-${m._id.month}`} className="border-b border-gray-50">
                      <td className="py-2">{new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}</td>
                      <td className="py-2">{m.count}</td>
                      <td className="py-2 font-semibold text-green-600">&#8377;{m.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

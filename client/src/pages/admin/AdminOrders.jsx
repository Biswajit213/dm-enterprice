import React, { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

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

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6">Orders ({orders.length})</h1>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="font-medium text-dark text-sm">{order.user?.name}</p>
                <p className="text-gray-400 text-xs">{order.user?.email}</p>
              </div>
              <p className="font-bold text-dark">&#8377;{order.totalPrice?.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
              <div>
                {updating === order._id ? (
                  <FiRefreshCw className="animate-spin text-primary" size={16} />
                ) : (
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.orderStatus]}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-left bg-gray-50">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-dark text-sm">{order.user?.name}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{order.items?.length}</td>
                  <td className="px-4 py-3 font-bold text-sm">&#8377;{order.totalPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize text-gray-600 text-sm">{order.paymentInfo?.method}</td>
                  <td className="px-4 py-3">
                    {updating === order._id ? (
                      <FiRefreshCw className="animate-spin text-primary" size={15} />
                    ) : (
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.orderStatus]}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No orders yet</p>}
      </div>
    </div>
  );
}

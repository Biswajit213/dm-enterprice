import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=50');
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-dark">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4">
          <FiPlus size={15} /> <span className="hidden xs:inline">Add</span> Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-3 sm:p-4 border-b">
          <div className="relative max-w-xs w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm w-full"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.map((p) => (
            <div key={p._id} className="p-3 flex items-center gap-3">
              <img
                src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=60'}
                alt={p.name}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-primary">&#8377;{p.price?.toFixed(2)}</span>
                  <span className={`badge text-xs ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link to={`/admin/products/${p._id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit size={15} /></Link>
                <button onClick={() => handleDelete(p._id, p.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=60'} alt={p.name} className="w-9 h-9 object-cover rounded-lg" />
                      <span className="font-medium text-dark text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-sm">&#8377;{p.price?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{p.ratings?.toFixed(1)} ★</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/products/${p._id}/edit`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" aria-label="Edit"><FiEdit size={15} /></Link>
                      <button onClick={() => handleDelete(p._id, p.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" aria-label="Delete"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No products found</p>}
      </div>
    </div>
  );
}

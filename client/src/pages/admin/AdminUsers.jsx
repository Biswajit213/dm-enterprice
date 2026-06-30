import React, { useEffect, useState } from 'react';
import { FiTrash2, FiShield, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handlePromote = async (id, name) => {
    if (!window.confirm(`Promote "${name}" to admin?`)) return;
    try {
      const { data } = await api.put(`/admin/users/${id}/promote`);
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      toast.success(`${name} is now an admin`);
    } catch {
      toast.error('Failed to promote user');
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6">Users ({users.length})</h1>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-3 sm:p-4 border-b">
          <div className="relative max-w-xs w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.map((u) => (
            <div key={u._id} className="p-3 flex items-center gap-3">
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark text-sm truncate">{u.name}</p>
                <p className="text-gray-400 text-xs truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  <span className="text-xs text-gray-400">{u.googleId ? '🔵 Google' : '📧 Email'}</span>
                </div>
              </div>
              {u._id !== currentUser?._id && u.role !== 'admin' && (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handlePromote(u._id, u.name)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg" title="Promote"><FiShield size={15} /></button>
                  <button onClick={() => handleDelete(u._id, u.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><FiTrash2 size={15} /></button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-left bg-gray-50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Auth</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-dark text-sm">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{u.googleId ? '🔵 Google' : '📧 Email'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {u._id !== currentUser?._id && u.role !== 'admin' && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handlePromote(u._id, u.name)} className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg" title="Promote"><FiShield size={15} /></button>
                        <button onClick={() => handleDelete(u._id, u.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><FiTrash2 size={15} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No users found</p>}
      </div>
    </div>
  );
}

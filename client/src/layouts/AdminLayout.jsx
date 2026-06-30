import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiShoppingBag, FiUsers, FiMenu, FiX, FiLogOut, FiTag, FiImage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/hero', label: 'Hero Slides', icon: FiImage },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 sm:w-64 bg-dark text-white
        transform transition-transform duration-200 ease-in-out flex flex-col
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <FiTag className="text-accent text-xl sm:text-2xl flex-shrink-0" />
          <span className="text-base sm:text-xl font-heading font-bold text-accent truncate">Admin Panel</span>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 sm:px-4 sm:py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm sm:text-base"
          >
            <FiLogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <button
            className="lg:hidden p-2 text-dark hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FiMenu size={20} />
          </button>
          <h1 className="text-sm sm:text-lg font-semibold text-dark">DM Enterprice Admin</h1>
          <button
            className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(false)}
            style={{ visibility: sidebarOpen ? 'visible' : 'hidden' }}
          >
            <FiX size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

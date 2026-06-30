import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/category', label: 'Category' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="container-max px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 font-heading font-bold text-lg sm:text-xl text-primary flex-shrink-0">
              <img src="/logo.jpg" alt="Coffee Haven Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full" />
              <span>DM Enterprice</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `font-medium text-sm lg:text-base transition-colors ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {user && (
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
                  <FiShoppingCart size={20} className="sm:w-5 sm:h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold leading-none">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white items-center justify-center text-xs sm:text-sm font-bold"
                      style={{ display: user.avatar ? 'none' : 'flex' }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <FiUser size={15} /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <FiSettings size={15} /> Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                          <FiSettings size={15} /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50">
                        <FiLogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-primary transition-colors px-2">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary py-1.5 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-1"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1 pb-4">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg font-medium text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
              {!user && (
                <Link to="/login" className="block px-4 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              )}
              {user && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <Link to="/dashboard" className="block px-4 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/orders" className="block px-4 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2.5 text-primary font-medium text-sm hover:bg-primary/5 rounded-lg" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-red-600 font-medium text-sm hover:bg-red-50 rounded-lg">
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}

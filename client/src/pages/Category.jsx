import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const CATEGORIES = ['All', 'Coffee Mug', 'Key Chain', 'Magic Mirror', 'Mobile Cover', 'Customised T-Shirt', 'Photo Frame'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings', label: 'Top Rated' },
];

export default function Category() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    sort: searchParams.get('sort') || '-createdAt',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category !== 'All') params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.minPrice) params.set('price[gte]', filters.minPrice);
      if (filters.maxPrice) params.set('price[lte]', filters.maxPrice);
      params.set('page', filters.page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setPagination({ total: data.total, pages: data.pages, page: data.page });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const clearFilters = () => {
    setFilters({ search: '', category: 'All', sort: '-createdAt', minPrice: '', maxPrice: '', page: 1 });
    setSearchParams({});
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="relative py-10 sm:py-14 md:py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/page-banner.jpg')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2 sm:mb-3">Categories</h1>
          <p className="text-gray-300 max-w-md mx-auto text-sm sm:text-base">Browse our products by category</p>
        </div>
      </div>

      <div className="container-max px-3 sm:px-4 md:px-8 py-5 sm:py-8">

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search coffee..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field pl-9"
              aria-label="Search products"
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input-field flex-1 sm:w-44 md:w-52"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors flex-shrink-0 ${showFilters ? 'bg-primary text-white border-primary' : 'border-primary text-primary hover:bg-primary/5'}`}
            >
              <FiFilter size={15} />
              <span className="hidden xs:inline">Filter</span>
              <FiChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-sm sm:text-base">Price Filter</h3>
              <button onClick={clearFilters} className="text-xs sm:text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                <FiX size={13} /> Clear All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Min Price ($)</label>
                <input type="number" min="0" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} placeholder="0" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Max Price ($)</label>
                <input type="number" min="0" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} placeholder="100" className="input-field text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs — horizontally scrollable on mobile */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-5 sm:mb-8 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                filters.category === cat
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-primary/10 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <Spinner size="lg" className="py-16 sm:py-20" />
        ) : products.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-gray-400 text-base sm:text-lg">No products found.</p>
            <button onClick={clearFilters} className="mt-4 btn-secondary">Clear Filters</button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{pagination.total} products found</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      filters.page === i + 1 ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

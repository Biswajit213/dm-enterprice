import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiTag } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// Default categories — always present, cannot be deleted
const DEFAULT_CATEGORIES = [
  'Coffee Mug',
  'Key Chain',
  'Magic Mirror',
  'Mobile Cover',
  'Customised T-Shirt',
  'Photo Frame',
];

// Category icons map
const CATEGORY_ICONS = {
  'Coffee Mug': '☕',
  'Key Chain': '🔑',
  'Magic Mirror': '🪞',
  'Mobile Cover': '📱',
  'Customised T-Shirt': '👕',
  'Photo Frame': '🖼️',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🏷️');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all products to count per category
      const { data } = await api.get('/products?limit=1000');
      const counts = {};
      (data.products || []).forEach((p) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
      setProductCounts(counts);

      // Build categories list from defaults + any extra found in products
      const allCats = new Set([...DEFAULT_CATEGORIES]);
      Object.keys(counts).forEach((c) => allCats.add(c));

      const catList = [...allCats].map((name) => ({
        id: name,
        name,
        icon: CATEGORY_ICONS[name] || '🏷️',
        isDefault: DEFAULT_CATEGORIES.includes(name),
      }));
      setCategories(catList);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Category already exists');
      return;
    }
    setAdding(true);
    try {
      const newCat = { id: trimmed, name: trimmed, icon: newIcon, isDefault: false };
      setCategories((prev) => [...prev, newCat]);
      setNewName('');
      setNewIcon('🏷️');
      setShowAdd(false);
      toast.success(`Category "${trimmed}" added`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (cat) => {
    if (cat.isDefault) {
      toast.error('Default categories cannot be deleted');
      return;
    }
    const count = productCounts[cat.name] || 0;
    if (count > 0) {
      toast.error(`Cannot delete — ${count} product(s) use this category`);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    toast.success(`Category "${cat.name}" removed`);
  };

  const startEdit = (cat) => {
    if (cat.isDefault) {
      toast.error('Default categories cannot be renamed');
      return;
    }
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
  };

  const saveEdit = (cat) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    if (
      categories.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== cat.id
      )
    ) {
      toast.error('Category name already exists');
      return;
    }
    setCategories((prev) =>
      prev.map((c) =>
        c.id === cat.id ? { ...c, name: trimmed, icon: editIcon } : c
      )
    );
    setEditingId(null);
    toast.success('Category updated');
  };

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  const totalProducts = Object.values(productCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Categories</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {categories.length} categories · {totalProducts} total products
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 btn-primary text-sm"
        >
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-2 border-primary/20">
          <h2 className="font-semibold text-dark mb-4 flex items-center gap-2">
            <FiPlus size={16} className="text-primary" /> New Category
          </h2>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="input-field w-16 text-center text-xl"
                maxLength={2}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Pillow Cover"
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding}
                className="btn-primary flex items-center gap-1.5 text-sm"
              >
                <FiSave size={15} /> {adding ? 'Adding...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setNewName(''); setNewIcon('🏷️'); }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = productCounts[cat.name] || 0;
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-5 flex items-center gap-4 group border border-gray-100 hover:border-primary/30 transition-colors"
            >
              {/* Icon */}
              {isEditing ? (
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  className="w-12 h-12 text-2xl text-center border-2 border-primary rounded-xl flex-shrink-0"
                  maxLength={2}
                />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {cat.icon}
                </div>
              )}

              {/* Name + count */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field text-sm py-1.5 w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(cat);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                ) : (
                  <>
                    <p className="font-semibold text-dark text-sm sm:text-base truncate">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {count} product{count !== 1 ? 's' : ''}
                      {cat.isDefault && (
                        <span className="ml-2 text-primary font-medium">· Default</span>
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveEdit(cat)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Save"
                    >
                      <FiSave size={15} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <FiX size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      disabled={cat.isDefault}
                      className={`p-1.5 rounded-lg transition-colors ${
                        cat.isDefault
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                      }`}
                      title={cat.isDefault ? 'Default categories cannot be renamed' : 'Edit'}
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={cat.isDefault || count > 0}
                      className={`p-1.5 rounded-lg transition-colors ${
                        cat.isDefault || count > 0
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={
                        cat.isDefault
                          ? 'Default categories cannot be deleted'
                          : count > 0
                          ? `${count} product(s) use this category`
                          : 'Delete'
                      }
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-dark mb-4 flex items-center gap-2 text-sm sm:text-base">
          <FiTag size={16} className="text-primary" /> Products per Category
        </h2>
        <div className="space-y-3">
          {categories.map((cat) => {
            const count = productCounts[cat.name] || 0;
            const pct = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <span>{cat.icon}</span> {cat.name}
                  </span>
                  <span className="font-medium text-dark">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

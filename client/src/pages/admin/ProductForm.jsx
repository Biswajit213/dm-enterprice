import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const CATEGORIES = ['Coffee Mug', 'Key Chain', 'Magic Mirror', 'Mobile Cover', 'Customised T-Shirt', 'Photo Frame'];

// Predefined sizes per category
const CATEGORY_SIZES = {
  'Photo Frame': ['4x6 inch', '5x7 inch', '6x8 inch', '8x10 inch', '10x12 inch', '12x16 inch', 'A4 (8.3x11.7 inch)', 'A3 (11.7x16.5 inch)'],
  'Customised T-Shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'Mobile Cover': ['iPhone 13', 'iPhone 14', 'iPhone 15', 'Samsung S23', 'Samsung S24', 'Redmi Note 12', 'Redmi Note 13', 'OnePlus 11', 'OnePlus 12', 'Realme 11'],
  'Coffee Mug': ['250ml', '350ml', '450ml'],
  'Magic Mirror': ['Small (6x8 inch)', 'Medium (8x10 inch)', 'Large (10x12 inch)'],
  'Key Chain': [],
};

const INITIAL = {
  name: '',
  description: '',
  category: 'Coffee Mug',
  price: '',
  stock: '',
  isFeatured: false,
  isBestSeller: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Size management
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [customSize, setCustomSize] = useState('');

  const availableSizes = CATEGORY_SIZES[form.category] || [];
  const showSizes = availableSizes.length > 0;

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(({ data }) => {
          const p = data.product;
          setForm({
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price,
            stock: p.stock,
            isFeatured: p.isFeatured,
            isBestSeller: p.isBestSeller,
          });
          setSelectedSizes(p.sizes || []);
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  // Reset sizes when category changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'category') {
      setSelectedSizes([]);
      setCustomSize('');
    }
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addCustomSize = () => {
    const trimmed = customSize.trim();
    if (!trimmed) return;
    if (selectedSizes.includes(trimmed)) {
      toast.error('Size already added');
      return;
    }
    setSelectedSizes((prev) => [...prev, trimmed]);
    setCustomSize('');
  };

  const removeSize = (size) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== size));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));

      // Send sizes as JSON string
      formData.append('sizes', JSON.stringify(selectedSizes));

      images.forEach((img) => formData.append('images', img));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-dark">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isEdit ? 'Update product details' : 'Fill in the details to add a new product'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="space-y-5">

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-dark text-base border-b pb-3">Basic Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name" name="name" type="text" required
                value={form.name} onChange={handleChange}
                className="input-field"
                placeholder="e.g. Personalised Wooden Photo Frame"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description" name="description" required rows={4}
                value={form.description} onChange={handleChange}
                className="input-field resize-none"
                placeholder="Describe this product in detail..."
              />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category" name="category"
                  value={form.category} onChange={handleChange}
                  className="input-field"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="price" name="price" type="number" step="0.01" min="0" required
                  value={form.price} onChange={handleChange}
                  className="input-field"
                  placeholder="499"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="sm:w-1/2">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="stock" name="stock" type="number" min="0" required
                value={form.stock} onChange={handleChange}
                className="input-field"
                placeholder="100"
              />
            </div>

            {/* Flags */}
            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox" name="isFeatured"
                  checked={form.isFeatured} onChange={handleChange}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox" name="isBestSeller"
                  checked={form.isBestSeller} onChange={handleChange}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm font-medium text-gray-700">Best Seller</span>
              </label>
            </div>
          </div>

          {/* Size Section — only shown when category has sizes */}
          {showSizes && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="border-b pb-3">
                <h2 className="font-semibold text-dark text-base">Available Sizes</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Select the sizes available for this {form.category}
                </p>
              </div>

              {/* Preset size buttons */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Select from common sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom size input */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Or add a custom size:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                    placeholder={form.category === 'Photo Frame' ? 'e.g. 16x20 inch' : 'e.g. Custom size'}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
                  >
                    <FiPlus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Selected sizes display */}
              {selectedSizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Selected sizes ({selectedSizes.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSizes.map((size) => (
                      <span
                        key={size}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="hover:text-red-500 transition-colors"
                          aria-label={`Remove ${size}`}
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSizes.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  ⚠️ No sizes selected. Customers won't have a size option at checkout.
                </p>
              )}
            </div>
          )}

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-dark text-base border-b pb-3">
              {isEdit ? 'Replace Images (optional)' : 'Product Images'}
            </h2>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20 cursor-pointer"
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 px-6"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

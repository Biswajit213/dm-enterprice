import React, { useEffect, useState, useRef } from 'react';
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiImage } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

export default function AdminHero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchSlides = async () => {
    try {
      const { data } = await api.get('/hero/all');
      setSlides(data.slides);
    } catch {
      toast.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('order', slides.length);
      await api.post('/hero', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Slide added!');
      fetchSlides();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleActive = async (slide) => {
    try {
      await api.put(`/hero/${slide._id}`, { isActive: !slide.isActive });
      setSlides((prev) => prev.map((s) => s._id === slide._id ? { ...s, isActive: !s.isActive } : s));
      toast.success(slide.isActive ? 'Slide hidden' : 'Slide visible');
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteSlide = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      await api.delete(`/hero/${id}`);
      setSlides((prev) => prev.filter((s) => s._id !== id));
      toast.success('Slide deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[300px]" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-dark">Hero Slides</h1>
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <FiPlus size={16} />
          {uploading ? 'Uploading...' : 'Add Slide'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {slides.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <FiImage size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No slides yet. Add your first hero image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, i) => (
            <div key={slide._id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${slide.isActive ? 'border-green-400' : 'border-gray-200'}`}>
              <div className="relative aspect-video">
                <img src={slide.image.url} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                {!slide.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">Hidden</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {slide.isActive ? 'Visible' : 'Hidden'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(slide)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                    title={slide.isActive ? 'Hide slide' : 'Show slide'}
                  >
                    {slide.isActive ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                  <button
                    onClick={() => deleteSlide(slide._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete slide"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Green border = visible on homepage. Click eye icon to show/hide. Recommended size: 1920×1080px.
      </p>
    </div>
  );
}

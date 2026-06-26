import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { Plus, Trash2, Edit, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

/* ─────────────────────────────────────────
   TOAST  — design upgraded, logic identical
───────────────────────────────────────────*/
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      className={`flex items-start gap-3 p-4 mb-6 border-l-4 ${isError
          ? 'bg-red-50 border-l-[#C1121F] text-red-800'
          : 'bg-emerald-50 border-l-emerald-500 text-emerald-800'
        }`}
      style={{ borderRadius: 0 }}
    >
      {isError
        ? <AlertCircle size={16} className="text-[#C1121F] shrink-0 mt-0.5" />
        : <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
      }
      <p className="text-[12px] font-sans flex-1 leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-40 hover:opacity-80 shrink-0 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT — all logic identical
───────────────────────────────────────────*/
export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load categories. Check that the backend server is running.';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleOpenEdit = (cat) => { setEditingCat(cat); setModalOpen(true); clearToast(); };
  const handleOpenCreate = () => { setEditingCat(null); setModalOpen(true); clearToast(); };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    clearToast();
    const formData = new FormData(e.target);
    try {
      if (editingCat) {
        const res = await API.put(`/categories/${editingCat.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.success) { setModalOpen(false); showToast('success', `Category "${res.data.data?.name || editingCat.name}" updated successfully.`); }
      } else {
        const res = await API.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.success) { setModalOpen(false); showToast('success', `Category created successfully.`); }
      }
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please try again.';
      showToast('error', `Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const token = localStorage.getItem('token');
    if (!token) { showToast('error', 'Your session has expired. Please log out and log back in.'); return; }
    if (!window.confirm(`Delete category "${name}"?\n\nThis will also soft-delete all Collections and Products inside it.`)) return;
    setDeletingId(id);
    clearToast();
    try {
      const res = await API.delete(`/categories/${id}`);
      if (res.data.success) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        showToast('success', res.data.message || `Category "${name}" deleted successfully.`);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      if (status === 403) showToast('error', `Permission denied: ${msg}\n\nMake sure you are logged in as Admin or Manager.`);
      else if (status === 404) { showToast('error', `Category not found — it may have already been deleted.`); setCategories(prev => prev.filter(cat => cat.id !== id)); }
      else if (status === 500) showToast('error', `Server error: ${msg}`);
      else if (!err.response) showToast('error', 'Cannot reach the backend server. Make sure it is running on port 5000.');
      else showToast('error', `Error (${status}): ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 border-[#C1121F]/20 border-t-[#C1121F] animate-spin"
        />
        <p className="text-[10px] tracking-[0.22em] uppercase text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          Loading Categories
        </p>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Page header ── */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-[10px] tracking-[0.26em] uppercase text-[#C1121F] font-semibold mb-1.5">
            Content Management
          </p>
          <h2 className="text-2xl font-light tracking-[0.08em] uppercase text-slate-800">
            Categories
          </h2>
          <p className="text-[11px] text-slate-400 tracking-[0.1em] mt-1">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} in your collection
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 shrink-0"
          style={{
            boxShadow: '0 2px 12px rgba(193,18,31,0.25)',
            borderRadius: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(193,18,31,0.32)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(193,18,31,0.25)'; }}
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New Category</span>
        </button>
      </div>

      {/* ── Toast ── */}
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* ── Empty state ── */}
      {categories.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Plus size={20} className="text-slate-300" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold">No categories yet</p>
          <p className="text-[11px] text-slate-400 mt-1.5">Click "New Category" to create the first one.</p>
        </div>
      )}

      {/* ── Category grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-slate-200/80 flex flex-col group"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.25s ease, transform 0.25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {/* Image */}
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img
                src={getImageUrl(cat.image, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800')}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'; }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Status badge */}
              <div
                className={`absolute top-3 right-3 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] font-bold border ${cat.status === 'active'
                    ? 'bg-white/95 text-emerald-700 border-emerald-200'
                    : 'bg-white/95 text-slate-500 border-slate-200'
                  }`}
              >
                {cat.status}
              </div>
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col flex-1 gap-4">
              <div className="space-y-1.5 flex-1">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-800 leading-snug">
                  {cat.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 block">
                  /categories/{cat.slug}
                </span>
                {cat.description && (
                  <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mt-2">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Footer row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#C1121F] font-semibold">
                  {cat.collections?.length || 0} {(cat.collections?.length || 0) === 1 ? 'Collection' : 'Collections'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 border border-slate-200 hover:border-slate-700 hover:text-slate-800 transition-all duration-150"
                    title="Edit Category"
                  >
                    <Edit size={11} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deletingId === cat.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 border border-slate-200 hover:border-[#C1121F] hover:text-[#C1121F] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Delete Category"
                  >
                    {deletingId === cat.id
                      ? <Loader2 size={11} className="animate-spin" />
                      : <Trash2 size={11} />
                    }
                    {deletingId === cat.id ? 'Deleting' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Panel */}
          <div
            className="relative w-full max-w-md bg-white z-10 flex flex-col"
            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
          >
            {/* Modal top accent */}
            <div className="h-[3px] bg-[#C1121F]" />

            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div>
                <p className="text-[9px] tracking-[0.24em] uppercase text-[#C1121F] font-semibold mb-0.5">
                  {editingCat ? 'Editing' : 'Creating'}
                </p>
                <h3 className="text-[15px] font-light uppercase tracking-[0.1em] text-slate-800">
                  {editingCat ? 'Modify Category' : 'New Category'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all rounded-lg"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="px-8 py-6 space-y-5">

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold block">
                  Category Name <span className="text-[#C1121F]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCat ? editingCat.name : ''}
                  placeholder="e.g. Kitchens"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#C1121F] focus:bg-white transition-colors duration-200"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold block">
                  Cover Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full text-[12px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:border file:border-slate-200 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:text-slate-600 file:bg-slate-50 file:cursor-pointer hover:file:border-[#C1121F] hover:file:text-[#C1121F] file:transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold block">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  defaultValue={editingCat ? editingCat.description : ''}
                  placeholder="Describe the category's design style and scope..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#C1121F] focus:bg-white transition-colors duration-200 resize-none leading-relaxed"
                />
              </div>

              {/* Status (edit only) */}
              {editingCat && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold block">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingCat.status}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:border-[#C1121F] focus:bg-white transition-colors duration-200 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[10px] uppercase tracking-[0.16em] font-semibold flex items-center gap-2 disabled:opacity-50 transition-all duration-200"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  {submitting ? 'Saving…' : editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
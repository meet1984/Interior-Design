import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

// Inline Toast Notification Component
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-none border mb-4 ${
      isError 
        ? 'bg-red-50 border-red-300 text-red-800' 
        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
    }`}>
      {isError 
        ? <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        : <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
      }
      <p className="text-xs font-sans flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 shrink-0">
        <X size={16} />
      </button>
    </div>
  );
};

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Persistent notification state
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load categories. Check that the backend server is running.';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setModalOpen(true);
    clearToast();
  };

  const handleOpenCreate = () => {
    setEditingCat(null);
    setModalOpen(true);
    clearToast();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    clearToast();
    const formData = new FormData(e.target);

    try {
      if (editingCat) {
        const res = await API.put(`/categories/${editingCat.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          setModalOpen(false);
          showToast('success', `Category "${res.data.data?.name || editingCat.name}" updated successfully.`);
        }
      } else {
        const res = await API.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          setModalOpen(false);
          showToast('success', `Category created successfully.`);
        }
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
    // Check token exists before proceeding
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('error', 'Your session has expired. Please log out and log back in.');
      return;
    }

    if (!window.confirm(`Delete category "${name}"?\n\nThis will also soft-delete all Collections and Products inside it.`)) return;
    
    setDeletingId(id);
    clearToast();

    try {
      const res = await API.delete(`/categories/${id}`);
      if (res.data.success) {
        // Optimistic update: remove from local state immediately (no refetch needed)
        setCategories(prev => prev.filter(cat => cat.id !== id));
        showToast('success', res.data.message || `Category "${name}" deleted successfully.`);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      
      if (status === 403) {
        showToast('error', `Permission denied: ${msg}\n\nMake sure you are logged in as Admin or Manager.`);
      } else if (status === 404) {
        showToast('error', `Category not found — it may have already been deleted.`);
        // Remove from local state anyway
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } else if (status === 500) {
        showToast('error', `Server error: ${msg}`);
      } else if (!err.response) {
        showToast('error', 'Cannot reach the backend server. Make sure it is running on port 5000.');
      } else {
        showToast('error', `Error (${status}): ${msg}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-display">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Categories Curation</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Manage main product categories</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-gold !py-2 flex items-center gap-2"
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Persistent Error/Success Toast */}
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {categories.length === 0 && (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200">
          <p className="text-sm uppercase tracking-widest">No categories found</p>
          <p className="text-xs mt-2">Click "Add Category" to create the first one.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-slate-200/60 shadow-sm flex flex-col group justify-between">
            <div className="aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-100">
              <img 
                src={cat.image ? `${import.meta.env.VITE_API_URL}${cat.image}` : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-102 transform transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'; }}
              />
              <div className="absolute top-4 right-4 bg-white/95 border border-slate-200/50 px-2 py-0.5 text-[8px] uppercase tracking-widest font-semibold text-slate-600">
                {cat.status}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-light uppercase tracking-wider text-slate-800">{cat.name}</h3>
                <span className="text-[9px] font-mono text-slate-400 block">/categories/{cat.slug}</span>
                <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2 mt-2">{cat.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[9px] uppercase tracking-widest text-[#C8A97E] font-semibold">
                  Collections: {cat.collections?.length || 0}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 border border-slate-200 hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all"
                    title="Edit Category"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deletingId === cat.id}
                    className="p-1.5 border border-slate-200 hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Category"
                  >
                    {deletingId === cat.id 
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Trash2 size={12} />
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white p-8 border border-slate-100 shadow-2xl z-10 rounded-none">
            <h3 className="text-lg font-light uppercase tracking-widest text-primary mb-6">
              {editingCat ? 'Modify Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Category Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCat ? editingCat.name : ''}
                  placeholder="E.g., Kitchens"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Cover Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  defaultValue={editingCat ? editingCat.description : ''}
                  placeholder="Describe the architectural design constraints, features..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                ></textarea>
              </div>

              {editingCat && (
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Status</label>
                  <select
                    name="status"
                    defaultValue={editingCat.status}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 uppercase tracking-widest text-[9px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#C8A97E] hover:bg-[#AA8753] text-white uppercase tracking-widest text-[9px] font-semibold disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  {submitting ? 'Saving...' : 'Save Category'}
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

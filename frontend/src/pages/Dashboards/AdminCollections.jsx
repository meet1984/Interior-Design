import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-4 border mb-4 ${
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

export const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const colRes = await API.get('/collections');
      const catRes = await API.get('/categories');
      if (colRes.data.success) setCollections(colRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEdit = (col) => {
    setEditingCol(col);
    setModalOpen(true);
    clearToast();
  };

  const handleOpenCreate = () => {
    setEditingCol(null);
    setModalOpen(true);
    clearToast();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    clearToast();
    const formData = new FormData(e.target);

    try {
      if (editingCol) {
        const res = await API.put(`/collections/${editingCol.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          setModalOpen(false);
          showToast('success', 'Collection updated successfully.');
        }
      } else {
        const res = await API.post('/collections', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          setModalOpen(false);
          showToast('success', 'Collection created successfully.');
        }
      }
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please try again.';
      showToast('error', `Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('error', 'Your session has expired. Please log out and log back in.');
      return;
    }

    if (!window.confirm(`Delete collection "${name}"?\n\nAll products inside will also be soft-deleted.`)) return;
    
    setDeletingId(id);
    clearToast();

    try {
      const res = await API.delete(`/collections/${id}`);
      if (res.data.success) {
        // Optimistic update — no refetch needed
        setCollections(prev => prev.filter(col => col.id !== id));
        showToast('success', res.data.message || `Collection "${name}" deleted successfully.`);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      if (status === 403) {
        showToast('error', `Permission denied: ${msg}`);
      } else if (status === 404) {
        showToast('error', 'Collection not found — it may already be deleted.');
        setCollections(prev => prev.filter(col => col.id !== id));
      } else if (!err.response) {
        showToast('error', 'Cannot reach backend server. Make sure it is running on port 5000.');
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
          <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Collections Console</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Manage sub-collections inside primary categories</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-gold !py-2 flex items-center gap-2"
        >
          <Plus size={14} />
          <span>Add Collection</span>
        </button>
      </div>

      {/* Persistent Toast */}
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {collections.length === 0 && (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200">
          <p className="text-sm uppercase tracking-widest">No collections found</p>
          <p className="text-xs mt-2">Click "Add Collection" to create the first one.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((col) => (
          <div key={col.id} className="bg-white border border-slate-200/60 shadow-sm flex flex-col group justify-between">
            <div className="aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-100">
              <img 
                src={
                  col.image 
                    ? `${import.meta.env.VITE_API_URL}${col.image}`
                    : 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=400'
                } 
                alt={col.name} 
                className="w-full h-full object-cover group-hover:scale-102 transform transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=400'; }}
              />
              <div className="absolute top-4 right-4 bg-white/95 border border-slate-200/50 px-2 py-0.5 text-[8px] uppercase tracking-widest font-semibold text-[#C8A97E]">
                {col.category?.name || 'Category'}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-light uppercase tracking-wider text-slate-800">{col.name}</h3>
                <span className="text-[9px] font-mono text-slate-400 block">/collections/{col.slug}</span>
                <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2 mt-2">{col.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                  Status: {col.status}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(col)}
                    className="p-1.5 border border-slate-200 hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all"
                    title="Edit"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(col.id, col.name)}
                    disabled={deletingId === col.id}
                    className="p-1.5 border border-slate-200 hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deletingId === col.id 
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
              {editingCol ? 'Modify Collection' : 'Create Collection'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Parent Category</label>
                <select
                  name="categoryId"
                  required
                  defaultValue={editingCol ? editingCol.categoryId : ''}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Collection Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCol ? editingCol.name : ''}
                  placeholder="E.g., Sliding Wardrobe Systems"
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
                  defaultValue={editingCol ? editingCol.description : ''}
                  placeholder="Describe the collection finishes, engineering style..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                ></textarea>
              </div>

              {editingCol && (
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Status</label>
                  <select
                    name="status"
                    defaultValue={editingCol.status}
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
                  {submitting ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCollections;

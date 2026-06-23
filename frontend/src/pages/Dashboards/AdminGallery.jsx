import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Image as ImageIcon, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-4 border mb-4 ${
      isError ? 'bg-red-50 border-red-300 text-red-800' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
    }`}>
      {isError ? <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" /> : <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
      <p className="text-xs font-sans flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100"><X size={16} /></button>
    </div>
  );
};

export const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  
  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const galRes = await API.get('/gallery');
      const catRes = await API.get('/categories');
      if (galRes.data.success) setGallery(galRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load gallery.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    setSelectedFile(null);
    setDragActive(false);
    setModalOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);

    // Append file from state if changed via drag & drop
    if (selectedFile) {
      formData.set('image', selectedFile);
    } else if (!formData.get('image') || formData.get('image').size === 0) {
      showToast('error', 'Please select or drop an image file.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await API.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete gallery item "${title}"?`)) return;
    setDeletingId(id);
    clearToast();
    try {
      const res = await API.delete(`/gallery/${id}`);
      if (res.data.success) {
        showToast('success', `Gallery item deleted successfully.`);
        fetchData();
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      if (status === 403) {
        showToast('error', `Permission denied: ${msg}`);
      } else if (!err.response) {
        showToast('error', 'Cannot reach backend server on port 5000.');
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
          <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Gallery Curator</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Manage architectural details and design snapshots</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="btn-gold !py-2 flex items-center gap-2"
        >
          <Plus size={14} />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Persistent Toast */}
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 shadow-sm flex flex-col group relative aspect-square">
            <img 
              src={`${import.meta.env.VITE_API_URL}${item.filePath}`} 
              alt={item.title} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400'; }}
            />
            
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
              <div className="text-right">
                <button 
                  onClick={() => handleDelete(item.id, item.title)}
                  disabled={deletingId === item.id}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-none disabled:opacity-50"
                  title="Delete Gallery item"
                >
                  {deletingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-widest text-[#C8A97E] font-semibold">
                  {item.category?.name || 'Interior Detail'}
                </span>
                <h4 className="text-xs uppercase tracking-wider font-semibold line-clamp-1">{item.title}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white p-8 border border-slate-100 shadow-2xl z-10 rounded-none">
            <h3 className="text-lg font-light uppercase tracking-widest text-primary mb-6">Upload Gallery Snapshot</h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Snapshot Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="E.g., Recessed LED channels"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Image File</label>
                  <div 
                    className={`relative border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-24 ${
                      dragActive ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon size={18} className="text-slate-400 mb-2" />
                    {selectedFile ? (
                      <p className="text-[10px] text-primary font-medium truncate w-full px-2">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Drag & drop</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">or click to browse</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Link to Category</label>
                  <select
                    name="categoryId"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E] h-24"
                  >
                    <option value="">None</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Provide focus details on lighting, textures, millwork profiles..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
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
                  className="px-6 py-2 bg-[#C8A97E] hover:bg-[#AA8753] text-white uppercase tracking-widest text-[9px] font-semibold"
                >
                  {submitting ? 'Uploading...' : 'Upload Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminGallery;

import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Edit, Check, Star, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

// Inline persistent toast — never auto-dismisses
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

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Persistent notification
  const [toast, setToast] = useState({ type: '', message: '' });
  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  // Dynamic dropdown state for creation/edit
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [filteredCollections, setFilteredCollections] = useState([]);

  // Drag and Drop states
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [dragActiveThumb, setDragActiveThumb] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);

  // Drag and Drop handlers
  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === 'thumb') setDragActiveThumb(true);
      if (type === 'gallery') setDragActiveGallery(true);
    } else if (e.type === "dragleave") {
      if (type === 'thumb') setDragActiveThumb(false);
      if (type === 'gallery') setDragActiveGallery(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'thumb') setDragActiveThumb(false);
    if (type === 'gallery') setDragActiveGallery(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      if (type === 'thumb') {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          setThumbnailFile(file);
          setThumbnailPreview(URL.createObjectURL(file));
        }
      } else if (type === 'gallery') {
        const validFiles = files.filter(f => f.type.startsWith('image/'));
        setNewGalleryFiles(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setNewGalleryPreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      if (type === 'thumb') {
        const file = files[0];
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
      } else if (type === 'gallery') {
        const validFiles = files.filter(f => f.type.startsWith('image/'));
        setNewGalleryFiles(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setNewGalleryPreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const removeExistingImage = (img) => {
    setExistingImages(prev => prev.filter(item => item !== img));
  };

  const removeNewGalleryFile = (index) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const prodRes = await API.get('/products');
      const catRes = await API.get('/categories');
      const colRes = await API.get('/collections');

      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (colRes.data.success) setCollections(colRes.data.data);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load products. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update collections dropdown list when selected category changes
  useEffect(() => {
    if (selectedCategoryId) {
      setFilteredCollections(collections.filter(col => col.categoryId === parseInt(selectedCategoryId)));
    } else {
      setFilteredCollections([]);
    }
  }, [selectedCategoryId, collections]);

  const handleOpenEdit = (prod) => {
    setEditingProd(prod);
    setSelectedCategoryId(prod.categoryId);
    setThumbnailFile(null);
    setThumbnailPreview(prod.thumbnail ? `${import.meta.env.VITE_API_URL}${prod.thumbnail}` : '');
    setExistingImages(prod.images || []);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProd(null);
    setSelectedCategoryId('');
    setThumbnailFile(null);
    setThumbnailPreview('');
    setExistingImages([]);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);

    // If checkbox featuredFlag is not selected, append false
    if (!formData.get('featuredFlag')) {
      formData.append('featuredFlag', 'false');
    }

    // Replace default file inputs with our state-managed file uploads
    formData.delete('thumbnail');
    formData.delete('images');

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    if (newGalleryFiles && newGalleryFiles.length > 0) {
      newGalleryFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    // Pass the existing images list to retain/delete files
    formData.append('existingImages', JSON.stringify(existingImages));

    try {
      if (editingProd) {
        const res = await API.put(`/products/${editingProd.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) setModalOpen(false);
      } else {
        const res = await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) setModalOpen(false);
      }
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please try again.';
      showToast('error', `Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('error', 'Your session has expired. Please log out and log back in.');
      return;
    }

    if (!window.confirm(`Soft delete product "${title}"?`)) return;
    setDeletingId(id);
    clearToast();
    try {
      const res = await API.delete(`/products/${id}`);
      if (res.data.success) {
        // Optimistic update — remove from local state, no refetch
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('success', res.data.message || `Product "${title}" deleted successfully.`);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      if (status === 403) {
        showToast('error', `Permission denied: ${msg}`);
      } else if (status === 404) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('error', 'Product already deleted.');
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
          <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Products Inventory</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Manage luxury product specifications</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-gold !py-2 flex items-center gap-2"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Persistent Toast Notification */}
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Products list table */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              <th className="p-4">Product Details</th>
              <th className="p-4">Hierarchy</th>
              <th className="p-4">Specifications</th>
              <th className="p-4">Price</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-50/50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-9 bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img 
                      src={prod.thumbnail ? `${import.meta.env.VITE_API_URL}${prod.thumbnail}` : ''} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200'; }}
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">{prod.title}</span>
                    <span className="text-[9px] font-mono text-slate-400">/products/{prod.slug}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[9px] uppercase tracking-wider text-[#C8A97E] font-semibold block">{prod.category?.name}</span>
                  <span className="text-[9px] uppercase text-slate-400 block">{prod.collection?.name}</span>
                </td>
                <td className="p-4 text-slate-500">
                  <span className="block text-[10px]"><strong>Mat:</strong> {prod.material?.split(',')[0]}</span>
                  <span className="block text-[10px]"><strong>Dim:</strong> {prod.dimensions}</span>
                </td>
                <td className="p-4 font-semibold text-slate-800">€{parseFloat(prod.price).toLocaleString('de-DE')}.00</td>
                <td className="p-4">
                  {prod.featuredFlag ? (
                    <span className="text-amber-500 flex items-center gap-1 font-semibold text-[9px] uppercase tracking-widest">
                      <Star size={12} fill="#F59E0B" /> Featured
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 uppercase tracking-widest text-[8px] font-semibold border ${
                    prod.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : prod.status === 'out_of_stock'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {prod.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(prod.id, prod.title)}
                      disabled={deletingId === prod.id}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete Product"
                    >
                      {deletingId === prod.id 
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white p-8 border border-slate-100 shadow-2xl z-10 rounded-none overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-light uppercase tracking-widest text-primary mb-6">
              {editingProd ? 'Modify Product Specifications' : 'Create Product Entry'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Category</label>
                  <select
                    name="categoryId"
                    required
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Collection Dropdown - Filtered */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Collection</label>
                  <select
                    name="collectionId"
                    required
                    disabled={!selectedCategoryId}
                    defaultValue={editingProd ? editingProd.collectionId : ''}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Collection</option>
                    {filteredCollections.map((col) => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Price */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Product Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingProd ? editingProd.title : ''}
                    placeholder="E.g., Nero Pure Matte"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Base Price (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    defaultValue={editingProd ? editingProd.price : ''}
                    placeholder="E.g., 48000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
              </div>

              {/* Material & Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Materials</label>
                  <input
                    type="text"
                    name="material"
                    defaultValue={editingProd ? editingProd.material : ''}
                    placeholder="Quartzite, Oak Veneers, Aluminum"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    defaultValue={editingProd ? editingProd.dimensions : ''}
                    placeholder="E.g., 320cm x 120cm"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
              </div>

              {/* Uploads (Drag-and-Drop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thumbnail Drop Zone */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Thumbnail Image</label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'thumb')}
                    onDragOver={(e) => handleDrag(e, 'thumb')}
                    onDragLeave={(e) => handleDrag(e, 'thumb')}
                    onDrop={(e) => handleDrop(e, 'thumb')}
                    className={`relative border border-dashed p-3 flex flex-col items-center justify-center text-center transition-all duration-200 h-28 ${
                      dragActiveThumb ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-slate-200 hover:border-[#C8A97E] bg-slate-50/50'
                    }`}
                  >
                    {thumbnailPreview ? (
                      <div className="relative w-full h-full group">
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 font-sans text-[8px] uppercase tracking-widest font-semibold"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'thumb')}
                          className="hidden"
                        />
                        <Plus size={16} className="text-slate-400 mb-1" />
                        <span className="text-[9px] text-slate-500 font-medium">Drag & drop or Click to upload</span>
                        <span className="text-[7px] text-slate-400 uppercase tracking-wider mt-0.5">Thumbnail image</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Gallery Drop Zone */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Gallery Images (Multiple)</label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'gallery')}
                    onDragOver={(e) => handleDrag(e, 'gallery')}
                    onDragLeave={(e) => handleDrag(e, 'gallery')}
                    onDrop={(e) => handleDrop(e, 'gallery')}
                    className={`relative border border-dashed p-3 flex flex-col items-center justify-center text-center transition-all duration-200 h-28 ${
                      dragActiveGallery ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-slate-200 hover:border-[#C8A97E] bg-slate-50/50'
                    }`}
                  >
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'gallery')}
                        className="hidden"
                      />
                      <Plus size={16} className="text-slate-400 mb-1" />
                      <span className="text-[9px] text-slate-500 font-medium">Drag & drop or Click to upload</span>
                      <span className="text-[7px] text-slate-400 uppercase tracking-wider mt-0.5">Gallery images</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Gallery Previews Container */}
              {(existingImages.length > 0 || newGalleryPreviews.length > 0) && (
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">
                    Product Gallery Images ({existingImages.length + newGalleryPreviews.length})
                  </span>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-100">
                    {/* Existing Images */}
                    {existingImages.map((img, index) => (
                      <div key={`exist-${index}`} className="relative w-16 h-12 border border-slate-200 group overflow-hidden">
                        <img src={`${import.meta.env.VITE_API_URL}${img}`} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}

                    {/* New Uploaded Images */}
                    {newGalleryPreviews.map((src, index) => (
                      <div key={`new-${index}`} className="relative w-16 h-12 border border-emerald-200 group overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <span className="absolute top-0.5 left-0.5 bg-emerald-500 text-white text-[6px] px-1 font-bold uppercase tracking-widest">NEW</span>
                        <button
                          type="button"
                          onClick={() => removeNewGalleryFile(index)}
                          className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Description Specifications</label>
                <textarea
                  name="description"
                  rows="4"
                  defaultValue={editingProd ? editingProd.description : ''}
                  placeholder="Detail engineering highlights, hardware systems (Blum/Grass)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                ></textarea>
              </div>

              {/* Checkboxes & Status */}
              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featuredFlag"
                    name="featuredFlag"
                    value="true"
                    defaultChecked={editingProd ? editingProd.featuredFlag : false}
                    className="w-4 h-4 text-[#C8A97E] border-slate-300 rounded focus:ring-0"
                  />
                  <label htmlFor="featuredFlag" className="ml-2 text-[9px] uppercase tracking-widest text-slate-500 font-semibold cursor-pointer">
                    Feature in Homepage
                  </label>
                </div>

                {editingProd && (
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Status</label>
                    <select
                      name="status"
                      defaultValue={editingProd.status}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                )}
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
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminProducts;

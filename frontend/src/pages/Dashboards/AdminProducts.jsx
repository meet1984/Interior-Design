import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Edit, Star, AlertCircle, CheckCircle, X, Loader2, ImageOff, Upload } from 'lucide-react';
import { getImageUrl } from '../../services/imageUrl';

/* ------------------------------------------------------------------ */
/*  Toast — accessible, auto-roled by type                            */
/* ------------------------------------------------------------------ */
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-lg border p-4 mb-6 transition-colors ${
        isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      {isError ? (
        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <p className="text-sm flex-1 leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-current opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Status pill — same visual language as Collections                */
/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  out_of_stock: 'bg-amber-50 text-amber-700',
  inactive: 'bg-red-50 text-red-700',
};
const STATUS_DOT = {
  active: 'bg-emerald-500',
  out_of_stock: 'bg-amber-500',
  inactive: 'bg-red-500',
};
const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
      STATUS_STYLES[status] || 'bg-stone-100 text-stone-500'
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || 'bg-stone-400'}`} aria-hidden="true" />
    {status.replace('_', ' ')}
  </span>
);

/* ------------------------------------------------------------------ */
/*  Product thumbnail with graceful fallback                          */
/* ------------------------------------------------------------------ */
const ProductThumb = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-100 text-stone-300">
        <ImageOff size={14} aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="h-9 w-12 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
      <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Dropzone — shared visual shell for thumbnail / gallery uploaders  */
/* ------------------------------------------------------------------ */
const Dropzone = ({ active, onDragEnter, onDragOver, onDragLeave, onDrop, children }) => (
  <div
    onDragEnter={onDragEnter}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    className={`relative flex h-28 flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors duration-200 ${
      active ? 'border-[#C1121F] bg-red-50/50' : 'border-stone-200 bg-stone-50 hover:border-stone-300'
    }`}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Product modal — focus trap + Escape-to-close                      */
/* ------------------------------------------------------------------ */
const ProductModal = ({
  editingProd,
  categories,
  filteredCollections,
  selectedCategoryId,
  setSelectedCategoryId,
  submitting,
  thumbnailPreview,
  existingImages,
  newGalleryPreviews,
  dragActiveThumb,
  dragActiveGallery,
  onDrag,
  onDrop,
  onFileChange,
  removeThumbnail,
  removeExistingImage,
  removeNewGalleryFile,
  onClose,
  onSubmit,
}) => {
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    firstFieldRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const totalGalleryCount = existingImages.length + newGalleryPreviews.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-white p-7 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 id={titleId} className="text-base font-semibold text-stone-900">
            {editingProd ? 'Edit Product' : 'New Product'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-stone-400 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-sm">
          {/* Category / Collection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="block text-xs font-medium text-stone-500">
                Category
              </label>
              <select
                ref={firstFieldRef}
                id="categoryId"
                name="categoryId"
                required
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="collectionId" className="block text-xs font-medium text-stone-500">
                Collection
              </label>
              <select
                id="collectionId"
                name="collectionId"
                required
                disabled={!selectedCategoryId}
                defaultValue={editingProd ? editingProd.collectionId : ''}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
              >
                <option value="">Select collection</option>
                {filteredCollections.map((col) => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title / Price */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label htmlFor="title" className="block text-xs font-medium text-stone-500">
                Product Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                required
                defaultValue={editingProd ? editingProd.title : ''}
                placeholder="e.g. Nero Pure Matte"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="price" className="block text-xs font-medium text-stone-500">
                Price (EUR)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                name="price"
                required
                defaultValue={editingProd ? editingProd.price : ''}
                placeholder="48000"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
          </div>

          {/* Material / Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="material" className="block text-xs font-medium text-stone-500">
                Materials
              </label>
              <input
                id="material"
                type="text"
                name="material"
                defaultValue={editingProd ? editingProd.material : ''}
                placeholder="Quartzite, Oak Veneers, Aluminum"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="dimensions" className="block text-xs font-medium text-stone-500">
                Dimensions
              </label>
              <input
                id="dimensions"
                type="text"
                name="dimensions"
                defaultValue={editingProd ? editingProd.dimensions : ''}
                placeholder="320cm x 120cm"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
          </div>

          {/* Uploads */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-500">Thumbnail Image</label>
              <Dropzone
                active={dragActiveThumb}
                onDragEnter={(e) => onDrag(e, 'thumb')}
                onDragOver={(e) => onDrag(e, 'thumb')}
                onDragLeave={(e) => onDrag(e, 'thumb')}
                onDrop={(e) => onDrop(e, 'thumb')}
              >
                {thumbnailPreview ? (
                  <div className="group relative h-full w-full">
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full rounded-[6px] object-cover" />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      aria-label="Remove thumbnail image"
                      className="absolute inset-0 flex items-center justify-center rounded-[6px] bg-stone-900/60 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onFileChange(e, 'thumb')}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:ring-2 focus-visible:ring-[#C1121F]"
                    />
                    <Upload size={16} className="mb-1.5 text-stone-400" aria-hidden="true" />
                    <span className="text-xs font-medium text-stone-500">Drag &amp; drop or click</span>
                    <span className="text-[11px] text-stone-400">Thumbnail image</span>
                  </label>
                )}
              </Dropzone>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-500">Gallery Images</label>
              <Dropzone
                active={dragActiveGallery}
                onDragEnter={(e) => onDrag(e, 'gallery')}
                onDragOver={(e) => onDrag(e, 'gallery')}
                onDragLeave={(e) => onDrag(e, 'gallery')}
                onDrop={(e) => onDrop(e, 'gallery')}
              >
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => onFileChange(e, 'gallery')}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:ring-2 focus-visible:ring-[#C1121F]"
                  />
                  <Upload size={16} className="mb-1.5 text-stone-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-stone-500">Drag &amp; drop or click</span>
                  <span className="text-[11px] text-stone-400">Gallery images (multiple)</span>
                </label>
              </Dropzone>
            </div>
          </div>

          {/* Gallery previews */}
          {totalGalleryCount > 0 && (
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-stone-500">
                Gallery images ({totalGalleryCount})
              </span>
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-md border border-stone-100 bg-stone-50 p-2">
                {existingImages.map((img, index) => (
                  <div key={`exist-${index}`} className="group relative h-12 w-16 overflow-hidden rounded-md border border-stone-200">
                    <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      aria-label="Remove this gallery image"
                      className="absolute inset-0 flex items-center justify-center bg-red-900/75 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}

                {newGalleryPreviews.map((src, index) => (
                  <div key={`new-${index}`} className="group relative h-12 w-16 overflow-hidden rounded-md border border-emerald-200">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute left-0.5 top-0.5 rounded bg-emerald-500 px-1 text-[9px] font-semibold uppercase tracking-wide text-white">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewGalleryFile(index)}
                      aria-label="Remove this new gallery image"
                      className="absolute inset-0 flex items-center justify-center bg-red-900/75 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-medium text-stone-500">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={editingProd ? editingProd.description : ''}
              placeholder="Engineering highlights, hardware systems (Blum/Grass)..."
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
          </div>

          {/* Featured / Status */}
          <div className="grid grid-cols-2 items-center gap-4 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featuredFlag"
                name="featuredFlag"
                value="true"
                defaultChecked={editingProd ? editingProd.featuredFlag : false}
                className="h-4 w-4 rounded border-stone-300 text-[#C1121F] focus:ring-[#C1121F]"
              />
              <label htmlFor="featuredFlag" className="cursor-pointer text-xs font-medium text-stone-600">
                Feature on homepage
              </label>
            </div>

            {editingProd && (
              <div className="space-y-1.5">
                <label htmlFor="status" className="block text-xs font-medium text-stone-500">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editingProd.status}
                  className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-md bg-[#C1121F] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9B0F18] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {submitting ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [toast, setToast] = useState({ type: '', message: '' });
  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [filteredCollections, setFilteredCollections] = useState([]);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [dragActiveThumb, setDragActiveThumb] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);

  // Track blob URLs created in this session so we can revoke them on
  // removal/close and avoid leaking memory across many uploads.
  const blobUrlsRef = useRef(new Set());
  const trackBlobUrl = (url) => {
    blobUrlsRef.current.add(url);
    return url;
  };
  const revokeBlobUrl = (url) => {
    if (url && blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  };
  const revokeAllBlobUrls = () => {
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current.clear();
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      if (type === 'thumb') setDragActiveThumb(true);
      if (type === 'gallery') setDragActiveGallery(true);
    } else if (e.type === 'dragleave') {
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
          revokeBlobUrl(thumbnailPreview);
          setThumbnailFile(file);
          setThumbnailPreview(trackBlobUrl(URL.createObjectURL(file)));
        }
      } else if (type === 'gallery') {
        const validFiles = files.filter((f) => f.type.startsWith('image/'));
        setNewGalleryFiles((prev) => [...prev, ...validFiles]);
        const newPreviews = validFiles.map((f) => trackBlobUrl(URL.createObjectURL(f)));
        setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);
      }
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      if (type === 'thumb') {
        const file = files[0];
        revokeBlobUrl(thumbnailPreview);
        setThumbnailFile(file);
        setThumbnailPreview(trackBlobUrl(URL.createObjectURL(file)));
      } else if (type === 'gallery') {
        const validFiles = files.filter((f) => f.type.startsWith('image/'));
        setNewGalleryFiles((prev) => [...prev, ...validFiles]);
        const newPreviews = validFiles.map((f) => trackBlobUrl(URL.createObjectURL(f)));
        setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);
      }
    }
  };

  const removeThumbnail = () => {
    revokeBlobUrl(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const removeExistingImage = (img) => {
    setExistingImages((prev) => prev.filter((item) => item !== img));
  };

  const removeNewGalleryFile = (index) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => {
      revokeBlobUrl(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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
      setFilteredCollections(collections.filter((col) => col.categoryId === parseInt(selectedCategoryId)));
    } else {
      setFilteredCollections([]);
    }
  }, [selectedCategoryId, collections]);

  const handleOpenEdit = (prod) => {
    setEditingProd(prod);
    setSelectedCategoryId(prod.categoryId);
    setThumbnailFile(null);
    setThumbnailPreview(getImageUrl(prod.thumbnail));
    setExistingImages(prod.images || []);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    clearToast();
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
    clearToast();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    revokeAllBlobUrls();
    setModalOpen(false);
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
      newGalleryFiles.forEach((file) => {
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
        if (res.data.success) {
          revokeAllBlobUrls();
          setModalOpen(false);
        }
      } else {
        const res = await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          revokeAllBlobUrls();
          setModalOpen(false);
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
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('success', res.data.message || `Product "${title}" deleted successfully.`);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      if (status === 403) {
        showToast('error', `Permission denied: ${msg}`);
      } else if (status === 404) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
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
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-300" aria-hidden="true" />
        <span className="sr-only">Loading products…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Products</h2>
          <p className="mt-0.5 text-sm text-stone-500">Manage luxury product specifications.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#C1121F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B0F18] focus:outline-none focus:ring-2 focus:ring-red-200 sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          Add Product
        </button>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Empty state */}
      {products.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <p className="text-sm font-medium text-stone-600">No products yet</p>
          <p className="mt-1 text-sm text-stone-400">Click "Add Product" to create the first one.</p>
        </div>
      )}

      {/* Table */}
      {products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                <th scope="col" className="p-4">Product</th>
                <th scope="col" className="p-4">Hierarchy</th>
                <th scope="col" className="p-4">Specifications</th>
                <th scope="col" className="p-4">Price</th>
                <th scope="col" className="p-4">Featured</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((prod) => {
                const imgSrc = getImageUrl(prod.thumbnail);
                const isDeleting = deletingId === prod.id;

                return (
                  <tr key={prod.id} className="transition-colors hover:bg-stone-50/70">
                    <td className="flex items-center gap-3 p-4">
                      <ProductThumb src={imgSrc} alt="" />
                      <div>
                        <span className="block font-medium text-stone-800">{prod.title}</span>
                        <span className="font-mono text-[11px] text-stone-400">/products/{prod.slug}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="block text-xs font-medium text-stone-700">{prod.category?.name}</span>
                      <span className="block text-xs text-stone-400">{prod.collection?.name}</span>
                    </td>
                    <td className="p-4 text-xs text-stone-500">
                      <span className="block"><span className="font-medium text-stone-600">Material:</span> {prod.material?.split(',')[0]}</span>
                      <span className="block"><span className="font-medium text-stone-600">Dim:</span> {prod.dimensions}</span>
                    </td>
                    <td className="p-4 font-medium text-stone-800">
                      €{parseFloat(prod.price).toLocaleString('de-DE')}.00
                    </td>
                    <td className="p-4">
                      {prod.featuredFlag ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          <Star size={12} fill="#D97706" className="text-amber-600" aria-hidden="true" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusPill status={prod.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          aria-label={`Edit ${prod.title}`}
                          className="rounded-md border border-stone-200 p-2 text-stone-500 transition-colors hover:border-[#C1121F] hover:text-[#C1121F] focus:outline-none focus:ring-2 focus:ring-red-100"
                        >
                          <Edit size={14} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          disabled={isDeleting}
                          aria-label={`Delete ${prod.title}`}
                          className="rounded-md border border-stone-200 p-2 text-stone-500 transition-colors hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-100"
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 size={14} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ProductModal
          editingProd={editingProd}
          categories={categories}
          filteredCollections={filteredCollections}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          submitting={submitting}
          thumbnailPreview={thumbnailPreview}
          existingImages={existingImages}
          newGalleryPreviews={newGalleryPreviews}
          dragActiveThumb={dragActiveThumb}
          dragActiveGallery={dragActiveGallery}
          onDrag={handleDrag}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          removeThumbnail={removeThumbnail}
          removeExistingImage={removeExistingImage}
          removeNewGalleryFile={removeNewGalleryFile}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AdminProducts;
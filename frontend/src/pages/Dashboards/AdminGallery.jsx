import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Image as ImageIcon, AlertCircle, CheckCircle, X, Loader2, ImageOff } from 'lucide-react';
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
/*  Gallery tile image with graceful fallback                         */
/* ------------------------------------------------------------------ */
const GalleryThumb = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-300">
        <ImageOff size={28} aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
      onError={() => setFailed(true)}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  Upload modal — focus trap + Escape-to-close                       */
/* ------------------------------------------------------------------ */
const UploadModal = ({
  categories,
  submitting,
  dragActive,
  selectedFile,
  onClose,
  onSubmit,
  onDrag,
  onDrop,
  onFileChange,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-xl border border-stone-200 bg-white p-7 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 id={titleId} className="text-base font-semibold text-stone-900">
            Upload Gallery Image
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
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-medium text-stone-500">
              Title
            </label>
            <input
              ref={firstFieldRef}
              id="title"
              type="text"
              name="title"
              required
              placeholder="e.g. Recessed LED channels"
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="image" className="block text-xs font-medium text-stone-500">
                Image File
              </label>
              <div
                className={`relative flex h-24 flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors ${
                  dragActive
                    ? 'border-[#C1121F] bg-red-50/50'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
              >
                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={onFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:ring-2 focus-visible:ring-[#C1121F]"
                />
                <ImageIcon size={18} className="mb-1.5 text-stone-400" aria-hidden="true" />
                {selectedFile ? (
                  <p className="w-full truncate px-2 text-xs font-medium text-stone-700">
                    {selectedFile.name}
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-medium text-stone-500">Drag &amp; drop</p>
                    <p className="text-[11px] text-stone-400">or click to browse</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="block text-xs font-medium text-stone-500">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="h-24 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-medium text-stone-500">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Lighting, textures, millwork profiles..."
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
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
              {submitting ? 'Uploading…' : 'Upload Asset'}
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
export const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Drag and Drop state
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
    clearToast();
    setModalOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    clearToast();
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
        showToast('success', 'Gallery item deleted successfully.');
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
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-300" aria-hidden="true" />
        <span className="sr-only">Loading gallery…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Gallery</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Manage architectural details and design snapshots.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#C1121F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B0F18] focus:outline-none focus:ring-2 focus:ring-red-200 sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          Upload Image
        </button>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Empty state */}
      {gallery.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <p className="text-sm font-medium text-stone-600">No gallery images yet</p>
          <p className="mt-1 text-sm text-stone-400">
            Click "Upload Image" to add the first snapshot.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((item) => {
          const imgSrc = getImageUrl(item.filePath);
          const isDeleting = deletingId === item.id;

          return (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <GalleryThumb src={imgSrc} alt={item.title} />

              <div className="absolute inset-0 flex flex-col justify-between bg-stone-900/0 p-3 opacity-0 transition-opacity duration-200 group-hover:bg-stone-900/55 group-hover:opacity-100">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={isDeleting}
                    aria-label={`Delete ${item.title}`}
                    className="rounded-md bg-red-600 p-1.5 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    {isDeleting ? (
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 size={14} aria-hidden="true" />
                    )}
                  </button>
                </div>
                <div className="space-y-0.5 text-white">
                  <span className="text-[11px] font-medium text-red-200">
                    {item.category?.name || 'Interior Detail'}
                  </span>
                  <h4 className="line-clamp-1 text-sm font-semibold">{item.title}</h4>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <UploadModal
          categories={categories}
          submitting={submitting}
          dragActive={dragActive}
          selectedFile={selectedFile}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          onDrag={handleDrag}
          onDrop={handleDrop}
          onFileChange={handleChange}
        />
      )}
    </div>
  );
};

export default AdminGallery;
import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { Plus, Trash2, Edit, AlertCircle, CheckCircle, X, Loader2, ImageOff } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  DESIGN TOKENS (local to this file — promote to a shared theme     */
/*  file once more admin screens exist, per the design system plan)   */
/* ------------------------------------------------------------------ */
const TOKENS = {
  brandRed: '#C1121F',
  brandRedDark: '#9B0F18',
  border: '#E5E5E5',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textMuted: '#888888',
  surfaceWarm: '#FAFAFA',
};

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
      className={`flex items-start gap-3 rounded-lg border p-4 mb-6 transition-colors ${isError
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
/*  Collection card image with graceful fallback (no silent onError   */
/*  swallow — shows an explicit "no image" state instead)             */
/* ------------------------------------------------------------------ */
const CollectionThumb = ({ src, alt }) => {
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
/*  Modal — focus trap + Escape-to-close, no logic change to submit   */
/* ------------------------------------------------------------------ */
const CollectionModal = ({ editingCol, categories, submitting, onClose, onSubmit }) => {
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
            {editingCol ? 'Edit Collection' : 'New Collection'}
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
            <label htmlFor="categoryId" className="block text-xs font-medium text-stone-500">
              Parent Category
            </label>
            <select
              ref={firstFieldRef}
              id="categoryId"
              name="categoryId"
              required
              defaultValue={editingCol ? editingCol.categoryId : ''}
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-medium text-stone-500">
              Collection Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              defaultValue={editingCol ? editingCol.name : ''}
              placeholder="e.g. Sliding Wardrobe Systems"
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="image" className="block text-xs font-medium text-stone-500">
              Cover Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              className="w-full text-xs text-stone-500 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-stone-700 hover:file:bg-stone-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-medium text-stone-500">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={editingCol ? editingCol.description : ''}
              placeholder="Describe the collection's finishes, engineering style..."
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
          </div>

          {editingCol && (
            <div className="space-y-1.5">
              <label htmlFor="status" className="block text-xs font-medium text-stone-500">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={editingCol.status}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
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
              {submitting ? 'Saving…' : 'Save Collection'}
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
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-300" aria-hidden="true" />
        <span className="sr-only">Loading collections…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Collections</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Manage sub-collections inside primary categories.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#C1121F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B0F18] focus:outline-none focus:ring-2 focus:ring-red-200 sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          Add Collection
        </button>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Empty state */}
      {collections.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <p className="text-sm font-medium text-stone-600">No collections yet</p>
          <p className="mt-1 text-sm text-stone-400">
            Click "Add Collection" to create the first one.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => {
          const imgSrc = getImageUrl(col.image);
          const isDeleting = deletingId === col.id;

          return (
            <div
              key={col.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden bg-stone-100">
                <CollectionThumb src={imgSrc} alt={col.name} />
                <span className="absolute right-3 top-3 rounded-full border border-stone-200 bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 shadow-sm">
                  {col.category?.name || 'Uncategorized'}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-stone-900">{col.name}</h3>
                  <p className="font-mono text-[11px] text-stone-400">/collections/{col.slug}</p>
                  {col.description && (
                    <p className="line-clamp-2 pt-1 text-sm leading-relaxed text-stone-500">
                      {col.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${col.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-stone-100 text-stone-500'
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${col.status === 'active' ? 'bg-emerald-500' : 'bg-stone-400'
                        }`}
                      aria-hidden="true"
                    />
                    {col.status}
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(col)}
                      aria-label={`Edit ${col.name}`}
                      className="rounded-md border border-stone-200 p-2 text-stone-500 transition-colors hover:border-[#C1121F] hover:text-[#C1121F] focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      <Edit size={14} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(col.id, col.name)}
                      disabled={isDeleting}
                      aria-label={`Delete ${col.name}`}
                      className="rounded-md border border-stone-200 p-2 text-stone-500 transition-colors hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      {isDeleting ? (
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 size={14} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <CollectionModal
          editingCol={editingCol}
          categories={categories}
          submitting={submitting}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AdminCollections;
import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Edit, Image as ImageIcon, AlertCircle, CheckCircle, X, Loader2, ImageOff, Upload } from 'lucide-react';
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
/*  Status pill — same visual language as Collections/Products       */
/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  completed: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-amber-50 text-amber-700',
  planning: 'bg-stone-100 text-stone-600',
};
const STATUS_DOT = {
  completed: 'bg-emerald-500',
  in_progress: 'bg-amber-500',
  planning: 'bg-stone-400',
};
const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
      STATUS_STYLES[status] || 'bg-stone-100 text-stone-500'
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || 'bg-stone-400'}`} aria-hidden="true" />
    {status?.replace('_', ' ')}
  </span>
);

/* ------------------------------------------------------------------ */
/*  Media thumb with graceful fallback + per-item delete state        */
/* ------------------------------------------------------------------ */
const MediaThumb = ({ media, onDelete, isDeleting }) => {
  const [failed, setFailed] = useState(false);
  const src = getImageUrl(media.filePath);

  return (
    <div className="group relative h-12 w-16 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
      {!src || failed ? (
        <div className="flex h-full w-full items-center justify-center text-stone-300">
          <ImageOff size={16} aria-hidden="true" />
        </div>
      ) : (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      )}
      <button
        onClick={() => onDelete(media.id)}
        disabled={isDeleting}
        aria-label="Remove this media file"
        className="absolute inset-0 flex items-center justify-center bg-red-900/75 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 disabled:cursor-not-allowed focus:opacity-100 focus:outline-none"
      >
        {isDeleting ? (
          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 size={12} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Project modal — focus trap + Escape-to-close                      */
/* ------------------------------------------------------------------ */
const ProjectModal = ({
  editingProj,
  submitting,
  dragActive,
  selectedFiles,
  onDrag,
  onDrop,
  onFileChange,
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
            {editingProj ? 'Edit Project' : 'New Project'}
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
              Project Title
            </label>
            <input
              ref={firstFieldRef}
              id="title"
              type="text"
              name="title"
              required
              defaultValue={editingProj ? editingProj.title : ''}
              placeholder="e.g. Munich Penthouse Kitchen"
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-xs font-medium text-stone-500">
                Location
              </label>
              <input
                id="location"
                type="text"
                name="location"
                defaultValue={editingProj ? editingProj.location : ''}
                placeholder="Bogenhausen, Munich"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="clientName" className="block text-xs font-medium text-stone-500">
                Client Name
              </label>
              <input
                id="clientName"
                type="text"
                name="clientName"
                defaultValue={editingProj ? editingProj.clientName : ''}
                placeholder="e.g. Dr. Andreas Fischer"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="projectType" className="block text-xs font-medium text-stone-500">
                Project Type
              </label>
              <input
                id="projectType"
                type="text"
                name="projectType"
                defaultValue={editingProj ? editingProj.projectType : ''}
                placeholder="Residential Villa"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="completionDate" className="block text-xs font-medium text-stone-500">
                Completion Date
              </label>
              <input
                id="completionDate"
                type="date"
                name="completionDate"
                defaultValue={editingProj ? editingProj.completionDate : ''}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="block text-xs font-medium text-stone-500">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={editingProj ? editingProj.status : 'completed'}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              >
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="planning">Planning</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-500">
              Upload Media Files (Images/Videos)
            </label>
            <div
              className={`relative flex min-h-[96px] flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors duration-200 ${
                dragActive ? 'border-[#C1121F] bg-red-50/50' : 'border-stone-200 bg-stone-50 hover:border-stone-300'
              }`}
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
            >
              <input
                type="file"
                name="media"
                multiple
                accept="image/*,video/*"
                onChange={onFileChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:ring-2 focus-visible:ring-[#C1121F]"
              />
              <Upload size={18} className="mb-2 text-stone-400" aria-hidden="true" />
              {selectedFiles.length > 0 ? (
                <p className="px-2 text-xs font-medium text-stone-700">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
              ) : (
                <>
                  <p className="text-xs font-medium text-stone-500">Drag &amp; drop files</p>
                  <p className="text-[11px] text-stone-400">or click to browse</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-medium text-stone-500">
              Description / Scope Details
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={editingProj ? editingProj.description : ''}
              placeholder="Logistics challenges, lighting systems, engineered materials..."
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
              {submitting ? 'Saving…' : 'Save Project'}
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
export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingMediaId, setDeletingMediaId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenEdit = (proj) => {
    setEditingProj(proj);
    setSelectedFiles([]);
    setDragActive(false);
    clearToast();
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProj(null);
    setSelectedFiles([]);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);

    // Append files from state if changed via drag & drop
    if (selectedFiles.length > 0) {
      formData.delete('media'); // Remove empty inputs
      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });
    }

    try {
      if (editingProj) {
        const res = await API.put(`/projects/${editingProj.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) setModalOpen(false);
      } else {
        const res = await API.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) setModalOpen(false);
      }
      fetchProjects();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Soft delete project "${title}"?`)) return;
    setDeletingId(id);
    clearToast();
    try {
      const res = await API.delete(`/projects/${id}`);
      if (res.data.success) {
        showToast('success', `Project "${title}" deleted successfully.`);
        fetchProjects();
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      if (status === 403) showToast('error', `Permission denied: ${msg}`);
      else if (!err.response) showToast('error', 'Cannot reach backend server on port 5000.');
      else showToast('error', `Error (${status}): ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Permanently remove this image file from the project?')) return;
    setDeletingMediaId(mediaId);
    try {
      const res = await API.delete(`/projects/media/${mediaId}`);
      if (res.data.success) fetchProjects();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete media file.');
    } finally {
      setDeletingMediaId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-300" aria-hidden="true" />
        <span className="sr-only">Loading projects…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Projects</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Curate finished interior projects and media assets.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#C1121F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B0F18] focus:outline-none focus:ring-2 focus:ring-red-200 sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          Add Project
        </button>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <p className="text-sm font-medium text-stone-600">No projects yet</p>
          <p className="mt-1 text-sm text-stone-400">Click "Add Project" to create the first one.</p>
        </div>
      )}

      {/* Project list */}
      <div className="space-y-4">
        {projects.map((proj) => {
          const isDeleting = deletingId === proj.id;

          return (
            <div
              key={proj.id}
              className="flex flex-col gap-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row md:justify-between"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                    {proj.projectType || 'Uncategorized'}
                  </span>
                  {proj.location && <span className="text-xs text-stone-400">{proj.location}</span>}
                </div>
                <h3 className="text-lg font-semibold text-stone-900">{proj.title}</h3>
                {proj.description && (
                  <p className="text-sm leading-relaxed text-stone-500">{proj.description}</p>
                )}

                {proj.media?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {proj.media.map((m) => (
                      <MediaThumb
                        key={m.id}
                        media={m}
                        onDelete={handleDeleteMedia}
                        isDeleting={deletingMediaId === m.id}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-start justify-between gap-4 border-t border-stone-100 pt-4 md:w-60 md:items-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <div className="space-y-1 text-xs text-stone-500 md:text-right">
                  <p><span className="font-medium text-stone-600">Client:</span> {proj.clientName || '—'}</p>
                  <p><span className="font-medium text-stone-600">Completion:</span> {proj.completionDate || 'N/A'}</p>
                  <div className="pt-0.5"><StatusPill status={proj.status} /></div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-[#C1121F] hover:text-[#C1121F] focus:outline-none focus:ring-2 focus:ring-red-100"
                  >
                    <Edit size={12} aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id, proj.title)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-100"
                  >
                    {isDeleting ? (
                      <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 size={12} aria-hidden="true" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <ProjectModal
          editingProj={editingProj}
          submitting={submitting}
          dragActive={dragActive}
          selectedFiles={selectedFiles}
          onDrag={handleDrag}
          onDrop={handleDrop}
          onFileChange={handleChange}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AdminProjects;
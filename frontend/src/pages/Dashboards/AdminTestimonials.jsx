import React, { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, CheckCircle, XCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import API from '../../services/api';

/* ------------------------------------------------------------------ */
/*  Toast — accessible, auto-roled by type. Replaces the two alert()  */
/*  calls from the original, matching the pattern used across every   */
/*  other admin screen.                                               */
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

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
};
const STATUS_DOT = {
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  pending: 'bg-amber-500',
};
const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
      STATUS_STYLES[status] || 'bg-stone-100 text-stone-500'
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || 'bg-stone-400'}`} aria-hidden="true" />
    {status}
  </span>
);

export const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', message: '' });
  // Tracks which row + action is currently in flight, e.g. "12-approve",
  // so buttons on that row disable and show a spinner while the
  // request is pending. Prevents duplicate requests from double-clicks.
  const [actingKey, setActingKey] = useState(null);

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/testimonials');
      if (res.data.success) {
        setTestimonials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials', err);
      showToast('error', err.response?.data?.message || 'Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setActingKey(`${id}-delete`);
    clearToast();
    try {
      const res = await API.delete(`/testimonials/${id}`);
      if (res.data.success) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete testimonial', err);
      showToast('error', 'Error deleting testimonial.');
    } finally {
      setActingKey(null);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setActingKey(`${id}-${status}`);
    clearToast();
    try {
      const res = await API.put(`/testimonials/${id}/status`, { status });
      if (res.data.success) {
        setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, status } : t)));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      showToast('error', 'Error updating status.');
    } finally {
      setActingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-300" aria-hidden="true" />
        <span className="sr-only">Loading testimonials…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-stone-900">Testimonials</h2>
        <p className="mt-0.5 text-sm text-stone-500">Review, approve, and delete client testimonials.</p>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Empty state */}
      {testimonials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <p className="text-sm font-medium text-stone-600">No testimonials yet</p>
          <p className="mt-1 text-sm text-stone-400">Submitted reviews will appear here for moderation.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                <th scope="col" className="p-4">Client</th>
                <th scope="col" className="p-4">Review</th>
                <th scope="col" className="p-4">Rating</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {testimonials.map((t) => {
                const isApproving = actingKey === `${t.id}-approved`;
                const isRejecting = actingKey === `${t.id}-rejected`;
                const isDeleting = actingKey === `${t.id}-delete`;
                const rowBusy = isApproving || isRejecting || isDeleting;

                return (
                  <tr key={t.id} className="align-top transition-colors hover:bg-stone-50/70">
                    <td className="p-4">
                      <p className="font-medium text-stone-800">{t.clientName}</p>
                      {t.clientTitle && <p className="text-xs text-stone-400">{t.clientTitle}</p>}
                    </td>
                    <td className="max-w-md p-4">
                      <p className="line-clamp-3 italic text-stone-600">&ldquo;{t.content}&rdquo;</p>
                    </td>
                    <td className="p-4">
                      <div className="flex text-[#C1121F]" aria-label={`${t.rating} out of 5 stars`}>
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" aria-hidden="true" />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {t.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'approved')}
                            disabled={rowBusy}
                            aria-label={`Approve testimonial from ${t.clientName}`}
                            className="rounded-md border border-stone-200 p-2 text-emerald-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          >
                            {isApproving ? (
                              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                            ) : (
                              <CheckCircle size={16} aria-hidden="true" />
                            )}
                          </button>
                        )}
                        {t.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'rejected')}
                            disabled={rowBusy}
                            aria-label={`Reject testimonial from ${t.clientName}`}
                            className="rounded-md border border-stone-200 p-2 text-amber-600 transition-colors hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-100"
                          >
                            {isRejecting ? (
                              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                            ) : (
                              <XCircle size={16} aria-hidden="true" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={rowBusy}
                          aria-label={`Delete testimonial from ${t.clientName}`}
                          className="rounded-md border border-stone-200 p-2 text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-100"
                        >
                          {isDeleting ? (
                            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 size={16} aria-hidden="true" />
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
    </div>
  );
};

export default AdminTestimonials;

import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { AlertCircle, CheckCircle, X, Loader2, ScrollText } from 'lucide-react';

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
/*  Action badge — neutral pill, same visual language as status pills */
/*  used elsewhere in the admin (Collections/Gallery)                 */
/* ------------------------------------------------------------------ */
const ActionBadge = ({ action }) => (
  <span className="inline-block rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-stone-600">
    {action}
  </span>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'Failed to load audit log. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-300" aria-hidden="true" />
        <span className="sr-only">Loading audit log…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-stone-900">Audit Log</h2>
        <p className="mt-0.5 text-sm text-stone-500">
          Immutable record of administrative and client transactions.
        </p>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Empty state */}
      {logs.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <ScrollText size={28} className="mx-auto mb-3 text-stone-300" aria-hidden="true" />
          <p className="text-sm font-medium text-stone-600">No log entries yet</p>
          <p className="mt-1 text-sm text-stone-400">
            Activity will appear here as it happens.
          </p>
        </div>
      )}

      {/* Table */}
      {logs.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                <th scope="col" className="p-4">ID</th>
                <th scope="col" className="p-4">Actor</th>
                <th scope="col" className="p-4">Event</th>
                <th scope="col" className="p-4">Details</th>
                <th scope="col" className="p-4">Origin IP</th>
                <th scope="col" className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-stone-50/70">
                  <td className="p-4 font-mono text-xs text-stone-400">#{log.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-stone-800">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'SYSTEM'}
                    </div>
                    {log.user && (
                      <div className="font-mono text-[11px] text-stone-400">{log.user.email}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="max-w-xs truncate p-4 text-stone-500" title={log.details}>
                    {log.details ? log.details.replace(/"/g, '') : '—'}
                  </td>
                  <td className="p-4 font-mono text-xs text-stone-400">{log.ipAddress}</td>
                  <td className="p-4 text-xs text-stone-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
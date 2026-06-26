import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import API from '../../services/api';
import { UserPlus, Trash2, AlertCircle, CheckCircle, X, Loader2, ShieldCheck } from 'lucide-react';
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
/*  Avatar — image with initials fallback                             */
/* ------------------------------------------------------------------ */
const Avatar = ({ src, firstName, lastName }) => {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 text-xs font-semibold text-[#C1121F]">
      {showImage ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{firstName[0]}{lastName[0]}</span>
      )}
    </div>
  );
};

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-stone-100 text-stone-500 border-stone-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
};

/* ------------------------------------------------------------------ */
/*  Create-user modal — focus trap + Escape-to-close                  */
/* ------------------------------------------------------------------ */
const CreateUserModal = ({ submitting, onClose, onSubmit }) => {
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
        className="relative z-10 w-full max-w-md rounded-xl border border-stone-200 bg-white p-7 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 id={titleId} className="text-base font-semibold text-stone-900">
            Create New User
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-xs font-medium text-stone-500">
                First Name
              </label>
              <input
                ref={firstFieldRef}
                id="firstName"
                type="text"
                name="firstName"
                required
                placeholder="e.g. Elizabeth"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-xs font-medium text-stone-500">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                required
                placeholder="e.g. Vance"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-stone-500">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="manager@klarehomes.com"
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-stone-500">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              placeholder="••••••••••••"
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-medium text-stone-500">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                placeholder="+49"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="roleName" className="block text-xs font-medium text-stone-500">
                Assigned Role
              </label>
              <select
                id="roleName"
                name="roleName"
                required
                defaultValue="manager"
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

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
              {submitting ? 'Creating…' : 'Create User'}
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
export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // Tracks which user row currently has a role/status PUT in flight,
  // so the dropdown disables and can't fire overlapping requests.
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        // Filter out client accounts
        const staffOnly = res.data.data.filter((u) => u.role !== 'client');
        setUsers(staffOnly);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    clearToast();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await API.post('/admin/users', data);
      if (res.data.success) {
        setModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (userId, roleName, status) => {
    setUpdatingId(userId);
    clearToast();
    try {
      const res = await API.put(`/admin/users/${userId}`, { roleName, status });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed. You cannot modify Admin accounts.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Soft delete user "${email}"? This action can be undone from the database.`)) return;
    setDeletingId(userId);
    clearToast();
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('success', res.data.message || 'User deleted successfully.');
        fetchUsers();
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
        <span className="sr-only">Loading users…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Users</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Manage staff roles, account status, and platform access.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#C1121F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B0F18] focus:outline-none focus:ring-2 focus:ring-red-200 sm:self-auto"
        >
          <UserPlus size={16} aria-hidden="true" />
          Create User
        </button>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Empty state */}
      {users.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <p className="text-sm font-medium text-stone-600">No staff users yet</p>
          <p className="mt-1 text-sm text-stone-400">Click "Create User" to add the first staff account.</p>
        </div>
      )}

      {/* Table */}
      {users.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                <th scope="col" className="p-4">Profile</th>
                <th scope="col" className="p-4">Email</th>
                <th scope="col" className="p-4">Role</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4">Created</th>
                <th scope="col" className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const isDeleting = deletingId === u.id;
                const isUpdating = updatingId === u.id;
                const avatarSrc = getImageUrl(u.avatar);

                return (
                  <tr key={u.id} className="transition-colors hover:bg-stone-50/70">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={avatarSrc} firstName={u.firstName} lastName={u.lastName} />
                        <div>
                          <span className="block font-medium text-stone-800">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="block text-xs text-stone-400">{u.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-stone-500">{u.email}</td>
                    <td className="p-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-[#C1121F]">
                          <ShieldCheck size={12} aria-hidden="true" />
                          Admin
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={isUpdating}
                          onChange={(e) => handleUpdateStatus(u.id, e.target.value, u.status)}
                          aria-label={`Role for ${u.firstName} ${u.lastName}`}
                          className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs font-medium text-stone-700 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          Active
                        </span>
                      ) : (
                        <select
                          value={u.status}
                          disabled={isUpdating}
                          onChange={(e) => handleUpdateStatus(u.id, u.role, e.target.value)}
                          aria-label={`Status for ${u.firstName} ${u.lastName}`}
                          className={`rounded-md border px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C1121F] disabled:cursor-not-allowed disabled:opacity-60 ${
                            STATUS_STYLES[u.status] || 'border-stone-200 bg-stone-50 text-stone-600'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4 text-xs text-stone-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {!isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={isDeleting}
                          aria-label={`Delete user ${u.firstName} ${u.lastName}`}
                          className="rounded-md border border-stone-200 p-2 text-stone-500 transition-colors hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-100"
                        >
                          {isDeleting ? (
                            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 size={16} aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <CreateUserModal
          submitting={submitting}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
};

export default AdminUsers;
import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { UserPlus, ShieldAlert, Trash2, Edit, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

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

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });
  
  // Edit state
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        // Filter out client accounts
        const staffOnly = res.data.data.filter(u => u.role !== 'client');
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
    try {
      const res = await API.put(`/admin/users/${userId}`, { roleName, status });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed. You cannot modify Admin accounts.');
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Soft delete user "${email}"? This action can be undone from the database.`)) return;
    setDeletingId(userId);
    clearToast();
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('success', res.data.message || `User deleted successfully.`);
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-display">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Users Console</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Manage staff roles, client states, and platform access</p>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setModalOpen(true); }}
          className="btn-gold !py-2 flex items-center gap-2"
        >
          <UserPlus size={14} />
          <span>Create User</span>
        </button>
      </div>

      {/* Persistent Toast */}
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Users table */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              <th className="p-4">Profile</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#C8A97E] border font-semibold">
                    {u.avatar ? (
                      <img src={`${import.meta.env.VITE_API_URL}${u.avatar}`} alt="Avatar" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : null}
                    {!u.avatar ? `${u.firstName[0]}${u.lastName[0]}` : ''}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{u.firstName} {u.lastName}</span>
                    <span className="block text-[9px] text-slate-400">{u.phone || 'No phone'}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-[10px] text-slate-500">{u.email}</td>
                <td className="p-4">
                  {u.role === 'admin' ? (
                    <span className="bg-[#C8A97E]/10 border border-[#C8A97E]/30 text-[#C8A97E] px-2 py-1 uppercase tracking-wider text-[9px] font-bold">Admin</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateStatus(u.id, e.target.value, u.status)}
                      className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 uppercase tracking-wider text-[9px] font-semibold focus:outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  )}
                </td>
                <td className="p-4">
                  {u.role === 'admin' ? (
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-1 uppercase tracking-wider text-[9px] font-bold">Active</span>
                  ) : (
                    <select
                      value={u.status}
                      onChange={(e) => handleUpdateStatus(u.id, u.role, e.target.value)}
                      className={`border px-2 py-1 uppercase tracking-wider text-[9px] font-semibold focus:outline-none ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  )}
                </td>
                <td className="p-4 text-slate-400 text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      disabled={deletingId === u.id}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Soft Delete User"
                    >
                      {deletingId === u.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white p-8 border border-slate-100 shadow-2xl z-10 rounded-none">
            <h3 className="text-lg font-light uppercase tracking-widest text-primary mb-6">Create New Profile</h3>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="E.g., Elizabeth"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="E.g., Vance"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="manager@signature.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+49"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Assigned Role</label>
                  <select
                    name="roleName"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                  >
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

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
                  className="px-6 py-2 bg-[#C8A97E] hover:bg-[#AA8753] text-white uppercase tracking-widest text-[9px] font-semibold"
                >
                  {submitting ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;

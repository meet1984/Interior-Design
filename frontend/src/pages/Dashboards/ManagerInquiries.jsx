import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { Mail, Phone, Calendar, ClipboardList } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

// Shared studio tokens — same set used in ManagerDashboard.
// (Worth promoting to a shared module once a third file needs them.)
const palette = {
  red: '#C1121F',
  deepRed: '#9B0F18',
  navy: '#34495E',
  sage: '#8D9A84',
  stone: '#F2EFEA',
  border: '#E5E5E5',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textMuted: '#888888',
  charcoal: '#1C1A17',
};

const STATUS_CONFIG = {
  pending: { color: palette.deepRed, bg: '#FBEAEA', label: 'Pending' },
  in_discussion: { color: palette.navy, bg: '#EAEEF1', label: 'In Discussion' },
  resolved: { color: palette.sage, bg: '#F1F4EF', label: 'Resolved' },
  closed: { color: palette.textMuted, bg: palette.stone, label: 'Closed' },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || { color: palette.textMuted, bg: palette.stone, label: status || 'Unknown' };

const FILTERS = [
  { key: 'all', label: 'Total Requests' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_discussion', label: 'In Discussion' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export const ManagerInquiries = () => {
  const { user } = useContext(AuthContext);
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchData = async () => {
    try {
      const inqRes = await API.get('/inquiries');
      if (inqRes.data.success) setInquiries(inqRes.data.data);
    } catch (err) {
      console.error('Fetch inquiries error:', err);
    }

    try {
      const usersRes = await API.get('/users/staff');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/inquiries/${id}`, { status });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleUpdateAssignee = async (id, assignedTo) => {
    try {
      const res = await API.put(`/inquiries/${id}`, { assignedTo });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center" role="status" aria-busy="true">
        <div
          className="w-9 h-9 border-2 border-t-transparent border-solid rounded-full animate-spin"
          style={{ borderColor: `${palette.red}26`, borderTopColor: palette.red }}
        />
        <span className="sr-only">Loading inquiries…</span>
      </div>
    );
  }

  // Analytics calculations
  const counts = {
    all: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'pending').length,
    in_discussion: inquiries.filter((i) => i.status === 'in_discussion').length,
    resolved: inquiries.filter((i) => i.status === 'resolved').length,
    closed: inquiries.filter((i) => i.status === 'closed').length,
  };

  const filteredInquiries =
    activeFilter === 'all' ? inquiries : inquiries.filter((i) => i.status === activeFilter);

  return (
    <div className="space-y-10 font-display">
      {/* Header */}
      <div className="space-y-2 pb-8" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <p
          className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold"
          style={{ color: palette.red }}
        >
          Showroom Inbox
        </p>
        <h2 className="text-3xl font-light tracking-tight" style={{ color: palette.textPrimary }}>
          Queue
        </h2>
        <p className="text-sm font-sans" style={{ color: palette.textSecondary }}>
          Review quotations and design request consultations.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {FILTERS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          const accent = key === 'all' ? palette.charcoal : getStatusConfig(key).color;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              aria-pressed={isActive}
              className="p-5 flex flex-col items-center justify-center transition-all duration-300 font-sans"
              style={{
                border: `1px solid ${isActive ? accent : palette.border}`,
                backgroundColor: isActive ? accent : '#FFFFFF',
                boxShadow: '0 1px 2px rgba(17,17,17,0.03)',
              }}
            >
              <span
                className="text-3xl font-light"
                style={{ color: isActive ? '#FFFFFF' : palette.textPrimary }}
              >
                {counts[key]}
              </span>
              <span
                className="text-[9px] uppercase tracking-widest font-semibold mt-1"
                style={{ color: isActive ? 'rgba(255,255,255,0.85)' : palette.textMuted }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inquiry list */}
      <div className="space-y-5">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-16" style={{ border: `1px solid ${palette.border}`, backgroundColor: '#FFFFFF' }}>
            <p className="text-xs uppercase tracking-widest font-sans" style={{ color: palette.textMuted }}>
              No inquiries found in this category.
            </p>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const statusConfig = getStatusConfig(inq.status);
            const statusSelectId = `status-${inq.id}`;
            const assigneeSelectId = `assignee-${inq.id}`;

            return (
              <div
                key={inq.id}
                className="relative bg-white p-6 flex flex-col md:flex-row justify-between gap-6"
                style={{ border: `1px solid ${palette.border}`, boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}
              >
                <div
                  className="absolute top-0 left-0 h-full w-[3px]"
                  style={{ backgroundColor: statusConfig.color }}
                  aria-hidden="true"
                />

                {/* Inquiry core content */}
                <div className="flex-1 space-y-4 pl-2">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span
                      className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold font-sans"
                      style={{
                        backgroundColor: `${palette.navy}14`,
                        color: palette.navy,
                        border: `1px solid ${palette.navy}33`,
                      }}
                    >
                      {inq.inquiryType}
                    </span>

                    {inq.product && (
                      <span className="text-[10px] font-sans uppercase" style={{ color: palette.textMuted }}>
                        Linked item: <strong style={{ color: palette.textSecondary }}>{inq.product.title}</strong>
                      </span>
                    )}

                    <span className="text-[10px] font-sans flex items-center gap-1.5" style={{ color: palette.textMuted }}>
                      <Calendar size={12} aria-hidden="true" />
                      {new Date(inq.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(inq.createdAt).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-semibold" style={{ color: palette.textPrimary }}>
                      {inq.subject}
                    </h3>
                    <p
                      className="text-xs font-sans whitespace-pre-wrap p-4"
                      style={{ color: palette.textSecondary, backgroundColor: palette.stone, border: `1px solid ${palette.border}` }}
                    >
                      {inq.message}
                    </p>
                  </div>

                  {/* Contact line */}
                  <div
                    className="flex flex-wrap gap-6 text-[11px] font-sans pt-4"
                    style={{ color: palette.textMuted, borderTop: `1px solid ${palette.border}` }}
                  >
                    <span className="flex items-center gap-1.5">
                      <ClipboardList size={13} style={{ color: palette.navy }} aria-hidden="true" />
                      <span className="font-semibold" style={{ color: palette.textSecondary }}>{inq.name}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} style={{ color: palette.navy }} aria-hidden="true" />
                      <a
                        href={`mailto:${inq.email}`}
                        className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ outlineColor: palette.red }}
                      >
                        {inq.email}
                      </a>
                    </span>
                    {inq.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} style={{ color: palette.navy }} aria-hidden="true" />
                        <span>{inq.phone}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status and assignment panel */}
                <div
                  className="md:w-64 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 flex flex-col justify-between gap-4 shrink-0"
                  style={{ borderColor: palette.border }}
                >
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={statusSelectId}
                        className="text-[10px] uppercase tracking-widest font-semibold block font-sans"
                        style={{ color: palette.textMuted }}
                      >
                        Inquiry status
                      </label>
                      <select
                        id={statusSelectId}
                        value={inq.status}
                        onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                        className="w-full px-3 py-2 uppercase tracking-wider text-[10px] font-semibold font-sans focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          color: statusConfig.color,
                          backgroundColor: statusConfig.bg,
                          border: `1px solid ${statusConfig.color}40`,
                          outlineColor: palette.red,
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_discussion">In Discussion</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {user?.role === 'admin' && users.length > 0 && (
                      <div className="space-y-1.5">
                        <label
                          htmlFor={assigneeSelectId}
                          className="text-[10px] uppercase tracking-widest font-semibold block font-sans"
                          style={{ color: palette.textMuted }}
                        >
                          Assigned curation agent
                        </label>
                        <select
                          id={assigneeSelectId}
                          value={inq.assignedTo || ''}
                          onChange={(e) => handleUpdateAssignee(inq.id, e.target.value || null)}
                          className="w-full px-3 py-2 text-[11px] font-sans focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{ color: palette.textSecondary, border: `1px solid ${palette.border}`, outlineColor: palette.red }}
                        >
                          <option value="">Unassigned</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.firstName} {u.lastName} ({u.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[10px] font-sans" style={{ color: palette.textMuted }}>
                    {inq.assignee ? `Assigned to: ${inq.assignee.firstName} ${inq.assignee.lastName}` : 'Unassigned'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManagerInquiries;
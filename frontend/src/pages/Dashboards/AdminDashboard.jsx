import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, ShoppingBag, Briefcase, MessageSquare, TrendingUp,
} from 'lucide-react';

/* ─────────────────────────────────────────
   CUSTOM CHART TOOLTIP  — logic identical
───────────────────────────────────────────*/
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white border border-slate-200 text-xs font-sans"
        style={{ padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      >
        <p className="text-slate-400 mb-1.5 tracking-wide">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─────────────────────────────────────────
   KPI CARD  — small sub-component for clarity
───────────────────────────────────────────*/
const KpiCard = ({ name, value, Icon, accent }) => (
  <div
    className="card-elevated p-6 flex items-center justify-between group"
    style={{ transition: 'box-shadow 0.25s ease, transform 0.25s ease' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div className="flex-1 min-w-0">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {name}
      </p>
      <p
        className="text-[32px] font-light text-slate-900 leading-none"
        style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5 mt-2.5">
        <TrendingUp size={11} className="text-emerald-500" />
        <span className="text-[11px] text-emerald-600 font-sans font-medium">Active</span>
      </div>
    </div>

    {/* Icon box — brand-aligned, no random gradients */}
    <div
      className="w-12 h-12 flex items-center justify-center shrink-0 ml-4"
      style={{
        background: accent === 'red'
          ? 'rgba(193,18,31,0.08)'
          : accent === 'slate'
          ? 'rgba(100,116,139,0.08)'
          : 'rgba(16,185,129,0.08)',
        border: `1px solid ${
          accent === 'red'
            ? 'rgba(193,18,31,0.15)'
            : accent === 'slate'
            ? 'rgba(100,116,139,0.15)'
            : 'rgba(16,185,129,0.15)'
        }`,
      }}
    >
      <Icon
        size={20}
        style={{
          color: accent === 'red'
            ? '#C1121F'
            : accent === 'slate'
            ? '#64748b'
            : '#10b981',
        }}
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   SECTION HEADER  — reusable label pattern
───────────────────────────────────────────*/
const SectionLabel = ({ eyebrow, title, right }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      {eyebrow && (
        <p
          className="text-[9px] tracking-[0.24em] uppercase text-[#C1121F] font-semibold mb-1"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {eyebrow}
        </p>
      )}
      <h3
        className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-700"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {title}
      </h3>
    </div>
    {right && <div>{right}</div>}
  </div>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT  — all logic identical
───────────────────────────────────────────*/
export const AdminDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(res => { if (res.data.success) setStats(res.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div
            className="w-8 h-8 border-2 border-[#C1121F]/20 border-t-[#C1121F] rounded-full animate-spin mx-auto"
          />
          <p
            className="text-[10px] text-slate-400 uppercase tracking-[0.22em]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Loading Dashboard
          </p>
        </div>
      </div>
    );
  }

  /* ── KPI definitions — same data, redesigned accent system ── */
  const kpiList = [
    { name: 'Total Users',       value: stats?.kpis?.totalUsers     || 0, Icon: Users,        accent: 'red'   },
    { name: 'Luxury Products',   value: stats?.kpis?.totalProducts  || 0, Icon: ShoppingBag,  accent: 'slate' },
    { name: 'Studio Projects',   value: stats?.kpis?.totalProjects  || 0, Icon: Briefcase,    accent: 'green' },
    { name: 'Active Inquiries',  value: stats?.kpis?.totalInquiries || 0, Icon: MessageSquare, accent: 'red'  },
  ];

  return (
    <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Page header ── */}
      <div className="flex items-end justify-between gap-4 pb-1">
        <div>
          <p
            className="text-[10px] tracking-[0.26em] uppercase text-[#C1121F] font-semibold mb-1.5"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Studio Intelligence
          </p>
          <h2
            className="text-2xl font-light tracking-[0.06em] uppercase text-slate-900"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Operational Dashboard
          </h2>
          <p className="text-[12px] text-slate-400 mt-1 font-sans">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        {/* Live badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0"
          style={{
            background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Live Data
          </span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiList.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} />
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Area chart */}
        <div className="lg:col-span-3 card-base p-6">
          <SectionLabel
            eyebrow="Analytics"
            title="User Acquisition"
            right={
              <span
                className="text-[11px] text-slate-400 font-sans"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Last 12 months
              </span>
            }
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.userGrowthData || []}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C1121F" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#C1121F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="clients"
                  stroke="#C1121F"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorRed)"
                  name="New Clients"
                  dot={{ fill: '#C1121F', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#C1121F' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart */}
        <div className="lg:col-span-2 card-base p-6">
          <SectionLabel eyebrow="Inventory" title="Products by Category" />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.categoryDistribution || []}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#9CA3AF', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill="#C1121F"
                  name="Products"
                  radius={[2, 2, 0, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Activity Feed ── */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between pb-5 mb-1 border-b border-slate-100">
          <div>
            <p
              className="text-[9px] tracking-[0.24em] uppercase text-[#C1121F] font-semibold mb-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Real-time
            </p>
            <h3
              className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-700"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Activity Feed
            </h3>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: 'rgba(16,185,129,0.07)',
              border: '1px solid rgba(16,185,129,0.18)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Live
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-50 overflow-y-auto max-h-72">
          {(stats?.recentActivity || []).length === 0 ? (
            <div className="py-10 text-center">
              <p
                className="text-[12px] text-slate-400 font-sans"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                No recent activity to display.
              </p>
            </div>
          ) : (
            (stats?.recentActivity || []).map((log) => (
              <div key={log.id} className="py-4 flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-8 h-8 flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #C1121F 0%, #9B0F18 100%)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {log.user
                    ? `${log.user.firstName[0]}${log.user.lastName[0]}`
                    : '•'
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-700 font-sans leading-snug">
                    <strong className="text-slate-900 font-semibold">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </strong>
                    {' '}{log.action}
                  </p>
                  {log.details && (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans truncate">
                      {log.details.replace(/"/g, '')}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <span
                  className="text-[11px] text-slate-400 font-sans shrink-0 mt-0.5"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {new Date(log.created_at || log.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
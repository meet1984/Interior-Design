import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, Briefcase, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stone-200 shadow-lg px-4 py-2.5 text-xs font-sans">
        <p className="text-stone-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats').then(res => {
      if (res.data.success) setStats(res.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-2 border-[#C8A97E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontFamily: 'Outfit, sans-serif' }}>Loading dashboard</p>
        </div>
      </div>
    );
  }

  const kpiList = [
    {
      name: 'Total Users',
      value: stats?.kpis?.totalUsers || 0,
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
    },
    {
      name: 'Luxury Products',
      value: stats?.kpis?.totalProducts || 0,
      icon: ShoppingBag,
      gradient: 'from-amber-400 to-[#C8A97E]',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      name: 'Studio Projects',
      value: stats?.kpis?.totalProjects || 0,
      icon: Briefcase,
      gradient: 'from-emerald-400 to-teal-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      name: 'Active Inquiries',
      value: stats?.kpis?.totalInquiries || 0,
      icon: MessageSquare,
      gradient: 'from-sky-400 to-blue-500',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-light text-stone-900 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Operational Dashboard</h2>
          <p className="text-sm text-stone-400 mt-1 font-sans">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className="badge-gold">Live Data</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="card-elevated p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{kpi.name}</p>
                <p className="text-3xl font-light text-stone-900 font-nums" style={{ fontFamily: 'Outfit, sans-serif' }}>{kpi.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={11} className="text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-sans">Active</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Area Chart - wider */}
        <div className="lg:col-span-3 card-base p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>User Acquisition</h3>
            <span className="text-xs text-stone-400 font-sans">Last 12 months</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.userGrowthData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A97E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C8A97E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="clients" stroke="#C8A97E" strokeWidth={2} fillOpacity={1} fill="url(#colorGold)" name="New Clients" dot={{ fill: '#C8A97E', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - narrower */}
        <div className="lg:col-span-2 card-base p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Products by Category</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryDistribution || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9CA3AF', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#111827" name="Products" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
          <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Activity Feed</h3>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="divide-y divide-stone-50 overflow-y-auto max-h-72">
          {(stats?.recentActivity || []).length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center font-sans">No recent activity</p>
          ) : (
            (stats?.recentActivity || []).map((log) => (
              <div key={log.id} className="py-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A97E] to-[#A8834A] flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {log.user ? `${log.user.firstName[0]}${log.user.lastName[0]}` : '•'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 font-sans">
                    <strong className="text-stone-900 font-semibold">{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}</strong>
                    {' '}{log.action}
                  </p>
                  {log.details && (
                    <p className="text-xs text-stone-400 mt-0.5 font-sans truncate">{log.details.replace(/"/g, '')}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-stone-400 font-sans">{new Date(log.created_at || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;

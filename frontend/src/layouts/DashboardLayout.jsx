import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';
import {
  LayoutDashboard, Users, FolderTree, Layers, ShoppingBag,
  Briefcase, Image, BarChart3, ScrollText, Settings, User, LogOut,
  Menu, X, MessageSquare, Heart, Bookmark, Star, ExternalLink, ChevronRight
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get('/settings').then(res => {
      if (res.data.success) {
        const dict = {};
        res.data.data.forEach(s => { dict[s.key] = s.value; });
        setSettings(dict);
      }
    }).catch(() => {});
  }, []);

  if (!user) return null;
  const role = user.role;

  const adminLinks = [
    { group: 'Overview', items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ]},
    { group: 'Management', items: [
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Categories', path: '/admin/categories', icon: FolderTree },
      { name: 'Collections', path: '/admin/collections', icon: Layers },
      { name: 'Products', path: '/admin/products', icon: ShoppingBag },
      { name: 'Projects', path: '/admin/projects', icon: Briefcase },
      { name: 'Gallery', path: '/admin/gallery', icon: Image },
    ]},
    { group: 'Client Relations', items: [
      { name: 'Testimonials', path: '/admin/testimonials', icon: Star },
      { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    ]},
    { group: 'System', items: [
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { name: 'Activity Logs', path: '/admin/logs', icon: ScrollText },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
      { name: 'My Profile', path: '/admin/profile', icon: User },
    ]},
  ];

  const managerLinks = [
    { group: 'Overview', items: [
      { name: 'Dashboard', path: '/manager', icon: LayoutDashboard },
    ]},
    { group: 'Catalogue', items: [
      { name: 'Categories', path: '/manager/categories', icon: FolderTree },
      { name: 'Collections', path: '/manager/collections', icon: Layers },
      { name: 'Products', path: '/manager/products', icon: ShoppingBag },
      { name: 'Projects', path: '/manager/projects', icon: Briefcase },
      { name: 'Gallery', path: '/manager/gallery', icon: Image },
    ]},
    { group: 'Client', items: [
      { name: 'Inquiries', path: '/manager/inquiries', icon: MessageSquare },
      { name: 'My Profile', path: '/manager/profile', icon: User },
    ]},
  ];

  const clientLinks = [
    { group: 'My Space', items: [
      { name: 'Overview', path: '/client', icon: LayoutDashboard },
      { name: 'Saved Designs', path: '/client/saved-designs', icon: Bookmark },
      { name: 'My Favorites', path: '/client/favorites', icon: Heart },
      { name: 'My Inquiries', path: '/client/inquiries', icon: MessageSquare },
      { name: 'My Profile', path: '/client/profile', icon: User },
    ]},
  ];

  let sidebarGroups = [];
  let dashboardTitle = 'Client Portal';
  let roleColor = 'text-sky-400 bg-sky-900/40 border-sky-700/50';

  if (role === 'admin') {
    sidebarGroups = adminLinks;
    dashboardTitle = 'Admin Console';
    roleColor = 'text-[#C8A97E] bg-[#C8A97E]/10 border-[#C8A97E]/30';
  } else if (role === 'manager') {
    sidebarGroups = managerLinks;
    dashboardTitle = 'Manager Desk';
    roleColor = 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40';
  } else {
    sidebarGroups = clientLinks;
    roleColor = 'text-sky-400 bg-sky-900/40 border-sky-700/50';
  }

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0B1120 0%, #0F172A 100%)' }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex flex-col">
            <span className="text-lg font-light tracking-[0.22em] text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {settings?.site_name?.toUpperCase() || 'SIGNATURE'}
            </span>
            <span className="text-[8px] tracking-widest text-[#C8A97E] uppercase mt-0.5">Design Studio</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-500 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Role badge */}
        <span className={`inline-flex items-center mt-3 px-2 py-0.5 text-[9px] tracking-widest uppercase font-bold border ${roleColor}`}>
          {role}
        </span>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C8A97E] to-[#A8834A] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
          {user.avatar ? (
            <img src={`${import.meta.env.VITE_API_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
          ) : null}
          {!user.avatar || user.avatar.includes('placeholder') ? `${user.firstName[0]}${user.lastName[0]}` : ''}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>{user.firstName} {user.lastName}</p>
          <p className="text-[10px] text-slate-500 truncate font-sans">{user.email}</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-5">
        {sidebarGroups.map((group) => (
          <div key={group.group}>
            <p className="px-5 mb-1.5 text-[9px] tracking-[0.2em] text-slate-600 uppercase font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((link) => {
                const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                const LinkIcon = link.icon;
                return (
                  <Link key={link.name} to={link.path} onClick={() => setMobileOpen(false)}
                    className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                  >
                    <LinkIcon size={15} className={isActive ? 'text-[#C8A97E]' : 'text-slate-500'} />
                    <span>{link.name}</span>
                    {isActive && <ChevronRight size={12} className="ml-auto text-[#C8A97E]/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <Link to="/" className="flex items-center gap-2.5 px-4 py-2.5 text-slate-500 hover:text-slate-300 transition-colors text-[11px] tracking-wider uppercase font-medium mx-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <ExternalLink size={13} />
          View Website
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-slate-500 hover:text-red-400 transition-colors text-[11px] tracking-wider uppercase font-medium mx-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F5F4F0]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="h-full fixed w-60 shadow-xl">
          <SidebarContent />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-stone-200/80 flex items-center justify-between px-6 sticky top-0 z-20 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-stone-500 hover:text-stone-800 focus:outline-none">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="text-stone-300">/</span>
              <span className="uppercase tracking-widest font-medium text-stone-500">{dashboardTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-medium border border-stone-200 px-3 py-1.5 text-stone-500 hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <ExternalLink size={11} />
              Studio
            </Link>
            <div className="h-4 w-px bg-stone-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C8A97E] to-[#A8834A] flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                {user.avatar ? (
                  <img src={`${import.meta.env.VITE_API_URL}${user.avatar}`} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                ) : null}
                {!user.avatar || user.avatar.includes('placeholder') ? `${user.firstName[0]}` : ''}
              </div>
              <span className="text-xs text-stone-600 font-medium hidden sm:block" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {user.firstName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1400px] w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-full max-w-[260px]">
            <SidebarContent />
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardLayout;

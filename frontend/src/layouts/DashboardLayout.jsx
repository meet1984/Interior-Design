/**
 * DashboardLayout.jsx — Klare Homes Premium Admin / Manager / Client Shell
 * Design System: Playfair Display + Inter | Red #C1121F | Neutral-first
 * Fixes: inner-component extracted, token system, avatar logic, animation, active links
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';
import logoImg from '../assets/logo.png';
import {
  LayoutDashboard, Users, FolderTree, Layers, ShoppingBag,
  Briefcase, Image, BarChart3, ScrollText, Settings, User, LogOut,
  Menu, X, MessageSquare, Heart, Bookmark, Star, ExternalLink,
  ChevronRight, Home
} from 'lucide-react';
import { getImageUrl } from '../services/imageUrl';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const t = {
  red:      '#C1121F',
  redDeep:  '#9B0F18',
  bg:       '#F7F6F4',       // warm off-white — not sterile grey
  surface:  '#FFFFFF',
  border:   '#EBEBEB',
  borderAlt:'#F0EFED',
  text:     '#111111',
  sub:      '#555555',
  muted:    '#999999',
  sidebarW: 264,
};

/* ─────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────── */
const NAV = {
  admin: {
    title: 'Admin Console',
    badge: { bg: 'rgba(193,18,31,0.07)', border: 'rgba(193,18,31,0.2)', text: '#C1121F' },
    groups: [
      { group: 'Overview', items: [
        { name: 'Dashboard',     path: '/admin',                icon: LayoutDashboard },
      ]},
      { group: 'Management', items: [
        { name: 'Users',         path: '/admin/users',          icon: Users       },
        { name: 'Categories',    path: '/admin/categories',     icon: FolderTree  },
        { name: 'Collections',   path: '/admin/collections',    icon: Layers      },
        { name: 'Products',      path: '/admin/products',       icon: ShoppingBag },
        { name: 'Projects',      path: '/admin/projects',       icon: Briefcase   },
        { name: 'Gallery',       path: '/admin/gallery',        icon: Image       },
      ]},
      { group: 'Client Relations', items: [
        { name: 'Testimonials',  path: '/admin/testimonials',   icon: Star        },
        { name: 'Inquiries',     path: '/admin/inquiries',      icon: MessageSquare },
      ]},
      { group: 'System', items: [
        { name: 'Analytics',     path: '/admin/analytics',      icon: BarChart3   },
        { name: 'Activity Logs', path: '/admin/logs',           icon: ScrollText  },
        { name: 'Settings',      path: '/admin/settings',       icon: Settings    },
        { name: 'My Profile',    path: '/admin/profile',        icon: User        },
      ]},
    ],
  },
  manager: {
    title: 'Manager Desk',
    badge: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    groups: [
      { group: 'Overview', items: [
        { name: 'Dashboard',  path: '/manager',              icon: LayoutDashboard },
      ]},
      { group: 'Catalogue', items: [
        { name: 'Categories', path: '/manager/categories',   icon: FolderTree  },
        { name: 'Collections',path: '/manager/collections',  icon: Layers      },
        { name: 'Products',   path: '/manager/products',     icon: ShoppingBag },
        { name: 'Projects',   path: '/manager/projects',     icon: Briefcase   },
        { name: 'Gallery',    path: '/manager/gallery',      icon: Image       },
      ]},
      { group: 'Client', items: [
        { name: 'Inquiries',  path: '/manager/inquiries',    icon: MessageSquare },
        { name: 'My Profile', path: '/manager/profile',      icon: User        },
      ]},
    ],
  },
  client: {
    title: 'Client Portal',
    badge: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    groups: [
      { group: 'My Space', items: [
        { name: 'My Favorites',  path: '/client/favorites',       icon: Heart       },
        { name: 'My Inquiries',  path: '/client/inquiries',       icon: MessageSquare },
        { name: 'My Profile',    path: '/client/profile',         icon: User        },
      ]},
    ],
  },
};

/* ─────────────────────────────────────────────
   USER AVATAR — fixed double-render bug
───────────────────────────────────────────── */
const UserAvatar = memo(({ user, size = 36, fontSize = 12 }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const src = user.avatar && !user.avatar.includes('placeholder')
    ? getImageUrl(user.avatar)
    : null;
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${t.red}, ${t.redDeep})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(193,18,31,0.25)',
      fontFamily: 'Inter, sans-serif',
      fontSize, fontWeight: 700, color: '#fff',
      userSelect: 'none',
    }}>
      {src && !imgFailed
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgFailed(true)} />
        : initials
      }
    </div>
  );
});
UserAvatar.displayName = 'UserAvatar';

/* ─────────────────────────────────────────────
   ROLE BADGE
───────────────────────────────────────────── */
const RoleBadge = ({ role, badge }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 999,
    border: `1px solid ${badge.border}`,
    background: badge.bg, color: badge.text,
    fontSize: 9, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.25em',
    fontFamily: 'Inter, sans-serif',
  }}>
    {role}
  </span>
);

/* ─────────────────────────────────────────────
   NAV LINK
───────────────────────────────────────────── */
const NavLink = memo(({ link, isActive, onNavigate }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = link.icon;
  const active = isActive(link.path);

  return (
    <Link
      to={link.path}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px', borderRadius: 10, margin: '0 8px',
        textDecoration: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: active ? 600 : 450,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.01em',
        color: active ? t.red : hovered ? t.text : t.sub,
        background: active
          ? 'rgba(193,18,31,0.07)'
          : hovered ? t.bg : 'transparent',
        borderLeft: active ? `2px solid ${t.red}` : '2px solid transparent',
        transition: 'all 0.18s ease',
        position: 'relative',
      }}
    >
      <Icon
        size={15}
        style={{
          color: active ? t.red : hovered ? t.sub : t.muted,
          flexShrink: 0,
          transition: 'color 0.18s ease',
        }}
      />
      <span style={{ flex: 1, lineHeight: 1 }}>{link.name}</span>
      {active && (
        <ChevronRight size={11} style={{ color: `${t.red}80`, flexShrink: 0 }} />
      )}
    </Link>
  );
});
NavLink.displayName = 'NavLink';

/* ─────────────────────────────────────────────
   SIDEBAR CONTENT — extracted from render tree
   (prevents remount on every parent re-render)
───────────────────────────────────────────── */
const SidebarContent = memo(({ user, role, config, location, onClose, onNavigateLink, onLogout }) => {
  const isActive = useCallback(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/'),
    [location.pathname]
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: t.surface,
      borderRight: `1px solid ${t.border}`,
      position: 'relative',
    }}>
      {/* Red top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 2, background: t.red, zIndex: 1,
      }} />

      {/* Brand header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: `1px solid ${t.borderAlt}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 2,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={logoImg} alt="Logo" style={{ height: 36, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </Link>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: t.muted, padding: 6, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = t.text}
          onMouseLeave={e => e.currentTarget.style.color = t.muted}
        >
          <X size={17} />
        </button>
      </div>

      {/* User info row */}
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${t.borderAlt}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <UserAvatar user={user} size={38} fontSize={13} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: t.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            marginBottom: 4, fontFamily: 'Inter, sans-serif',
          }}>
            {user.firstName} {user.lastName}
          </p>
          <RoleBadge role={role} badge={config.badge} />
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        {config.groups.map((group) => (
          <div key={group.group} style={{ marginBottom: 20 }}>
            <p style={{
              padding: '0 24px', marginBottom: 4,
              fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.25em',
              color: '#CCCCCC', fontFamily: 'Inter, sans-serif',
            }}>
              {group.group}
            </p>
            <div>
              {group.items.map(link => (
                <NavLink
                  key={link.name}
                  link={link}
                  isActive={isActive}
                  onNavigate={onNavigateLink || onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 8px',
        borderTop: `1px solid ${t.borderAlt}`,
        background: t.bg,
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <FooterAction to="/" icon={<ExternalLink size={13} />} label="View Website" />
        <FooterAction onClick={onLogout} icon={<LogOut size={13} />} label="Sign Out" danger />
      </div>
    </div>
  );
});
SidebarContent.displayName = 'SidebarContent';

/* ─────────────────────────────────────────────
   FOOTER ACTION BUTTON
───────────────────────────────────────────── */
const FooterAction = ({ to, onClick, icon, label, danger }) => {
  const [hovered, setHovered] = useState(false);
  const baseStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 10,
    fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.15em',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer', textDecoration: 'none', border: 'none',
    width: '100%', background: 'none',
    color: hovered ? (danger ? t.red : t.text) : t.muted,
    background: hovered ? t.surface : 'transparent',
    transition: 'all 0.15s ease',
  };

  if (to) {
    return (
      <Link to={to} style={baseStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {icon} {label}
      </Link>
    );
  }
  return (
    <button style={baseStyle} onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon} {label}
    </button>
  );
};

/* ─────────────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────────────── */
export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  // Settings fetch kept (backend untouched) — available for child pages via context if needed
  useEffect(() => {
    API.get('/settings')
      .then(res => {
        if (res.data.success) {
          // reserved for downstream usage
        }
      })
      .catch(() => {});
  }, []);



  const handleLogout  = useCallback(async () => { await logout(); navigate('/login'); }, [logout, navigate]);
  const closeMobile   = useCallback(() => setMobileOpen(false), []);
  const closeMenu     = useCallback(() => { setMobileOpen(false); setDesktopOpen(false); }, []);
  const toggleMenu    = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setDesktopOpen(prev => !prev);
    } else {
      setMobileOpen(true);
    }
  }, []);

  if (!user) return null;
  
  const role   = user.role;
  const config = NAV[role] ?? NAV.client;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @media (min-width: 1024px) {
          .topbar-desktop-hidden { display: none !important; }
        }
      `}</style>

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: desktopOpen ? t.sidebarW : 0, flexShrink: 0,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
        className="hidden lg:block"
      >
        <div style={{
          position: 'fixed', width: t.sidebarW,
          top: 0, bottom: 0, zIndex: 30,
          left: 0,
          transform: desktopOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}>
          <SidebarContent
            user={user}
            role={role}
            config={config}
            location={location}
            onClose={closeMenu}
            onNavigateLink={closeMobile}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* ── Main column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Bar */}
        <TopBar
          user={user}
          title={config.title}
          onMenuOpen={toggleMenu}
          desktopOpen={desktopOpen}
        />

        {/* Page content */}
        <main style={{ flex: 1, padding: 'clamp(20px, 3vw, 32px)', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(17,17,17,0.45)',
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Slide-in panel */}
            <motion.div
              key="sidebar"
              initial={{ x: -t.sidebarW }}
              animate={{ x: 0 }}
              exit={{ x: -t.sidebarW }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: t.sidebarW, zIndex: 50,
              }}
              className="lg:hidden"
            >
              <SidebarContent
                user={user}
                role={role}
                config={config}
                location={location}
                onClose={closeMobile}
                onNavigateLink={closeMobile}
                onLogout={handleLogout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
const TopBar = memo(({ user, title, onMenuOpen, desktopOpen }) => (
  <header className={desktopOpen ? "topbar-desktop-hidden" : ""} style={{
    height: 60, background: t.surface,
    borderBottom: `1px solid ${t.border}`,
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 clamp(16px, 3vw, 28px)',
    position: 'sticky', top: 0, zIndex: 20,
    boxShadow: '0 1px 0 #EBEBEB, 0 4px 16px rgba(0,0,0,0.03)',
  }}>
    {/* Left: hamburger + breadcrumb */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <HamburgerButton onClick={onMenuOpen} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.red, flexShrink: 0 }} />
        <span style={{
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.2em',
          color: t.sub,
        }}>
          {title}
        </span>
      </div>
    </div>

    {/* Right: actions */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <TopBarAction to="/" icon={<Home size={11} />} label="Home" />
      <div style={{ width: 1, height: 20, background: t.border }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <UserAvatar user={user} size={30} fontSize={10} />
        <span style={{ fontSize: 13, color: t.sub, fontWeight: 500 }}
          className="hidden sm:block"
        >
          {user.firstName}
        </span>
      </div>
    </div>
  </header>
));
TopBar.displayName = 'TopBar';

const HamburgerButton = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      className="block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? t.bg : 'none',
        border: 'none', cursor: 'pointer',
        color: hovered ? t.text : t.muted,
        padding: 6, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      <Menu size={20} />
    </button>
  );
};

const TopBarAction = ({ to, icon, label }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      className="hidden sm:flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.15em',
        padding: '6px 14px', borderRadius: 8,
        border: `1px solid ${hovered ? t.red : t.border}`,
        color: hovered ? t.red : t.sub,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {icon} {label}
    </Link>
  );
};

export default DashboardLayout;
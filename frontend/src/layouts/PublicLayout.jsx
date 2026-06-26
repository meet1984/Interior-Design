import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Menu, X, Phone, Mail, MapPin, LogOut, ChevronDown,
  ArrowUpRight, Globe, Share2, Users2, LayoutGrid, User, Heart, MessageSquare
} from 'lucide-react';
import API from '../services/api';
import logoImg from '../assets/logo.png';
 
export const PublicLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const dropdownRef = useRef(null);
 
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
 
  useEffect(() => {
    API.get('/categories').then(res => { if (res.data.success) setCategories(res.data.data.slice(0, 6)); }).catch(() => {});
    API.get('/collections').then(res => { if (res.data.success) setCollections(res.data.data.slice(0, 5)); }).catch(() => {});
    API.get('/settings').then(res => {
      if (res.data.success) {
        const dict = {};
        res.data.data.forEach(s => { dict[s.key] = s.value; });
        setSettings(dict);
      }
    }).catch(() => {});
  }, []);
 
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);
 
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
 
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);
 
  const handleLogout = async () => { await logout(); navigate('/'); };
 
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
  ];
 
  return (
    <div className="min-h-screen flex flex-col bg-white">
 
      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 w-full z-40 transition-all duration-300 border-t-[2px] border-[#C1121F]"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid #E5E5E5' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 32px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="w-full px-4 lg:px-12 xl:px-16 flex items-center h-[56px] lg:h-[72px]">
 
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center shrink-0 group -ml-6 lg:-ml-2">
            <img
              src={logoImg}
              alt="Klare Homes"
             className="h-[90px] md:h-[110px] lg:h-[110px] xl:h-[150px] w-auto object-contain object-left transition-opacity duration-200 group-hover:opacity-70"
            />
          </Link>
 
          {/* ── Center Nav ── */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 mx-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative group py-1.5"
                >
                  <span
                    className={`text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 ${
                      isActive ? 'text-[#C1121F]' : 'text-[#555555] group-hover:text-[#111111]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.15em' }}
                  >
                    {link.name}
                  </span>
                  {/* Underline */}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-[#C1121F] transition-all duration-300 ease-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
 
            {/* Collections dropdown */}
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.15em] uppercase transition-colors duration-200 py-1.5 ${
                  dropdownOpen ? 'text-[#C1121F]' : 'text-[#555555] hover:text-[#111111]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Collections
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
 
              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-[20px] z-50">
                  <div
                    className="w-[580px] bg-white shadow-2xl overflow-hidden rounded-2xl border border-[#E5E5E5]"
                    style={{ animation: 'dropdownFadeIn 0.2s ease forwards' }}
                  >
                  <style>{`
                    @keyframes dropdownFadeIn {
                      from { opacity: 0; transform: translateY(-8px) translateX(-50%); }
                      to   { opacity: 1; transform: translateY(0)   translateX(-50%); }
                    }
                  `}</style>
                  
                  <div className="grid grid-cols-3 gap-2 p-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/categories/${cat.slug}`}
                        className="flex items-center justify-center text-center group/item hover:bg-[#FAFAFA] p-3 rounded-xl transition-colors"
                      >
                        <span className="text-[13px] text-[#111111] group-hover/item:text-[#C1121F] font-semibold transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors">
                    <Link
                      to="/categories"
                      className="flex items-center justify-between px-6 py-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#111111] hover:text-[#C1121F] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <span>Explore All Collections</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
                </div>
              )}
            </div>
          </nav>
 
          {/* ── Right Actions ── */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center justify-center w-[38px] h-[38px] rounded-full border border-[#E0E0E0] text-[#666666] hover:border-[#C1121F] hover:text-[#C1121F] transition-colors"
                  aria-label="User menu"
                >
                  <User size={16} />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-[200px] bg-white border border-[#E5E5E5] rounded-xl shadow-2xl overflow-hidden flex flex-col p-1.5" style={{ transform: 'translateY(4px)', transition: 'transform 0.2s' }}>
                    <div className="px-3 py-2.5 border-b border-[#F0F0F0] mb-1.5">
                      <p className="text-xs font-semibold text-[#111111] truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-[#888888] truncate">{user.email}</p>
                    </div>
                    
                    {user.role === 'client' ? (
                      <>
                        <Link
                          to="/client/favorites"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-[#555555] hover:bg-[#FAFAFA] hover:text-[#111111] rounded-lg transition-colors"
                        >
                          <Heart size={14} />
                          My Favorites
                        </Link>
                        <Link
                          to="/client/inquiries"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-[#555555] hover:bg-[#FAFAFA] hover:text-[#111111] rounded-lg transition-colors"
                        >
                          <MessageSquare size={14} />
                          My Inquiries
                        </Link>
                        <Link
                          to="/client/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-[#555555] hover:bg-[#FAFAFA] hover:text-[#111111] rounded-lg transition-colors"
                        >
                          <User size={14} />
                          My Profile
                        </Link>
                      </>
                    ) : (
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/manager'}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-[#555555] hover:bg-[#FAFAFA] hover:text-[#111111] rounded-lg transition-colors"
                      >
                        <LayoutGrid size={14} />
                        Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-[#E63946] hover:bg-[#FFF0F1] rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-[38px] h-[38px] rounded-full text-white transition-all duration-200"
                style={{
                  background: '#C1121F',
                  boxShadow: '0 2px 16px rgba(193,18,31,0.28)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#9B0F18';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(193,18,31,0.38)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#C1121F';
                  e.currentTarget.style.boxShadow = '0 2px 16px rgba(193,18,31,0.28)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                aria-label="Login"
              >
                <User size={16} />
              </Link>
            )}
          </div>
 
          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="lg:hidden ml-auto p-2.5 text-[#444444] hover:text-[#111111] rounded-xl hover:bg-[#F5F5F5] transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
 
      {/* ══════════════════════════════════════
          MOBILE MENU DRAWER
      ══════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-30 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#111111]/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
 
        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[300px] bg-white flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ boxShadow: '-4px 0 40px rgba(0,0,0,0.12)' }}
        >
          <div className="h-[2.5px] bg-[#C1121F]" />
 
          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 h-[68px] border-b border-[#F0F0F0]">
            <span
              className="text-[10px] tracking-[0.28em] text-[#C1121F] uppercase font-bold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Studio Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#999999] hover:text-[#111111] rounded-lg hover:bg-[#F5F5F5] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
 
          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 text-[11.5px] tracking-[0.14em] uppercase font-semibold rounded-xl mb-1 transition-all duration-150 ${
                    isActive
                      ? 'bg-[rgba(193,18,31,0.06)] text-[#C1121F] border-l-2 border-[#C1121F]'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] border-l-2 border-transparent'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {link.name}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C1121F]" />}
                </Link>
              );
            })}
 
            {/* Collections label */}
            <div className="mt-5 mb-2 px-4">
              <p
                className="text-[9px] tracking-[0.26em] text-[#BBBBBB] uppercase font-bold"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Collections
              </p>
            </div>
 
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="flex items-center justify-between px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase text-[#888888] hover:text-[#C1121F] hover:bg-[#FAFAFA] rounded-xl mb-0.5 transition-all duration-150 border-l-2 border-transparent"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {cat.name}
                <ArrowUpRight size={11} className="text-[#CCCCCC]" />
              </Link>
            ))}
 
            <Link
              to="/categories"
              className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#C1121F] hover:bg-[rgba(193,18,31,0.05)] rounded-xl transition-all duration-150"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              All Collections <ArrowUpRight size={11} />
            </Link>
          </nav>
 
          {/* CTA bottom */}
          <div className="p-5 border-t border-[#F0F0F0] space-y-2.5">
            {user ? (
              <>
                {user.role === 'client' ? (
                  <>
                    <Link
                      to="/client/favorites"
                      className="w-full block text-center py-2 text-white text-[11px] font-bold tracking-[0.18em] uppercase transition-colors rounded-xl mb-2"
                      style={{ fontFamily: 'Inter, sans-serif', background: '#C1121F' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#9B0F18'}
                      onMouseLeave={e => e.currentTarget.style.background = '#C1121F'}
                    >
                      My Favorites
                    </Link>
                    <Link
                      to="/client/inquiries"
                      className="w-full block text-center py-2 text-white text-[11px] font-bold tracking-[0.18em] uppercase transition-colors rounded-xl mb-2"
                      style={{ fontFamily: 'Inter, sans-serif', background: '#C1121F' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#9B0F18'}
                      onMouseLeave={e => e.currentTarget.style.background = '#C1121F'}
                    >
                      My Inquiries
                    </Link>
                    <Link
                      to="/client/profile"
                      className="w-full block text-center py-2 text-white text-[11px] font-bold tracking-[0.18em] uppercase transition-colors rounded-xl"
                      style={{ fontFamily: 'Inter, sans-serif', background: '#C1121F' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#9B0F18'}
                      onMouseLeave={e => e.currentTarget.style.background = '#C1121F'}
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/manager'}
                    className="w-full block text-center py-3 text-white text-[11px] font-bold tracking-[0.18em] uppercase transition-colors rounded-xl"
                    style={{ fontFamily: 'Inter, sans-serif', background: '#C1121F' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#9B0F18'}
                    onMouseLeave={e => e.currentTarget.style.background = '#C1121F'}
                  >
                    My Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-[11px] text-[#AAAAAA] hover:text-[#C1121F] uppercase tracking-[0.14em] font-semibold transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full text-center py-3 text-white text-[11px] font-bold tracking-[0.18em] uppercase rounded-xl transition-all"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: '#C1121F',
                  boxShadow: '0 2px 14px rgba(193,18,31,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#9B0F18'}
                onMouseLeave={e => e.currentTarget.style.background = '#C1121F'}
              >
                <User size={14} /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
 
      {/* ══════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════ */}
      <main className="flex-1 flex flex-col pt-[60px] lg:pt-[72px]">
        <Outlet />
      </main>
 
      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ fontFamily: 'Inter, sans-serif' }}>
 
        {/* Red accent */}
        <div className="h-[2.5px] bg-[#C1121F]" />
 
        {/* Main footer body */}
        <div className="bg-white border-t border-[#E5E5E5]">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 lg:gap-14">
 
              {/* Col 1 — Brand */}
              <FooterAccordion title="Klare Homes" showDesktopTitle={false} defaultOpen={true}>
                <div className="space-y-7 pt-2 lg:pt-0 pb-6 lg:pb-0">
                  <div>
                    <img
                      src={logoImg}
                      alt="Klare Homes"
                      className="h-11 w-auto object-contain object-left"
                    />
                    <p
                      className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase mt-2.5 font-bold"
                      style={{ letterSpacing: '0.24em' }}
                    >
                      Luxury Architecture & Design
                    </p>
                  </div>
   
                  <p className="text-[13px] text-[#888888] leading-[1.8] max-w-[210px]">
                    Bespoke luxury interior architecture crafted with German engineering precision and Italian aesthetic sensibility.
                  </p>
   
                  {/* Contact */}
                  <div className="space-y-3.5">
                    {settings?.contact_phone && (
                      <a
                        href={`tel:${settings.contact_phone}`}
                        className="flex items-center gap-3 text-[13px] text-[#777777] hover:text-[#C1121F] transition-colors duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] group-hover:bg-[rgba(193,18,31,0.07)] flex items-center justify-center transition-colors shrink-0">
                          <Phone size={13} className="text-[#C1121F]" />
                        </div>
                        <span>{settings.contact_phone}</span>
                      </a>
                    )}
                    {settings?.contact_email && (
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="flex items-center gap-3 text-[13px] text-[#777777] hover:text-[#C1121F] transition-colors duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] group-hover:bg-[rgba(193,18,31,0.07)] flex items-center justify-center transition-colors shrink-0">
                          <Mail size={13} className="text-[#C1121F]" />
                        </div>
                        <span>{settings.contact_email}</span>
                      </a>
                    )}
                  </div>
   
                  {/* Social */}
                  <div className="flex gap-2">
                    <a
                      href={settings?.instagram_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl border border-[#E5E5E5] hover:border-[#C1121F] hover:bg-[rgba(193,18,31,0.05)] text-[#AAAAAA] hover:text-[#C1121F] flex items-center justify-center transition-all duration-200"
                      title="Instagram"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Klare Homes',
                            text: 'Check out Klare Homes Luxury Interior Design Studio',
                            url: window.location.origin,
                          }).catch(console.error);
                        } else {
                          // Fallback for unsupported browsers
                          navigator.clipboard.writeText(window.location.origin);
                          alert('Website link copied to clipboard!');
                        }
                      }}
                      className="w-9 h-9 rounded-xl border border-[#E5E5E5] hover:border-[#C1121F] hover:bg-[rgba(193,18,31,0.05)] text-[#AAAAAA] hover:text-[#C1121F] flex items-center justify-center transition-all duration-200"
                      title="Share Website"
                    >
                      <Share2 size={14} />
                    </button>
                    <a
                      href={settings?.facebook_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl border border-[#E5E5E5] hover:border-[#C1121F] hover:bg-[rgba(193,18,31,0.05)] text-[#AAAAAA] hover:text-[#C1121F] flex items-center justify-center transition-all duration-200"
                      title="Facebook"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.59-4H14V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </FooterAccordion>
 
              {/* Col 2 — Showroom */}
              <FooterAccordion title="Showroom">
                <div className="space-y-6 pt-2 lg:pt-0 pb-6 lg:pb-0">
                  <div className="flex items-start gap-3 text-[13px] text-[#777777] leading-[1.8]">
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(settings?.studio_address || 'Maximilianstraße 45, 80539 München, Germany')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0 mt-0.5 hover:bg-[rgba(193,18,31,0.1)] transition-colors"
                    >
                      <MapPin size={13} className="text-[#C1121F]" />
                    </a>
                    <span className="whitespace-pre-line">
                      {settings?.studio_address || 'Maximilianstraße 45,\n80539 München, Germany'}
                    </span>
                  </div>
   
                  <p className="text-[12px] text-[#AAAAAA] italic leading-relaxed">
                    Visits by private appointment only.
                  </p>
   
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#C1121F] hover:text-[#9B0F18] transition-colors duration-200"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Book Appointment <ArrowUpRight size={11} />
                  </Link>
                </div>
              </FooterAccordion>
 
              {/* Col 3 — Collections */}
              <FooterAccordion title="Collections">
                <div className="space-y-6 pt-2 lg:pt-0 pb-6 lg:pb-0">
                  <ul className="space-y-3">
                    {collections.map((col) => (
                      <li key={col.id}>
                        <Link
                          to={`/categories/${col.category?.slug || 'all'}/collections/${col.slug}`}
                          className="flex items-center gap-2.5 text-[13px] text-[#777777] hover:text-[#C1121F] transition-colors duration-200 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-[#DDDDDD] group-hover:bg-[#C1121F] transition-colors shrink-0" />
                          {col.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/categories"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#C1121F] hover:text-[#9B0F18] transition-colors duration-200 mt-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        All Collections <ArrowUpRight size={11} />
                      </Link>
                    </li>
                  </ul>
                </div>
              </FooterAccordion>
 
              {/* Col 4 — Studio Hours */}
              <FooterAccordion title="Working Hours">
                <div className="space-y-6 pt-2 lg:pt-0 pb-6 lg:pb-0">
                  {settings?.opening_hours ? (
                    <p className="text-[13px] text-[#777777] whitespace-pre-line leading-loose">
                      {settings.opening_hours}
                    </p>
                  ) : (
                    <div className="space-y-3 text-[13px]">
                      <div className="flex justify-between gap-4 pb-3 border-b border-[#F2F2F2]">
                        <span className="text-[#444444] font-medium">Monday – Friday</span>
                        <span className="text-[#999999]">09:00 – 18:00</span>
                      </div>
                      <div className="flex justify-between gap-4 pb-3 border-b border-[#F2F2F2]">
                        <span className="text-[#444444] font-medium">Saturday</span>
                        <span className="text-[#999999]">10:00 – 15:00</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#AAAAAA]">Sunday</span>
                        <span className="text-[#CCCCCC]">Closed</span>
                      </div>
                    </div>
                  )}
                </div>
              </FooterAccordion>
            </div>
          </div>
        </div>
 
        {/* Legal bar */}
        <div className="bg-[#F8F7F5] border-t border-[#EBEBEB]">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11.5px] text-[#AAAAAA]">
            <p>© {new Date().getFullYear()} Klare Homes All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Use', 'Imprint'].map(item => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-[#555555] transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
 
export default PublicLayout;

const FooterAccordion = ({ title, children, showDesktopTitle = true, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E5E5E5] lg:border-none lg:block py-4 lg:py-0">
      {/* Mobile Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between lg:hidden focus:outline-none"
      >
        <h4 className="text-[10px] tracking-[0.26em] uppercase text-[#111111] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </h4>
        <ChevronDown size={16} className={`transition-transform duration-300 text-[#111111] ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Desktop Header */}
      {showDesktopTitle && (
        <div className="hidden lg:block mb-3.5">
          <h4 className="text-[10px] tracking-[0.26em] uppercase text-[#111111] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
            {title}
          </h4>
          <div className="w-7 h-[1.5px] bg-[#C1121F] rounded-full mt-3.5" />
        </div>
      )}

      {/* Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out lg:!max-h-none lg:!opacity-100 lg:!mt-0 ${isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};
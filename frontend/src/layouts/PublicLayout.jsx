import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, Phone, Mail, MapPin, LogOut, ChevronDown, Globe, Share2, Users2, ArrowUpRight } from 'lucide-react';
import API from '../services/api';

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
    API.get('/categories').then(res => { if (res.data.success) setCategories(res.data.data.slice(0, 5)); }).catch(() => {});
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  // Navbar is always visible — solid dark style, no transparency

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface)' }}>

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ease-out ${
        scrolled
          ? 'py-3 shadow-[0_4px_30px_rgba(0,0,0,0.25)]'
          : 'py-4'
      }`}
        style={{
          background: scrolled
            ? 'rgba(10, 15, 30, 0.97)'
            : 'linear-gradient(180deg, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.75) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(200,169,126,0.15)',
        }}
      >
        {/* Gold accent top line */}
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #C8A97E, transparent)' }} />

        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex flex-col group">
            <span className="text-xl font-light tracking-[0.28em] text-white group-hover:text-[#E8D5B0] transition-colors duration-300" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {settings?.site_name?.toUpperCase() || 'SIGNATURE'}
            </span>
            <span className="text-[8px] tracking-[0.42em] text-[#C8A97E] uppercase font-semibold mt-0.5">
              Luxury Architecture &amp; Design
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.name} to={link.path}
                  className={`relative text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-200 pb-0.5 group ${
                    isActive ? 'text-[#C8A97E]' : 'text-white/75 hover:text-white'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-px bg-[#C8A97E] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}

            {/* Collections Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-white/75 hover:text-white transition-colors duration-200"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Collections
                <ChevronDown size={12} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-60 bg-white border border-stone-100 shadow-[0_12px_40px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-fadeInUp">
                  {/* Top gold accent line */}
                  <div className="h-px bg-gradient-to-r from-[#C8A97E] via-[#DFCDAE] to-[#A8834A] mb-1.5" />
                  {categories.map((cat) => (
                    <Link key={cat.id} to={`/categories/${cat.slug}`}
                      className="flex items-center justify-between px-5 py-2.5 text-[11px] tracking-wider uppercase text-stone-600 hover:bg-stone-50 hover:text-[#C8A97E] transition-colors group"
                    >
                      <span>{cat.name}</span>
                      <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                  <div className="border-t border-stone-100 mt-1.5 pt-1.5">
                    <Link to="/categories"
                      className="flex items-center justify-between px-5 py-2.5 text-[11px] tracking-wider uppercase text-[#C8A97E] font-semibold hover:bg-stone-50 transition-colors group"
                    >
                      <span>All Collections</span>
                      <ArrowUpRight size={11} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/client'}
                  className="text-[11px] tracking-[0.14em] uppercase font-semibold border border-white/20 px-5 py-2.5 text-white/80 hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all duration-200"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-white/50 hover:text-red-400 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="text-[11px] tracking-[0.14em] uppercase font-semibold px-6 py-3 bg-[#C8A97E] hover:bg-[#A8834A] text-white transition-all duration-300 shadow-[0_2px_12px_rgba(200,169,126,0.35)] hover:shadow-[0_4px_20px_rgba(200,169,126,0.5)] hover:-translate-y-0.5"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Studio Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      <div className={`fixed inset-0 z-30 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        {/* Drawer */}
        <div className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl flex flex-col pt-20 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-px bg-gradient-to-r from-[#C8A97E] via-[#DFCDAE] to-[#A8834A]" />
          <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.name} to={link.path}
                  className={`flex items-center justify-between px-4 py-3.5 text-sm tracking-wider uppercase font-medium transition-colors border-l-2 ${
                    isActive ? 'border-[#C8A97E] text-[#C8A97E] bg-amber-50' : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {link.name}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]" />}
                </Link>
              );
            })}
            <Link to="/categories"
              className="flex items-center justify-between px-4 py-3.5 text-sm tracking-wider uppercase font-semibold text-[#C8A97E] border-l-2 border-transparent hover:bg-amber-50 transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Browse Collections
              <ArrowUpRight size={14} />
            </Link>
          </nav>

          <div className="px-6 py-6 border-t border-stone-100 space-y-3">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/client'}
                  className="w-full block text-center py-3.5 bg-stone-900 text-white text-xs tracking-widest uppercase font-semibold transition-colors hover:bg-[#C8A97E]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  My Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="w-full text-center py-2.5 text-xs tracking-wider uppercase text-stone-400 hover:text-red-500 transition-colors font-medium"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login"
                className="w-full block text-center py-3.5 bg-[#C8A97E] text-white text-xs tracking-widest uppercase font-semibold hover:bg-[#A8834A] transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Studio Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A0F1E] text-slate-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {/* Gold top border */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C8A97E] to-transparent opacity-40" />

        <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

            {/* Col 1: Brand */}
            <div className="space-y-5 lg:col-span-1">
              <div>
                <h2 className="text-xl font-light tracking-[0.24em] text-white">
                  {settings?.site_name?.toUpperCase() || 'SIGNATURE'}
                </h2>
                <p className="text-[9px] tracking-widest text-[#C8A97E] uppercase mt-1">Luxury Architecture &amp; Design</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Bespoke luxury interior architecture crafted with German engineering precision and Italian aesthetic sensibility.
              </p>
              <div className="space-y-2.5 text-xs font-sans">
                <a href={`tel:${settings?.contact_phone}`} className="flex items-center gap-2.5 text-slate-500 hover:text-[#C8A97E] transition-colors">
                  <Phone size={13} className="text-[#C8A97E] shrink-0" />
                  <span>{settings?.contact_phone || '+49 (89) 123-4567'}</span>
                </a>
                <a href={`mailto:${settings?.contact_email}`} className="flex items-center gap-2.5 text-slate-500 hover:text-[#C8A97E] transition-colors">
                  <Mail size={13} className="text-[#C8A97E] shrink-0" />
                  <span>{settings?.contact_email || 'concierge@signature.com'}</span>
                </a>
              </div>
              {/* Social links */}
              <div className="flex gap-3 pt-1">
                {[Globe, Share2, Users2].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 border border-slate-700 hover:border-[#C8A97E] hover:text-[#C8A97E] flex items-center justify-center transition-all duration-200">
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Showroom */}
            <div className="space-y-4">
              <h3 className="text-[10px] tracking-[0.24em] uppercase text-white font-semibold">Showroom</h3>
              <div className="h-px w-8 bg-[#C8A97E]" />
              <div className="flex items-start gap-2.5 text-xs text-slate-500 font-sans">
                <MapPin size={14} className="text-[#C8A97E] shrink-0 mt-0.5" />
                <span className="whitespace-pre-line leading-relaxed">
                  {settings?.studio_address || 'Maximilianstraße 45,\n80539 München,\nGermany'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-sans italic">Visits by private appointment only.</p>
            </div>

            {/* Col 3: Collections */}
            <div className="space-y-4">
              <h3 className="text-[10px] tracking-[0.24em] uppercase text-white font-semibold">Collections</h3>
              <div className="h-px w-8 bg-[#C8A97E]" />
              <ul className="space-y-2 text-xs">
                {collections.map((col) => (
                  <li key={col.id}>
                    <Link
                      to={`/categories/${col.category?.slug || 'all'}/collections/${col.slug}`}
                      className="text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-[#C8A97E] transition-colors" />
                      {col.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/categories" className="text-[#C8A97E] hover:text-[#DFCDAE] transition-colors text-[11px] font-medium tracking-wider">
                    → All Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Studio Hours */}
            <div className="space-y-4">
              <h3 className="text-[10px] tracking-[0.24em] uppercase text-white font-semibold">Studio Hours</h3>
              <div className="h-px w-8 bg-[#C8A97E]" />
              {settings?.opening_hours ? (
                <p className="text-xs text-slate-500 font-sans whitespace-pre-line leading-loose">{settings.opening_hours}</p>
              ) : (
                <ul className="space-y-2 text-xs font-sans text-slate-500">
                  <li className="flex justify-between gap-4"><span>Monday – Friday</span><span className="text-slate-400">09:00 – 18:00</span></li>
                  <li className="flex justify-between gap-4"><span>Saturday</span><span className="text-slate-400">10:00 – 15:00</span></li>
                  <li className="flex justify-between gap-4"><span className="text-slate-600">Sunday</span><span className="text-slate-700">Closed</span></li>
                </ul>
              )}
              <Link to="/contact" className="inline-flex items-center gap-2 mt-2 text-[11px] font-semibold tracking-wider uppercase text-[#C8A97E] hover:text-[#DFCDAE] transition-colors">
                Book Appointment <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

          {/* Legal bar */}
          <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600 font-sans">
            <p>© {new Date().getFullYear()} SIGNATURE Luxury Interiors. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Imprint</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default PublicLayout;

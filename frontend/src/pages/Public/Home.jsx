/**
 * Home.jsx — Klare Homes Interior Design
 * Design System: Playfair Display + Inter | Red #C1121F | Neutral-first palette
 * Architecture: Mobile-first, scroll-reveal, editorial layout
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight, Star, Compass, ChevronLeft, ChevronRight,
  CheckCircle, Phone, Mail, MapPin, Award, Layers, Zap
} from 'lucide-react';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const tokens = {
  red: '#C1121F',
  redDeep: '#9B0F18',
  redLight: '#E63946',
  gold: '#C1121F',
  goldSoft: '#9B0F18',
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  stone: '#F2EFEA',
  beige: '#EDE7DD',
  border: '#E5E5E5',
  text: '#111111',
  sub: '#666666',
  muted: '#888888',
};

/* ─────────────────────────────────────────────
   REUSABLE PRIMITIVES
───────────────────────────────────────────── */

/** Fade-up on scroll */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/** Section eyebrow label */
const Eyebrow = ({ children }) => (
  <div className="inline-flex items-center gap-3">
    <span style={{
      display: 'block', width: 24, height: 1,
      background: tokens.red, flexShrink: 0
    }} />
    <span style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: 10, letterSpacing: '0.3em',
      textTransform: 'uppercase', fontWeight: 600,
      color: tokens.red,
    }}>
      {children}
    </span>
  </div>
);

/** Section headline */
const Headline = ({ children, className = '' }) => (
  <h2 className={className} style={{
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: 'clamp(32px, 4vw, 52px)',
    fontWeight: 700,
    color: tokens.text,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  }}>
    {children}
  </h2>
);

/** Thin red divider */
const Divider = ({ align = 'center', className = '' }) => (
  <div className={className} style={{
    display: 'flex',
    justifyContent: align === 'center' ? 'center' : 'flex-start',
    marginTop: 16,
  }}>
    <div style={{ width: 40, height: 2, background: tokens.red, borderRadius: 2 }} />
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  /* ── Data fetching (backend untouched) ── */
  useEffect(() => {
    API.get('/categories')
      .then(r => { if (r.data.success) setCategories(r.data.data); })
      .catch(console.error);
    API.get('/products?featured=true&limit=3')
      .then(r => { if (r.data.success) setFeaturedProducts(r.data.data); })
      .catch(console.error);
    API.get('/testimonials')
      .then(r => { if (r.data.success) setTestimonials(r.data.data.slice(0, 3)); })
      .catch(console.error);
    API.get('/projects')
      .then(r => { if (r.data.success) setProjects(r.data.data); })
      .catch(console.error);
    API.get('/public/content')
      .then(r => { if (r.data.success) setServices(r.data.data.services || []); })
      .catch(console.error);
  }, []);

  /* ── Carousel slides ── */
  const carouselSlides = projects.map(proj => {
    const primaryImg = proj.media?.find(m => m.isPrimary) || proj.media?.[0];
    return {
      id: proj.id,
      image: getImageUrl(primaryImg?.filePath),
      title: proj.title,
      subtitle: proj.projectType || 'Klare Homes Design',
      location: proj.location || 'Private Collection',
    };
  });

  useEffect(() => {
    if (carouselSlides.length <= 1) return;
    const id = setInterval(() =>
      setCurrentSlide(p => (p + 1) % carouselSlides.length), 5000);
    return () => clearInterval(id);
  }, [carouselSlides.length]);

  const handlePrevSlide = () =>
    setCurrentSlide(p => (p - 1 + carouselSlides.length) % carouselSlides.length);
  const handleNextSlide = () =>
    setCurrentSlide(p => (p + 1) % carouselSlides.length);

  /* ── Form submit (backend untouched) ── */
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInquiryStatus('');
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await API.post('/inquiries', {
        ...data,
        subject: 'General Showroom Request',
        inquiryType: 'general',
      });
      if (res.data.success) {
        setInquiryStatus('success');
        const cleanPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '919319919131';
        const messageText = `*New Private Request*\n\n*Name:* ${data.name}\n*Email:* ${data.email}\n*Phone:* ${data.phone || 'N/A'}\n\n*Message:*\n${data.message}`;
        window.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
        e.target.reset();
      }
    } catch {
      setInquiryStatus('error');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div style={{ backgroundColor: tokens.bg, fontFamily: 'Inter, sans-serif' }}>

      {/* ══════════════════════════════════════
          1. HERO — Editorial Split Layout
      ══════════════════════════════════════ */}
      <section className="home-hero-section">
        <style>{`
          .home-hero-section {
            min-height: 100vh;
            position: relative;
            display: flex;
            align-items: center;
            overflow: hidden;
            background-color: ${tokens.stone};
          }
          .home-hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(105deg, ${tokens.stone} 42%, transparent 58%);
            z-index: 2;
          }
          .home-hero-content {
            position: relative;
            z-index: 4;
            max-width: 1440px;
            margin: 0 auto;
            padding: clamp(80px, 10vw, 120px) clamp(24px, 5vw, 64px);
            width: 100%;
          }
          .home-hero-h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(52px, 7vw, 88px);
            font-weight: 700;
            color: ${tokens.text};
            line-height: 1.05;
            letter-spacing: -0.03em;
            margin-top: 28px;
            margin-bottom: 0;
          }
          .home-hero-desc {
            font-size: 17px;
            color: ${tokens.sub};
            line-height: 1.75;
            max-width: 480px;
            margin-bottom: 40px;
          }
          .home-hero-buttons {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 56px;
          }
          .home-hero-stats {
            display: flex;
            gap: 48px;
            flex-wrap: wrap;
          }
          .home-hero-stat-num {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 36px;
            font-weight: 700;
            color: ${tokens.text};
            line-height: 1;
            margin: 0;
          }

          /* MOBILE OVERRIDES */
          @media (max-width: 768px) {
            .home-hero-section {
              min-height: auto;
              padding-top: 88px; /* Offset for navbar */
              padding-bottom: 40px;
            }
            .home-hero-overlay {
              /* Ensure image shows through at the bottom right on mobile */
              background: linear-gradient(to bottom, rgba(242,239,234,0.95) 0%, rgba(242,239,234,0.85) 55%, transparent 100%);
            }
            .home-hero-content {
              padding: 24px 24px 120px 24px; /* extra bottom padding so text doesn't hide image */
            }
            .home-hero-h1 {
              font-size: 44px;
              margin-top: 20px;
            }
            .home-hero-desc {
              font-size: 14px;
              margin-bottom: 32px;
            }
            .home-hero-buttons {
              gap: 12px;
              margin-bottom: 40px;
            }
            .home-hero-buttons > a {
              flex: 1;
              min-width: 100%;
            }
            .home-hero-buttons button {
              width: 100%;
              justify-content: center;
            }
            .home-hero-stats {
              gap: 24px 32px;
            }
            .home-hero-stat-num {
              font-size: 28px;
            }
          }
        `}</style>

        {/* Background overlay */}
        <div className="home-hero-overlay" />

        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920"
          alt="Luxury Interior"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center right',
          }}
        />

        {/* Vertical gold accent */}
        <div style={{
          position: 'absolute', left: 'clamp(24px, 5vw, 64px)',
          top: '20%', height: '60%', width: 1,
          background: `linear-gradient(to bottom, transparent, ${tokens.gold}, transparent)`,
          opacity: 0.5, zIndex: 3,
        }} />

        {/* Content */}
        <div className="home-hero-content">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ maxWidth: 620 }}
          >
            <Eyebrow>Architectural Precision & Luxury Engineering</Eyebrow>

            <h1 className="home-hero-h1">
              Bespoke<br />
              <em style={{ color: tokens.red, fontStyle: 'italic' }}>Spaces</em>{' '}
              For<br />
              Premium Living
            </h1>

            {/* Gold rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0' }}>
              <div style={{ width: 48, height: 1, background: tokens.gold }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.gold }} />
              <div style={{ width: 24, height: 1, background: tokens.gold, opacity: 0.5 }} />
            </div>

            <p className="home-hero-desc">
              Inspired by the absolute peak of German craftsmanship, Klare Homes constructs
              tailor-made kitchens, wardrobes, and living solutions matching your exact
              spatial footprint.
            </p>

            <div className="home-hero-buttons">
              <Link to="/categories">
                <HeroButton primary>
                  Explore Collections <ArrowRight size={16} />
                </HeroButton>
              </Link>
              <Link to="/contact">
                <HeroButton>Book Showroom Tour</HeroButton>
              </Link>
            </div>

            {/* Stats */}
            <div className="home-hero-stats">
              {[['15+', 'Years Excellence'], ['500+', 'Projects Delivered'], ['100%', 'Bespoke']].map(([num, label]) => (
                <div key={label}>
                  <p className="home-hero-stat-num">{num}</p>
                  <p style={{
                    fontSize: 10, color: tokens.muted,
                    textTransform: 'uppercase', letterSpacing: '0.2em',
                    marginTop: 6, marginBottom: 0,
                  }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: 'absolute', bottom: 40, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, zIndex: 5,
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: '0.35em', color: tokens.muted, textTransform: 'uppercase' }}>Discover</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${tokens.muted}, transparent)` }}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          2. BRAND BAR — Stats + Credentials
      ══════════════════════════════════════ */}
      <section className="home-brand-bar" style={{ background: tokens.text, padding: '24px clamp(24px, 5vw, 64px)' }}>
        <div className="home-brand-bar-inner" style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 24,
        }}>
          {[
            { icon: <Award size={14} />, text: 'German Engineering Standards' },
            { icon: <Layers size={14} />, text: 'Italian Material Sourcing' },
            { icon: <Zap size={14} />, text: '72-Hour Design Turnaround' },
            { icon: <CheckCircle size={14} />, text: '10-Year Craftsmanship Warranty' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: 'rgba(255,255,255,0.65)',
              fontSize: 11, letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              <span style={{ color: tokens.gold }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. SERVICES — Editorial Cards
      ══════════════════════════════════════ */}
      {services.length > 0 && (
        <section style={{ padding: 'clamp(64px, 8vw, 112px) 0', background: tokens.surface, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px)', marginBottom: 56 }}>
            <Reveal>
              <Eyebrow>Our Expertise</Eyebrow>
              <Headline style={{ marginTop: 16 }}>Klare Homes Services</Headline>
              <Divider align="left" />
            </Reveal>
          </div>

          <div className="services-container">
            <style>{`
              @media (max-width: 768px) {
                .services-desktop-marquee { display: none !important; }
                .services-mobile-scroll {
                  display: flex;
                  overflow-x: auto;
                  padding-bottom: 24px;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(0,0,0,0.15) transparent;
                  -webkit-overflow-scrolling: touch;
                  margin: 0 calc(-1 * clamp(24px, 5vw, 64px));
                  padding: 0 clamp(24px, 5vw, 64px);
                  gap: 24px;
                }
                .services-mobile-scroll::-webkit-scrollbar { height: 4px; display: block; }
                .services-mobile-scroll::-webkit-scrollbar-track { background: transparent; }
                .services-mobile-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
              }
              @media (min-width: 769px) {
                .services-mobile-scroll { display: none !important; }
              }
            `}</style>

            {/* Desktop: Infinite Marquee (original) */}
            <div className="services-desktop-marquee" style={{ overflow: 'hidden', position: 'relative' }}>
              <motion.div
                style={{ display: 'flex', gap: 24, paddingLeft: 24 }}
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  ease: 'linear',
                  duration: Math.max(30, services.length * 7),
                  repeat: Infinity,
                }}
              >
                {[...services, ...services, ...services, ...services].map((srv, idx) => (
                  <ServiceCard key={`srv-d-${srv.id}-${idx}`} srv={srv} />
                ))}
              </motion.div>
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="services-mobile-scroll">
              {services.map((srv, idx) => (
                <ServiceCard key={`srv-m-${srv.id}-${idx}`} srv={srv} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          4. CATEGORIES — Immersive Grid
      ══════════════════════════════════════ */}
      <section style={{ padding: 'clamp(64px, 8vw, 112px) clamp(24px, 5vw, 64px)', background: tokens.stone }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Reveal className="text-center" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Eyebrow>Collections</Eyebrow>
            </div>
            <Headline style={{ marginTop: 16, textAlign: 'center' }}>
              Explore Our Categories
            </Headline>
            <Divider align="center" />
          </Reveal>

          <div className="categories-container">
            <style>{`
              .categories-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 24px;
              }
              @media (max-width: 768px) {
                .categories-container {
                  display: flex;
                  overflow-x: auto;
                  padding-bottom: 24px;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(0,0,0,0.15) transparent;
                  -webkit-overflow-scrolling: touch;
                  margin: 0 calc(-1 * clamp(24px, 5vw, 64px));
                  padding: 0 clamp(24px, 5vw, 64px);
                }
                .categories-container::-webkit-scrollbar { height: 4px; display: block; }
                .categories-container::-webkit-scrollbar-track { background: transparent; }
                .categories-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
                .categories-container > div {
                  flex-shrink: 0;
                  width: clamp(280px, 80vw, 320px);
                }
              }
            `}</style>
            {categories.map((cat, idx) => (
              <div key={cat.id}>
                <Reveal delay={idx * 0.12}>
                  <CategoryCard cat={cat} idx={idx} />
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. FEATURED PRODUCTS — Magazine Grid
      ══════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section style={{ padding: 'clamp(64px, 8vw, 112px) clamp(24px, 5vw, 64px)', background: tokens.surface }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, gap: 16 }}>
              <div>
                <Eyebrow>Premium Millwork</Eyebrow>
                <Headline style={{ marginTop: 12 }}>Featured Pieces</Headline>
                <Divider align="left" />
              </div>
              <Link to="/categories" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: tokens.sub, textDecoration: 'none', fontWeight: 600,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = tokens.red}
                onMouseLeave={e => e.currentTarget.style.color = tokens.sub}
              >
                Full Catalog <ArrowRight size={13} />
              </Link>
            </Reveal>

            <div className="featured-products-container">
              <style>{`
                .featured-products-container {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                  gap: 32px;
                }
                @media (max-width: 768px) {
                  .featured-products-container {
                    display: flex;
                    overflow-x: auto;
                    padding-bottom: 24px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.15) transparent;
                    -webkit-overflow-scrolling: touch;
                    margin: 0 calc(-1 * clamp(24px, 5vw, 64px));
                    padding: 0 clamp(24px, 5vw, 64px);
                  }
                  .featured-products-container::-webkit-scrollbar { height: 4px; display: block; }
                  .featured-products-container::-webkit-scrollbar-track { background: transparent; }
                  .featured-products-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
                  .featured-products-container > div {
                    flex-shrink: 0;
                    width: clamp(280px, 80vw, 320px);
                  }
                }
              `}</style>
              {featuredProducts.map((prod, idx) => (
                <div key={prod.id}>
                  <Reveal delay={idx * 0.1}>
                    <ProductCard prod={prod} />
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* ══════════════════════════════════════
          7. CONSULTATION — Split + Carousel
      ══════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(64px, 8vw, 112px) clamp(24px, 5vw, 64px)',
        background: tokens.surface,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, rgba(193,18,31,0.05), transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(212,175,55,0.06), transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="home-consultation-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'start',
          }}>

            {/* LEFT PANEL */}
            <div className="home-spaces-panel" style={{ flexDirection: 'column', gap: 40 }}>
              <style>{`
                @media (max-width: 768px) {
                  .home-spaces-panel { display: none !important; }
                }
                @media (min-width: 769px) {
                  .home-spaces-panel { display: flex !important; }
                }
              `}</style>
              <Reveal>
                <Eyebrow>Klare Homes Spaces</Eyebrow>
                <Headline style={{ marginTop: 16 }}>
                  Transforming Spaces Into{' '}
                  <em style={{ color: tokens.red, fontStyle: 'italic' }}>Timeless</em>{' '}
                  Masterpieces
                </Headline>
                <Divider align="left" />
                <p style={{ fontSize: 16, color: tokens.sub, lineHeight: 1.75, marginTop: 20, maxWidth: 480 }}>
                  Our custom German-engineered installations blend precision with premium Italian aesthetics. Browse recent luxury executions and request a design partner review.
                </p>
              </Reveal>

              {/* Carousel */}
              <Reveal delay={0.15}>
                <CarouselBlock
                  slides={carouselSlides}
                  currentSlide={currentSlide}
                  onPrev={handlePrevSlide}
                  onNext={handleNextSlide}
                  onDot={setCurrentSlide}
                />
              </Reveal>

              {/* Process pillars */}
              <Reveal delay={0.2}>
                <div className="home-process-pillars" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 24, paddingTop: 32,
                  borderTop: `1px solid ${tokens.border}`,
                }}>
                  {[
                    { label: 'German Engineered', desc: 'Cabinetry crafted to the highest European industrial standards.' },
                    { label: 'Tailor-Made', desc: 'Every piece customized to the millimeter for your exact space.' },
                    { label: 'Luxury Renders', desc: '3D interior design mockups tailored to your project.' },
                  ].map(({ label, desc }, i) => (
                    <div key={label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.gold, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 1, background: tokens.border }} />
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: tokens.text, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 11, color: tokens.muted, lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* RIGHT PANEL — Form */}
            <Reveal delay={0.1}>
              <ConsultationForm
                onSubmit={handleInquirySubmit}
                loading={loading}
                status={inquiryStatus}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. FOOTER CTA — Full-width luxury
      ══════════════════════════════════════ */}
      <section style={{
        background: tokens.text,
        padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 64px)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, rgba(193,18,31,0.15), transparent 60%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Eyebrow>Begin Your Journey</Eyebrow>
            </div>
            <h2 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 700, color: tokens.surface,
              lineHeight: 1.1, letterSpacing: '-0.02em',
              margin: '24px 0 20px',
            }}>
              Your Vision. Our{' '}
              <span style={{ color: tokens.red }}>Craft.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 40 }}>
              Schedule a private showroom appointment and experience bespoke German engineering firsthand.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact">
                <HeroButton primary>Book Private Consultation <ArrowRight size={15} /></HeroButton>
              </Link>
              <Link to="/categories">
                <HeroButton outline>Browse Collections</HeroButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9. TESTIMONIALS — Mobile Horizontal Scroll
      ══════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section style={{
          padding: 'clamp(64px, 8vw, 112px) clamp(24px, 5vw, 64px)',
          background: tokens.beige,
          borderTop: `1px solid ${tokens.border}`,
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Reveal style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Eyebrow>Client Voices</Eyebrow>
              </div>
              <Headline style={{ marginTop: 16, textAlign: 'center' }}>
                What Our Clients Say
              </Headline>
              <Divider align="center" />
            </Reveal>

            <div className="testimonials-container">
              <style>{`
                .testimonials-desktop-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                  gap: 32px;
                }
                @media (max-width: 768px) {
                  .testimonials-desktop-grid { display: none !important; }
                  .testimonials-mobile-scroll {
                    display: flex;
                    overflow-x: auto;
                    padding-bottom: 24px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.15) transparent;
                    -webkit-overflow-scrolling: touch;
                    margin: 0 calc(-1 * clamp(24px, 5vw, 64px));
                    padding: 0 clamp(24px, 5vw, 64px);
                    gap: 16px;
                  }
                  .testimonials-mobile-scroll::-webkit-scrollbar { height: 4px; display: block; }
                  .testimonials-mobile-scroll::-webkit-scrollbar-track { background: transparent; }
                  .testimonials-mobile-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
                }
                @media (min-width: 769px) {
                  .testimonials-mobile-scroll { display: none !important; }
                }
              `}</style>

              {/* Desktop: Grid */}
              <div className="testimonials-desktop-grid">
                {testimonials.map((t, idx) => (
                  <Reveal key={`desk-${t.id}`} delay={idx * 0.12}>
                    <TestimonialCard t={t} />
                  </Reveal>
                ))}
              </div>

              {/* Mobile: Horizontal Scroll */}
              <div className="testimonials-mobile-scroll">
                {testimonials.map((t, idx) => (
                  <div key={`mob-${t.id}`} style={{ flexShrink: 0, width: 280 }}>
                    <TestimonialCard t={t} small />
                  </div>
                ))}
              </div>
            </div>

            <Reveal style={{ textAlign: 'center', marginTop: 56 }}>
              <Link to="/testimonials">
                <GhostButton>View All Testimonials <ArrowRight size={13} /></GhostButton>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

    </div>
  );
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

/** Hero buttons */
const HeroButton = ({ children, primary, outline, ...props }) => {
  const [hovered, setHovered] = useState(false);

  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '14px 28px', borderRadius: 12,
    fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
    cursor: 'pointer', border: 'none',
    transition: 'all 0.25s cubic-bezier(0.25,0.1,0.25,1)',
    textDecoration: 'none', fontFamily: 'Inter, sans-serif',
  };

  if (primary) {
    return (
      <button
        style={{
          ...base,
          background: hovered ? tokens.redDeep : tokens.red,
          color: '#fff',
          boxShadow: hovered
            ? '0 8px 24px rgba(193,18,31,0.35)'
            : '0 4px 12px rgba(193,18,31,0.2)',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (outline) {
    return (
      <button
        style={{
          ...base,
          background: 'transparent',
          color: hovered ? tokens.surface : 'rgba(255,255,255,0.6)',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      style={{
        ...base,
        background: hovered ? tokens.stone : tokens.surface,
        color: tokens.text,
        border: `1px solid ${tokens.border}`,
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
};

/** Ghost text button */
const GhostButton = ({ children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: hovered ? tokens.red : tokens.sub,
        textDecoration: 'none', fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s',
        padding: '8px 0',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
};


/** Service card in marquee */
const ServiceCard = ({ srv }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 300, flexShrink: 0,
        background: hovered ? tokens.surface : tokens.bg,
        border: `1px solid ${hovered ? tokens.red : tokens.border}`,
        borderRadius: 20, padding: '32px 28px',
        boxShadow: hovered
          ? '0 12px 40px rgba(193,18,31,0.1)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.25,0.1,0.25,1)',
        cursor: 'default',
        whiteSpace: 'normal',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48,
        background: hovered ? 'rgba(193,18,31,0.1)' : 'rgba(193,18,31,0.06)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        transition: 'background 0.3s',
      }}>
        {srv.icon ? (
          <img
            src={getImageUrl(srv.icon)}
            alt=""
            style={{ width: 22, height: 22, objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <Compass size={20} color={tokens.red} />
        )}
      </div>

      <h3 style={{
        fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: tokens.text,
        marginBottom: 10,
      }}>
        {srv.title}
      </h3>
      <p style={{
        fontSize: 13, color: tokens.sub, lineHeight: 1.7,
        display: '-webkit-box', WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {srv.description || srv.desc}
      </p>

      {/* Bottom accent */}
      <div style={{
        marginTop: 24, height: 2, borderRadius: 1,
        background: hovered ? tokens.red : tokens.border,
        transition: 'background 0.3s',
        width: hovered ? '100%' : 32,
      }} />
    </div>
  );
};

/** Category card — portrait with dramatic overlay */
const CategoryCard = ({ cat, idx }) => {
  const [hovered, setHovered] = useState(false);
  const fallbacks = [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
  ];
  const imgSrc = getImageUrl(cat.image) || fallbacks[idx % 3];

  return (
    <Link to={`/categories/${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', borderRadius: 20, overflow: 'hidden',
          aspectRatio: '3/4',
          boxShadow: hovered
            ? '0 24px 60px rgba(0,0,0,0.2)'
            : '0 8px 24px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.4s',
          cursor: 'pointer',
        }}
      >
        <img
          src={imgSrc}
          alt={cat.name}
          onError={e => { e.target.src = fallbacks[idx % 3]; }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.25,0.1,0.25,1)',
            display: 'block',
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(17,17,17,0.88) 0%, rgba(17,17,17,0.3) 50%, transparent 100%)'
            : 'linear-gradient(to top, rgba(17,17,17,0.75) 0%, rgba(17,17,17,0.15) 60%, transparent 100%)',
          transition: 'background 0.4s',
        }} />

        {/* Red top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3, background: tokens.red,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.4s cubic-bezier(0.25,0.1,0.25,1)',
        }} />

        {/* Content */}
        <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: 9, letterSpacing: '0.3em',
            textTransform: 'uppercase', fontWeight: 600,
            color: tokens.gold, display: 'block', marginBottom: 8,
          }}>
            Collection {String(idx + 1).padStart(2, '0')}
          </span>
          <h3 style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: 24, fontWeight: 700,
            color: '#fff', letterSpacing: '-0.01em',
            lineHeight: 1.2, marginBottom: 8,
          }}>
            {cat.name}
          </h3>
          {cat.description && (
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6, marginBottom: 16,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {cat.description}
            </p>
          )}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: hovered ? tokens.gold : 'rgba(255,255,255,0.7)',
            transition: 'color 0.3s',
          }}>
            View Collections <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </Link>
  );
};

/** Product card — magazine editorial */
const ProductCard = ({ prod }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: tokens.surface, borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${hovered ? tokens.border : 'transparent'}`,
        boxShadow: hovered
          ? '0 20px 56px rgba(0,0,0,0.1)'
          : '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'all 0.35s cubic-bezier(0.25,0.1,0.25,1)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: tokens.stone }}>
        <img
          src={getImageUrl(prod.thumbnail)}
          alt={prod.title}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800'; }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.25,0.1,0.25,1)',
            display: 'block',
          }}
        />
        {/* Material badge */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          padding: '5px 12px', borderRadius: 8,
          fontSize: 9, letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600,
          color: tokens.text,
        }}>
          {prod.material?.split(',')[0]}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{
          fontSize: 9, letterSpacing: '0.3em',
          textTransform: 'uppercase', fontWeight: 600,
          color: tokens.red, display: 'block', marginBottom: 8,
        }}>
          {prod.collection?.name || 'Luxury Collection'}
        </span>
        <h3 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: 20, fontWeight: 700,
          color: tokens.text, letterSpacing: '-0.01em',
          lineHeight: 1.2, marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {prod.title}
        </h3>
        <p style={{
          fontSize: 13, color: tokens.muted,
          lineHeight: 1.65, marginBottom: 'auto',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {prod.description}
        </p>

        {/* Footer row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 20, marginTop: 20,
          borderTop: `1px solid ${tokens.border}`,
        }}>
          <span style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: 22, fontWeight: 700, color: tokens.text,
          }}>
            €{parseFloat(prod.price).toLocaleString('de-DE')}.00
          </span>
          <Link
            to={`/categories/${prod.category?.slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: tokens.red, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = tokens.redDeep}
            onMouseLeave={e => e.currentTarget.style.color = tokens.red}
          >
            Enquire <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

/** Testimonial card — luxury quote layout */
const TestimonialCard = ({ t, small }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: tokens.surface, borderRadius: 20,
        padding: small ? '24px 20px' : '36px 32px',
        border: `1px solid ${hovered ? 'rgba(193,18,31,0.2)' : tokens.border}`,
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.35s cubic-bezier(0.25,0.1,0.25,1)',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        height: '100%',
      }}
    >
      {/* Giant quote mark */}
      <div style={{
        position: 'absolute', top: small ? 12 : 20, right: small ? 16 : 24,
        fontFamily: 'Playfair Display, Georgia, serif',
        fontSize: small ? 50 : 80, lineHeight: 1, color: tokens.border,
        userSelect: 'none', fontWeight: 700,
        transition: 'color 0.3s',
        color: hovered ? 'rgba(193,18,31,0.12)' : tokens.border,
      }}>
        "
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 4, marginBottom: small ? 12 : 20 }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i} size={small ? 11 : 13}
            color={i < t.rating ? tokens.gold : tokens.border}
            fill={i < t.rating ? tokens.gold : 'none'}
          />
        ))}
      </div>

      <p style={{
        fontSize: small ? 13 : 15, color: '#444', lineHeight: 1.75,
        fontStyle: 'italic', flex: 1,
        marginBottom: small ? 20 : 28,
        fontFamily: 'Georgia, serif',
      }}>
        "{t.content}"
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: small ? 10 : 14,
        paddingTop: small ? 16 : 20, borderTop: `1px solid ${tokens.border}`,
      }}>
        {/* Monogram avatar */}
        <div style={{
          width: small ? 36 : 44, height: small ? 36 : 44, borderRadius: '50%',
          background: `linear-gradient(135deg, ${tokens.red}, ${tokens.redDeep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: small ? 14 : 16,
          fontFamily: 'Playfair Display, Georgia, serif',
          flexShrink: 0,
        }}>
          {t.clientName?.[0] || 'C'}
        </div>
        <div>
          <p style={{ fontSize: small ? 12 : 14, fontWeight: 700, color: tokens.text, marginBottom: 2 }}>
            {t.clientName}
          </p>
          <p style={{ fontSize: small ? 9 : 10, color: tokens.red, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
            {t.clientTitle}
          </p>
        </div>
      </div>
    </div>
  );
};

/** Project carousel */
const CarouselBlock = ({ slides, currentSlide, onPrev, onNext, onDot }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        aspectRatio: '16/10', background: tokens.stone,
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
      }}
    >
      {slides.length > 0 ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75 }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,0.75) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 28px' }}>
                <span style={{ fontSize: 9, letterSpacing: '0.3em', color: tokens.gold, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  {slides[currentSlide].subtitle}
                </span>
                <h4 style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 22, fontWeight: 700, color: '#fff',
                  lineHeight: 1.2, marginBottom: 4,
                }}>
                  {slides[currentSlide].title}
                </h4>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {slides[currentSlide].location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <>
              {/* Nav arrows */}
              {[{ fn: onPrev, icon: <ChevronLeft size={16} />, side: 'left' },
              { fn: onNext, icon: <ChevronRight size={16} />, side: 'right' }].map(({ fn, icon, side }) => (
                <CarouselArrow key={side} onClick={fn} side={side} visible={hovered}>
                  {icon}
                </CarouselArrow>
              ))}

              {/* Dot indicators */}
              <div style={{
                position: 'absolute', bottom: 24, right: 24,
                display: 'flex', gap: 6, zIndex: 10,
              }}>
                {slides.map((_, i) => (
                  <button
                    key={i} type="button" onClick={() => onDot(i)}
                    style={{
                      height: 4, borderRadius: 2,
                      width: i === currentSlide ? 24 : 6,
                      background: i === currentSlide ? tokens.red : 'rgba(255,255,255,0.4)',
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: tokens.muted }}>Design Gallery</span>
        </div>
      )}
    </div>
  );
};

const CarouselArrow = ({ children, onClick, side, visible }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        [side]: 16,
        top: '50%', transform: 'translateY(-50%)',
        width: 40, height: 40, borderRadius: '50%',
        background: hovered ? tokens.red : 'rgba(255,255,255,0.9)',
        color: hovered ? '#fff' : tokens.text,
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s',
        zIndex: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}
    >
      {children}
    </button>
  );
};

/** Consultation form card */
const ConsultationForm = ({ onSubmit, loading, status }) => (
  <div style={{
    background: tokens.stone,
    border: `1px solid ${tokens.border}`,
    borderRadius: 24, padding: 'clamp(28px, 4vw, 44px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
    position: 'sticky', top: 100,
  }}>
    <div style={{ marginBottom: 32 }}>
      <Eyebrow>Private Consultation</Eyebrow>
      <h3 style={{
        fontFamily: 'Playfair Display, Georgia, serif',
        fontSize: 28, fontWeight: 700, color: tokens.text,
        lineHeight: 1.2, marginTop: 12, marginBottom: 0,
      }}>
        Request a Design Review
      </h3>
      <Divider align="left" />
    </div>

    {/* Status messages */}
    {status === 'success' && (
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        color: '#15803d', borderRadius: 12,
        padding: '12px 16px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13,
      }}>
        <CheckCircle size={15} />
        Enquiry submitted. A design partner will reach out within 24 hours.
      </div>
    )}
    {status === 'error' && (
      <div style={{
        background: '#fff1f2', border: '1px solid #fecdd3',
        color: '#be123c', borderRadius: 12,
        padding: '12px 16px', marginBottom: 24, fontSize: 13,
      }}>
        Submission failed. Please check your connection and try again.
      </div>
    )}

    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[
        { label: 'Full Name', name: 'name', type: 'text', ph: 'Dr. Andreas Fischer', req: true },
        { label: 'Email Address', name: 'email', type: 'email', ph: 'andreas@fischer-partners.de', req: true },
        { label: 'Contact Number', name: 'phone', type: 'tel', ph: '+49 89 2019382', req: true },
      ].map(({ label, name, type, ph, req }) => (
        <div key={name}>
          <FormLabel>{label}</FormLabel>
          <input
            type={type} name={name} required={req} placeholder={ph}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = tokens.red; e.target.style.boxShadow = `0 0 0 3px rgba(193,18,31,0.08)`; }}
            onBlur={e => { e.target.style.borderColor = tokens.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      ))}

      <div>
        <FormLabel>Design Intent & Requirements</FormLabel>
        <textarea
          name="message" required rows={4}
          placeholder="Describe your space dimensions, preferred materials, or project timeline…"
          style={{ ...inputStyle, resize: 'none' }}
          onFocus={e => { e.target.style.borderColor = tokens.red; e.target.style.boxShadow = `0 0 0 3px rgba(193,18,31,0.08)`; }}
          onBlur={e => { e.target.style.borderColor = tokens.border; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      <SubmitButton loading={loading} />
    </form>
  </div>
);

const FormLabel = ({ children }) => (
  <label style={{
    display: 'block',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: tokens.sub,
    marginBottom: 8,
  }}>
    {children}
  </label>
);

const inputStyle = {
  width: '100%', display: 'block',
  padding: '13px 16px', borderRadius: 12,
  border: `1px solid ${tokens.border}`,
  background: tokens.surface,
  fontSize: 14, color: tokens.text,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const SubmitButton = ({ loading }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit" disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '15px 24px',
        background: loading ? '#ccc' : hovered ? tokens.redDeep : tokens.red,
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: hovered && !loading ? '0 8px 24px rgba(193,18,31,0.3)' : 'none',
        transform: hovered && !loading ? 'translateY(-2px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.25,0.1,0.25,1)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {loading
        ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        : 'Submit Private Request'
      }
    </button>
  );
};

export default Home;
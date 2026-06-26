import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const resolveUrl = (path) => getImageUrl(path);

const fallbacks = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
];

/* ─────────────────────────────────────────────
   SCROLL-REVEAL HOOK
───────────────────────────────────────────── */
function useReveal(threshold = 0.08) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const GallerySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-[#F2EFEA] aspect-[4/3]"
        style={{ borderRadius: '2px' }}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   GALLERY ITEM
───────────────────────────────────────────── */
const GalleryItem = ({ item, idx, onClick, className = '' }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden bg-[#F2EFEA] cursor-pointer ${className}`}
      style={{
        borderRadius: '2px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.55s cubic-bezier(.4,0,.2,1) ${(idx % 8) * 60}ms, transform 0.55s cubic-bezier(.4,0,.2,1) ${(idx % 8) * 60}ms`,
      }}
      onClick={() => onClick(item, idx)}
    >
      <img
        src={resolveUrl(item.filePath)}
        alt={item.title}
        className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
        onError={(e) => { e.target.src = fallbacks[idx % fallbacks.length]; }}
        loading="lazy"
      />

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.1) 55%, transparent 100%)',
        }}
      >
        {/* Top: zoom icon */}
        <div className="flex justify-end">
          <div
            className="w-8 h-8 bg-white flex items-center justify-center translate-y-[-4px] group-hover:translate-y-0 transition-transform duration-300"
            style={{ borderRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <ZoomIn size={13} className="text-[#333333]" />
          </div>
        </div>

        {/* Bottom: meta */}
        <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {item.category?.name && (
            <span className="text-[9px] tracking-[0.2em] text-[#C1121F] uppercase font-semibold block mb-1">
              {item.category.name}
            </span>
          )}
          <h4
            className="text-white text-sm font-bold uppercase tracking-wide leading-snug"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            {item.title}
          </h4>
          {item.description && (
            <p className="text-white/55 text-xs mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────── */
const Lightbox = ({ item, index, total, onClose, onPrev, onNext }) => {
  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      {/* Inner container — stops propagation */}
      <div
        className="relative w-full max-w-5xl mx-auto px-6 flex flex-col"
        style={{ maxHeight: '95vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 shrink-0">
          <div className="flex items-center gap-3">
            {item.category?.name && (
              <span className="text-[9px] tracking-[0.22em] text-[#C1121F] uppercase font-semibold">
                {item.category.name}
              </span>
            )}
            <span className="text-[9px] tracking-widest text-white/25 font-mono">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close lightbox"
            className="w-9 h-9 border border-white/15 hover:border-[#C1121F] flex items-center justify-center text-white/60 hover:text-[#C1121F] transition-all duration-200"
            style={{ borderRadius: '2px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Image */}
        <div className="relative flex items-center justify-center flex-1 overflow-hidden">
          {/* Prev */}
          <button
            onClick={onPrev}
            aria-label="Previous image"
            className="absolute left-0 z-10 w-10 h-10 border border-white/15 hover:border-white/40 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 -translate-x-2"
            style={{ borderRadius: '2px' }}
          >
            <ChevronLeft size={18} />
          </button>

          <img
            src={resolveUrl(item.filePath)}
            alt={item.title}
            className="max-w-full max-h-[72vh] object-contain"
            style={{ borderRadius: '2px' }}
            onError={(e) => { e.target.src = fallbacks[0]; }}
          />

          {/* Next */}
          <button
            onClick={onNext}
            aria-label="Next image"
            className="absolute right-0 z-10 w-10 h-10 border border-white/15 hover:border-white/40 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 translate-x-2"
            style={{ borderRadius: '2px' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Bottom meta */}
        <div className="py-5 border-t border-white/8 shrink-0 flex items-end justify-between gap-4">
          <div>
            <h3
              className="text-white text-base font-bold uppercase tracking-wider"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {item.title}
            </h3>
            {item.description && (
              <p className="text-white/40 text-xs mt-1 max-w-lg leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          {/* Dot nav */}
          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: Math.min(total, 10) }).map((_, i) => (
              <div
                key={i}
                className="transition-all duration-300"
                style={{
                  width: i === index % 10 ? '16px' : '4px',
                  height: '2px',
                  background: i === index % 10 ? '#C1121F' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    API.get('/gallery')
      .then((res) => { if (res.data.success) setGallery(res.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const categories = ['All', ...Array.from(new Set(gallery.map((g) => g.category?.name).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? gallery : gallery.filter((g) => g.category?.name === activeFilter);

  const openLightbox = useCallback((item, idx) => {
    const globalIdx = filtered.findIndex((f) => f.id === item.id);
    setLightboxIndex(globalIdx !== -1 ? globalIdx : idx);
  }, [filtered]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length), [filtered.length]);
  const nextImage = useCallback(() => setLightboxIndex((i) => (i + 1) % filtered.length), [filtered.length]);

  const [heroRef, heroVisible] = useReveal(0.01);

  return (
    <div className="flex-grow bg-[#FAFAFA]">
      <style>{`
        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
          .gallery-hero-grid {
            min-height: auto !important;
            padding-top: 88px; /* navbar offset */
          }
          .gallery-hero-content {
            padding-top: 40px !important;
            padding-bottom: 40px !important;
          }
          .gallery-hero-title {
            font-size: 44px !important;
            line-height: 1.1 !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO — editorial split, not stock overlay
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="gallery-hero-grid grid grid-cols-1 lg:grid-cols-2 min-h-[48vh]">

            {/* Left: text */}
            <div
              ref={heroRef}
              className="gallery-hero-content flex flex-col justify-end py-20 lg:py-28 pr-0 lg:pr-16"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.65s cubic-bezier(.4,0,.2,1), transform 0.65s cubic-bezier(.4,0,.2,1)',
              }}
            >
              <p className="text-[9px] tracking-[0.3em] text-[#C1121F] uppercase font-semibold mb-4">
                Inspiration Grid
              </p>
              <h1
                className="gallery-hero-title text-5xl md:text-6xl lg:text-7xl font-bold text-[#111111] uppercase leading-none tracking-wide"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Studio
                <br />
                <span className="text-[#C1121F]">Gallery</span>
              </h1>
              <div className="mt-6 flex items-start gap-4">
                <div className="w-12 h-px bg-[#C1121F] mt-2.5 shrink-0" />
                <p className="text-sm text-[#666666] leading-relaxed max-w-sm">
                  A close-up look at signature reveals, soft lighting details,
                  and custom hardware across completed projects.
                </p>
              </div>

              {/* Count tag */}
              {!loading && (
                <div className="mt-8 inline-flex items-center gap-3">
                  <span
                    className="text-2xl font-bold text-[#111111]"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    {gallery.length}
                  </span>
                  <span className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">
                    Works Documented
                  </span>
                </div>
              )}
            </div>

            {/* Right: image collage strip */}
            <div className="hidden lg:grid grid-cols-2 gap-3 py-10 overflow-hidden">
              {(gallery.slice(0, 4).length ? gallery.slice(0, 4) : Array(4).fill(null)).map((item, i) => (
                <div
                  key={i}
                  className="overflow-hidden bg-[#F2EFEA]"
                  style={{
                    borderRadius: '2px',
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'scale(1)' : 'scale(0.97)',
                    transition: `opacity 0.7s cubic-bezier(.4,0,.2,1) ${100 + i * 80}ms, transform 0.7s cubic-bezier(.4,0,.2,1) ${100 + i * 80}ms`,
                  }}
                >
                  {item ? (
                    <img
                      src={resolveUrl(item.filePath)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      style={{ minHeight: '140px' }}
                      onError={(e) => { e.target.src = fallbacks[i]; }}
                    />
                  ) : (
                    <div className="w-full h-full min-h-[140px] bg-[#EDE7DD] animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FILTER BAR
      ══════════════════════════════════════════ */}
      {categories.length > 1 && (
        <div
          className="sticky z-20 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]"
          style={{ top: '64px' }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className="relative px-6 py-4 text-[10px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-200 shrink-0"
                  style={{
                    color: activeFilter === cat ? '#C1121F' : '#888888',
                    borderBottom: activeFilter === cat ? '2px solid #C1121F' : '2px solid transparent',
                  }}
                >
                  {cat}
                  {activeFilter !== cat && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#E5E5E5] scale-x-0 hover:scale-x-100 transition-transform duration-200 origin-left" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          GALLERY GRID
      ══════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">

          {loading ? (
            <GallerySkeleton />
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-28 border border-dashed border-[#E5E5E5] bg-white"
              style={{ borderRadius: '2px' }}
            >
              <p className="text-xs text-[#AAAAAA] uppercase tracking-widest">
                No gallery items in this category
              </p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 lg:gap-4">
              {filtered.map((item, idx) => (
                <GalleryItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  onClick={openLightbox}
                  className="break-inside-avoid mb-3 lg:mb-4"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM EDITORIAL STRIP
      ══════════════════════════════════════════ */}
      <div className="border-t border-[#E5E5E5] py-8 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">
            Klare Homes Munich · Interior Atelier
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">Original Photography</span>
            <div className="w-px h-4 bg-[#E5E5E5]" />
            <span className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">Completed Projects</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════ */}
      {lightboxIndex !== null && (
        <Lightbox
          item={filtered[lightboxIndex]}
          index={lightboxIndex}
          total={filtered.length}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
};

export default Gallery;
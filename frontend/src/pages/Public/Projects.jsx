import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { MapPin, Calendar, Layers, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';

/** Resolves a media filePath into a full URL, falling back to a placeholder. */
const getMediaUrl = (filePath) => {
  return getImageUrl(filePath, FALLBACK_PROJECT_IMAGE);
};

/**
 * Reveals its content with a quiet rise-and-fade once it enters the viewport.
 * Respects prefers-reduced-motion and only fires once per element.
 */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

const MetaBadge = ({ icon: Icon, children }) => (
  <span className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 bg-[#FAFAFA] border border-[#E5E5E5] text-[11px] sm:text-xs text-[#666666] rounded-lg whitespace-nowrap">
    <Icon size={11} className="text-[#C1121F] shrink-0" aria-hidden="true" />
    {children}
  </span>
);

/** Four corner brackets that draw into focus on hover — a quiet nod to architectural drawings. */
const BlueprintCorners = () => (
  <div
    aria-hidden="true"
    className="absolute inset-3 sm:inset-5 pointer-events-none opacity-60 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500"
  >
    {[
      'top-0 left-0 border-t-2 border-l-2',
      'top-0 right-0 border-t-2 border-r-2',
      'bottom-0 left-0 border-b-2 border-l-2',
      'bottom-0 right-0 border-b-2 border-r-2',
    ].map((pos) => (
      <span
        key={pos}
        className={`absolute w-4 h-4 sm:w-5 sm:h-5 border-white/80 ${pos}`}
      />
    ))}
  </div>
);

const ProjectCard = ({ project, index, onOpenGallery }) => {
  const [revealRef, visible] = useReveal();
  const primaryImage = project.media?.find((m) => m.isPrimary) || project.media?.[0];
  const isEven = index % 2 === 0;
  const displayNumber = String(index + 1).padStart(2, '0');
  const completionLabel = project.completionDate
    ? new Date(project.completionDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    : null;

  return (
    <article
      ref={revealRef}
      className={`relative grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.08)] bg-white group transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden h-64 sm:h-80 lg:h-[560px] bg-[#F2EFEA] ${
          isEven ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        <img
          src={primaryImage ? getMediaUrl(primaryImage.filePath) : FALLBACK_PROJECT_IMAGE}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out lg:group-hover:scale-105"
          onError={(e) => { e.target.src = FALLBACK_PROJECT_IMAGE; }}
        />

        <BlueprintCorners />

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#C1121F] text-white text-xs font-bold px-3 py-1.5 tracking-widest rounded-lg shadow-md">
          {displayNumber}
        </div>

        {project.media && project.media.length > 0 && (
          <button
            onClick={() => onOpenGallery(project.media)}
            aria-label={`Open gallery for ${project.title}, ${project.media.length} images`}
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm active:bg-[#C1121F] lg:hover:bg-[#C1121F] text-[#111111] active:text-white lg:hover:text-white flex items-center justify-center transition-all duration-300 rounded-full shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C1121F]"
          >
            <Eye size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Content */}
      <div
        className={`relative flex flex-col justify-center p-7 sm:p-10 lg:p-14 overflow-hidden ${
          isEven ? 'lg:order-2' : 'lg:order-1'
        }`}
      >
        {/* Editorial watermark numeral — the card's signature detail */}
        <span
          aria-hidden="true"
          className="absolute -top-3 right-4 sm:-top-6 sm:right-6 text-[72px] sm:text-[120px] font-bold text-[#F2EFEA] leading-none select-none pointer-events-none"
          style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
        >
          {displayNumber}
        </span>

        <div className="relative flex flex-wrap gap-2 mb-5 sm:mb-6">
          {project.location && <MetaBadge icon={MapPin}>{project.location}</MetaBadge>}
          {completionLabel && <MetaBadge icon={Calendar}>{completionLabel}</MetaBadge>}
          {project.projectType && <MetaBadge icon={Layers}>{project.projectType}</MetaBadge>}
        </div>

        <h2
          className="relative text-xl sm:text-2xl md:text-3xl font-bold text-[#111111] tracking-tight mb-3 sm:mb-4"
          style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
        >
          {project.title}
        </h2>
        <span aria-hidden="true" className="relative block w-10 h-[3px] bg-[#C1121F] rounded-full mb-4 sm:mb-5" />
        <p className="relative text-sm text-[#666666] leading-relaxed mb-7 sm:mb-8">{project.description}</p>

        <div className="relative border-t border-[#F0F0F0] pt-5 sm:pt-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#AAAAAA] mb-1">Client</p>
            <p className="text-sm font-semibold text-[#333333]">{project.clientName || 'Private Client'}</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#9B7A33] border border-[#D4AF37]/40 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 text-right shrink-0">
            Completed
          </span>
        </div>
      </div>
    </article>
  );
};

const ProjectLightbox = ({ media, index, onClose, onPrev, onNext, onSelect }) => {
  const closeBtnRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && media.length > 1) onPrev();
      if (e.key === 'ArrowRight' && media.length > 1) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [media.length, onClose, onNext, onPrev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || media.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 40;
    if (delta > SWIPE_THRESHOLD) onPrev();
    else if (delta < -SWIPE_THRESHOLD) onNext();
    touchStartX.current = null;
  };

  const current = media[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Project gallery"
      className="fixed inset-0 z-50 bg-[#111111]/95 backdrop-blur-md flex flex-col animate-fadeIn"
      onClick={onClose}
    >
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-[#999999] uppercase tracking-[0.2em]">
          {index + 1} / {media.length}
        </p>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close gallery"
          className="w-11 h-11 sm:w-10 sm:h-10 border border-white/20 hover:border-[#C1121F] hover:bg-[#C1121F]/10 flex items-center justify-center text-white hover:text-[#E63946] transition-all duration-300 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E63946]"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-3 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={getMediaUrl(current?.filePath)}
          alt={current?.caption || 'Project detail view'}
          className="max-w-full max-h-full object-contain shadow-2xl rounded-xl select-none"
          draggable={false}
        />
        {media.length > 1 && (
          <>
            <button
              onClick={onPrev}
              aria-label="Previous image"
              className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 border border-white/20 hover:border-[#C1121F] bg-[#111111]/60 flex items-center justify-center text-white hover:text-[#E63946] transition-all duration-300 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E63946]"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={onNext}
              aria-label="Next image"
              className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 border border-white/20 hover:border-[#C1121F] bg-[#111111]/60 flex items-center justify-center text-white hover:text-[#E63946] transition-all duration-300 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E63946]"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <p className="sm:hidden absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/50 uppercase tracking-widest">
          Swipe to browse
        </p>
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 px-4 sm:px-6 pb-5 sm:pb-6 overflow-x-auto justify-center" onClick={(e) => e.stopPropagation()}>
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelect(i)}
              aria-label={`View image ${i + 1} of ${media.length}`}
              aria-current={i === index}
              className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 border-2 overflow-hidden transition-all duration-300 rounded-lg ${
                i === index ? 'border-[#C1121F]' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={getMediaUrl(m.filePath)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [lightbox, setLightbox] = useState({ open: false, media: [], idx: 0 });

  useEffect(() => {
    let isMounted = true;
    API.get('/projects')
      .then((res) => {
        if (!isMounted) return;
        if (res.data.success) {
          setProjects(res.data.data);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setStatus('error');
      });
    return () => { isMounted = false; };
  }, []);

  const openLightbox = (media, idx = 0) => setLightbox({ open: true, media, idx });
  const closeLightbox = () => setLightbox({ open: false, media: [], idx: 0 });
  const prevSlide = () => setLightbox((l) => ({ ...l, idx: (l.idx - 1 + l.media.length) % l.media.length }));
  const nextSlide = () => setLightbox((l) => ({ ...l, idx: (l.idx + 1) % l.media.length }));
  const selectSlide = (idx) => setLightbox((l) => ({ ...l, idx }));

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" role="status" aria-live="polite">
        <div className="spinner" />
        <span className="sr-only">Loading projects…</span>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#FAFAFA]">
      {/* HERO */}
      <section className="relative h-[42vh] sm:h-[50vh] min-h-[300px] sm:min-h-[360px] flex items-end overflow-hidden pt-20 sm:pt-0">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1800"
            alt=""
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.45) 55%, rgba(17,17,17,0.15) 100%)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-6 pb-10 sm:pb-16 w-full">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-5 h-0.5 bg-[#C1121F]" />
            <span className="section-label !text-[#E63946]">Portfolio</span>
          </div>
          <h1
            className="text-[40px] leading-[1.1] sm:text-5xl md:text-7xl font-bold text-white sm:leading-tight"
            style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
          >
            Completed Work
          </h1>
        </div>
      </section>

      {/* PROJECTS LIST */}
      <section className="py-10 sm:py-20 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-6">
          {status === 'error' && (
            <div className="text-center py-20 sm:py-28 bg-white border border-[#E5E5E5] rounded-2xl">
              <p className="text-sm text-[#888888] uppercase tracking-widest">
                We couldn't load the portfolio right now. Please try again shortly.
              </p>
            </div>
          )}

          {status === 'ready' && projects.length === 0 && (
            <div className="text-center py-20 sm:py-28 bg-white border border-[#E5E5E5] rounded-2xl">
              <p className="text-sm text-[#888888] uppercase tracking-widest">
                No completed projects currently available
              </p>
            </div>
          )}

          {status === 'ready' && projects.length > 0 && (
            <div className="space-y-10 sm:space-y-16">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onOpenGallery={(media) => openLightbox(media, 0)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox.open && lightbox.media.length > 0 && (
        <ProjectLightbox
          media={lightbox.media}
          index={lightbox.idx}
          onClose={closeLightbox}
          onPrev={prevSlide}
          onNext={nextSlide}
          onSelect={selectSlide}
        />
      )}
    </div>
  );
};

export default Projects;
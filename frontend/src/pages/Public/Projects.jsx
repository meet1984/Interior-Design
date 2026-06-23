import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { MapPin, Calendar, Layers, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, media: [], idx: 0 });

  useEffect(() => {
    API.get('/projects').then(res => {
      if (res.data.success) setProjects(res.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const openLightbox = (media, idx = 0) => setLightbox({ open: true, media, idx });
  const closeLightbox = () => setLightbox({ open: false, media: [], idx: 0 });
  const prevSlide = () => setLightbox(l => ({ ...l, idx: (l.idx - 1 + l.media.length) % l.media.length }));
  const nextSlide = () => setLightbox(l => ({ ...l, idx: (l.idx + 1) % l.media.length }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
        <div className="w-10 h-10 border-2 border-[#C8A97E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#F5F4F0]">
      {/* ── HERO ── */}
      <section className="relative h-[42vh] min-h-[300px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1800" alt="Projects" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.96) 0%, rgba(10,15,30,0.3) 70%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-14 w-full">
          <span className="section-label mb-3 block">Portfolio</span>
          <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Completed Work</h1>
        </div>
      </section>

      {/* ── PROJECTS LIST ── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          {projects.length === 0 ? (
            <div className="text-center py-24 bg-white border border-stone-100">
              <p className="text-sm text-stone-400 uppercase tracking-widest" style={{ fontFamily: 'Outfit, sans-serif' }}>No completed projects currently available</p>
            </div>
          ) : (
            <div className="space-y-20">
              {projects.map((proj, projIdx) => {
                const primaryImg = proj.media?.find(m => m.isPrimary) || proj.media?.[0];
                const isEven = projIdx % 2 === 0;
                const num = String(projIdx + 1).padStart(2, '0');

                return (
                  <div key={proj.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-[0_8px_40px_rgba(0,0,0,0.08)] group ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                    {/* Image */}
                    <div className={`relative overflow-hidden h-72 lg:h-[480px] bg-stone-100 img-zoom ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      <img
                        src={primaryImg ? `${import.meta.env.VITE_API_URL}${primaryImg.filePath}` : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'; }}
                      />
                      {/* Project number overlay */}
                      <div className="absolute top-6 left-6 bg-[#C8A97E] text-white text-xs font-bold px-3 py-1.5 tracking-widest" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {num}
                      </div>
                      {/* Gallery button */}
                      {proj.media && proj.media.length > 0 && (
                        <button
                          onClick={() => openLightbox(proj.media)}
                          className="absolute bottom-6 right-6 bg-stone-950/90 backdrop-blur-sm hover:bg-[#C8A97E] text-white text-[10px] tracking-widest uppercase font-semibold px-4 py-2.5 flex items-center gap-2 transition-all duration-200"
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          View Gallery ({proj.media.length})
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`bg-white flex flex-col justify-center p-10 lg:p-14 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      {/* Meta badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {proj.location && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 text-xs text-stone-500 font-sans">
                            <MapPin size={11} className="text-[#C8A97E]" />{proj.location}
                          </span>
                        )}
                        {proj.completionDate && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 text-xs text-stone-500 font-sans">
                            <Calendar size={11} className="text-[#C8A97E]" />
                            {new Date(proj.completionDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                          </span>
                        )}
                        {proj.projectType && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 text-xs text-stone-500 font-sans">
                            <Layers size={11} className="text-[#C8A97E]" />{proj.projectType}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl md:text-3xl font-light text-stone-900 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {proj.title}
                      </h2>
                      <p className="text-sm text-stone-500 font-sans leading-relaxed mb-8">{proj.description}</p>

                      <div className="border-t border-stone-100 pt-6 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-1">Client</p>
                          <p className="text-sm font-semibold text-stone-700">{proj.clientName || 'Private Client'}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#C8A97E] border border-[#C8A97E]/30 px-3 py-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Signature Execution
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {lightbox.open && lightbox.media.length > 0 && (
        <div className="fixed inset-0 z-50 bg-stone-950/97 backdrop-blur-md flex flex-col animate-fadeIn">
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-sans">{lightbox.idx + 1} / {lightbox.media.length}</p>
            </div>
            <button onClick={closeLightbox}
              className="w-10 h-10 border border-white/10 hover:border-[#C8A97E] flex items-center justify-center text-white hover:text-[#C8A97E] transition-all"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <img
              src={`${import.meta.env.VITE_API_URL}${lightbox.media[lightbox.idx].filePath}`}
              alt="Project detail"
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
            {lightbox.media.length > 1 && (
              <>
                <button onClick={prevSlide}
                  className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/10 hover:border-[#C8A97E] bg-stone-950/60 flex items-center justify-center text-white hover:text-[#C8A97E] transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextSlide}
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/10 hover:border-[#C8A97E] bg-stone-950/60 flex items-center justify-center text-white hover:text-[#C8A97E] transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnail strip */}
          {lightbox.media.length > 1 && (
            <div className="flex gap-2 px-6 pb-6 overflow-x-auto justify-center">
              {lightbox.media.map((m, i) => (
                <button key={m.id} onClick={() => setLightbox(l => ({ ...l, idx: i }))}
                  className={`shrink-0 w-14 h-14 border-2 overflow-hidden transition-all ${i === lightbox.idx ? 'border-[#C8A97E]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={`${import.meta.env.VITE_API_URL}${m.filePath}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Projects;

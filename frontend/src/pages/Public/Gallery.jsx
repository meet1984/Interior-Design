import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { X, ZoomIn } from 'lucide-react';

export const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    API.get('/gallery').then(res => {
      if (res.data.success) setGallery(res.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Derive categories for filter tabs
  const categories = ['All', ...Array.from(new Set(gallery.map(g => g.category?.name).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? gallery : gallery.filter(g => g.category?.name === activeFilter);

  const fallbacks = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
  ];

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
          <img src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=1800" alt="Gallery" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.2) 70%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-14 w-full">
          <span className="section-label mb-3 block">Inspiration Grid</span>
          <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Studio Gallery</h1>
          <p className="text-sm text-slate-400 font-sans mt-3 max-w-md">A close-up look at signature reveals, soft lighting details, and custom hardware.</p>
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      {categories.length > 1 && (
        <div className="sticky top-16 z-20 bg-white/90 backdrop-blur-md border-b border-stone-100">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center gap-0 overflow-x-auto">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveFilter(cat)}
                  className={`px-6 py-4 text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                    activeFilter === cat ? 'border-[#C8A97E] text-[#C8A97E]' : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GALLERY GRID ── */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-white border border-stone-100">
              <p className="text-sm text-stone-400 uppercase tracking-widest" style={{ fontFamily: 'Outfit, sans-serif' }}>No gallery items available</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
              {filtered.map((item, idx) => (
                <div key={item.id}
                  className="break-inside-avoid group relative overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => setLightboxImg(item)}
                >
                  <img
                    src={item.filePath.startsWith('/') ? `${import.meta.env.VITE_API_URL}${item.filePath}` : item.filePath}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = fallbacks[idx % fallbacks.length]; }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-[9px] tracking-widest text-[#C8A97E] uppercase font-semibold block mb-1">
                        {item.category?.name || 'Interior'}
                      </span>
                      <h4 className="text-white text-sm font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.title}</h4>
                      {item.description && (
                        <p className="text-slate-300 text-xs font-sans mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                  {/* Zoom icon */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn size={14} className="text-stone-700" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImg.filePath.startsWith('/') ? `${import.meta.env.VITE_API_URL}${lightboxImg.filePath}` : lightboxImg.filePath}
              alt={lightboxImg.title}
              className="w-full h-full object-contain max-h-[80vh] shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#C8A97E] uppercase tracking-widest font-semibold">{lightboxImg.category?.name}</p>
                <h3 className="text-white text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{lightboxImg.title}</h3>
              </div>
              <button onClick={() => setLightboxImg(null)}
                className="w-10 h-10 border border-white/20 hover:border-[#C8A97E] flex items-center justify-center text-white hover:text-[#C8A97E] transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Gallery;

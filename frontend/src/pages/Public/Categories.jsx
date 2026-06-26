import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { Heart, ArrowRight, ArrowLeft, MessageSquare, X, CheckCircle, Layers } from 'lucide-react';

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   SCROLL-REVEAL HOOK
───────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
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
   LOADING SKELETON
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-none overflow-hidden" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
    <div className="aspect-[3/4] bg-[#F2EFEA]" />
    <div className="p-6 space-y-3">
      <div className="h-2 w-16 bg-[#EDE7DD] rounded" />
      <div className="h-4 w-3/4 bg-[#EDE7DD] rounded" />
      <div className="h-3 w-full bg-[#F2EFEA] rounded" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   REVEAL WRAPPER
───────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s cubic-bezier(.4,0,.2,1) ${delay}ms, transform 0.65s cubic-bezier(.4,0,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────
   INQUIRY MODAL
───────────────────────────────────────────── */
const InquiryModal = ({ product, user, onClose, onSubmit, submitting, success }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/60 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl bg-white z-10 overflow-hidden flex flex-col md:flex-row"
        style={{
          borderRadius: '2px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
          animation: 'scaleIn 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Product preview sidebar */}
        <div className="hidden md:block md:w-2/5 relative bg-[#F8F6F3] overflow-hidden">
          <img
            src={getImageUrl(product.thumbnail)}
            alt={product.title}
            className="w-full h-full object-cover"
            style={{ minHeight: '360px' }}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-[9px] tracking-[0.2em] text-[#E6C77A] uppercase font-semibold mb-1">
              Selected Piece
            </p>
            <h4
              className="text-white text-sm font-bold uppercase tracking-wider leading-snug"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {product.title}
            </h4>
            {product.price && (
              <p className="text-white/60 text-xs mt-1">
                €{parseFloat(product.price).toLocaleString('de-DE')}.00
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-8 md:p-10">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#C1121F] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="mb-7">
            <p className="text-[9px] tracking-[0.25em] text-[#C1121F] uppercase font-semibold mb-1">
              Studio Enquiry
            </p>
            <h3
              className="text-xl font-bold text-[#111111] uppercase tracking-wide"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Quotation Request
            </h3>
            <p className="text-xs text-[#888888] mt-1 md:hidden">{product.title}</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={22} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-[#111111]">Request Submitted</p>
              <p className="text-xs text-[#666666] max-w-xs leading-relaxed">
                Your quotation request has been received. A designer will be in touch shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-widest text-[#888888] uppercase font-semibold mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={user ? `${user.firstName} ${user.lastName}` : ''}
                  placeholder="Dr. Andreas Fischer"
                  className="w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#BBBBBB] outline-none transition-all duration-200"
                  style={{ borderRadius: '2px' }}
                />
              </div>
              <div className="inquiry-form-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-[#888888] uppercase font-semibold mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={user ? user.email : ''}
                    placeholder="andreas@example.de"
                    className="w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#BBBBBB] outline-none transition-all duration-200"
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-[#888888] uppercase font-semibold mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={user ? user.phone : ''}
                    placeholder="+49 89 ···"
                    className="w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#BBBBBB] outline-none transition-all duration-200"
                    style={{ borderRadius: '2px' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-[#888888] uppercase font-semibold mb-1.5">
                  Notes & Requirements
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Sizing preferences, finish options, lead time, bespoke modifications…"
                  className="w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#BBBBBB] outline-none transition-all duration-200 resize-none"
                  style={{ borderRadius: '2px' }}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-[#E5E5E5] text-[#888888] hover:border-[#111111] hover:text-[#111111] text-[10px] uppercase tracking-widest font-semibold transition-all duration-200"
                  style={{ borderRadius: '2px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[10px] uppercase tracking-widest font-semibold disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  style={{ borderRadius: '2px' }}
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                      Sending
                    </>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const Categories = () => {
  const { categorySlug, collectionSlug } = useParams();
  const { user, token } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    const fetchRootData = async () => {
      setLoading(true);
      try {
        if (!categorySlug) {
          const res = await API.get('/categories');
          if (res.data.success) setCategories(res.data.data);
        } else if (categorySlug && !collectionSlug) {
          const res = await API.get(`/categories/${categorySlug}`);
          if (res.data.success) setCategory(res.data.data);
        } else if (categorySlug && collectionSlug) {
          const res = await API.get(`/collections/${collectionSlug}`);
          if (res.data.success) {
            setCollection(res.data.data);
            setProducts(res.data.data.products || []);
          }
        }
        if (token && user?.role === 'client') {
          const favsRes = await API.get('/favorites');
          if (favsRes.data.success) setFavorites(favsRes.data.data.map((f) => f.productId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRootData();
  }, [categorySlug, collectionSlug, token, user]);

  const handleFavoriteToggle = async (productId) => {
    if (!token) { alert('Please login to save favourite designs.'); return; }
    try {
      const res = await API.post('/favorites', { productId });
      if (res.data.success) {
        setFavorites(res.data.favorited
          ? [...favorites, productId]
          : favorites.filter((id) => id !== productId));
      }
    } catch (err) { console.error(err); }
  };

  const handleOpenInquiry = (product) => {
    setActiveProduct(product);
    setModalOpen(true);
    setInquirySuccess(false);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmittingInquiry(true);
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await API.post('/inquiries', {
        ...data,
        productId: activeProduct.id,
        subject: `Product Inquiry: ${activeProduct.title}`,
        inquiryType: 'product_inquiry',
      });
      if (res.data.success) {
        setInquirySuccess(true);
        const waMsg = `Hello Klare Homes Munich, I'm interested in the product "${activeProduct.title}". My name is ${data.name}. Notes: ${data.message}`;
        const cleanPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '919319919131';
        window.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
        setTimeout(() => setModalOpen(false), 2400);
      }
    } catch (err) { console.error(err); }
    finally { setSubmittingInquiry(false); }
  };

  const fallbackImages = [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
  ];

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-2 w-24 bg-[#EDE7DD] rounded mb-4 animate-pulse" />
          <div className="h-8 w-64 bg-[#EDE7DD] rounded mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     VIEW 3 — PRODUCTS
  ══════════════════════════════════════════ */
  if (categorySlug && collectionSlug && collection) {
    return (
      <div className="flex-1 pt-28 pb-24 bg-[#FAFAFA] page-padding">
        <style>{`
          @media (max-width: 768px) {
          .page-hero-title { font-size: 36px !important; }
          .page-padding { padding-top: 88px !important; }
          .mobile-grid-override {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        `}</style>
        <div className="max-w-7xl mx-auto px-6">

          {/* Breadcrumb */}
          <Link
            to={`/categories/${categorySlug}`}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#888888] hover:text-[#C1121F] uppercase font-semibold mb-12 transition-colors group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to collections
          </Link>

          {/* Collection header */}
          <Reveal>
            <div className="mb-14">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-2">
                    {collection.category?.name || 'Collection'}
                  </p>
                  <h1
                    className="page-hero-title text-4xl md:text-5xl font-bold text-[#111111] uppercase tracking-wide leading-none"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    {collection.name}
                  </h1>
                  {collection.description && (
                    <p className="text-sm text-[#666666] max-w-lg leading-relaxed mt-3">
                      {collection.description}
                    </p>
                  )}
                </div>
                <p className="text-xs text-[#AAAAAA] shrink-0">
                  <span className="font-semibold text-[#111111] text-base">{products.length}</span>
                  <span className="ml-1.5">pieces</span>
                </p>
              </div>
              {/* Architectural rule */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E5E5]" />
                <div className="w-1.5 h-1.5 bg-[#C1121F] rotate-45 shrink-0" />
              </div>
            </div>
          </Reveal>

          {/* Products grid */}
          {products.length === 0 ? (
            <div className="text-center py-28 border border-dashed border-[#E5E5E5]">
              <Layers size={28} className="text-[#DDDDDD] mx-auto mb-3" />
              <p className="text-xs text-[#AAAAAA] uppercase tracking-widest">
                No pieces currently in this collection
              </p>
            </div>
          ) : (
            <div className="mobile-grid-override grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {products.map((prod, idx) => {
                const isFav = favorites.includes(prod.id);
                return (
                  <Reveal key={prod.id} delay={idx * 80}>
                    <article className="group relative bg-white flex flex-col overflow-hidden h-full"
                      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderRadius: '2px' }}
                    >
                      {/* Favourite */}
                      {user?.role === 'client' && (
                        <button
                          onClick={() => handleFavoriteToggle(prod.id)}
                          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{ borderRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                        >
                          <Heart
                            size={14}
                            fill={isFav ? '#C1121F' : 'none'}
                            className={isFav ? 'text-[#C1121F]' : 'text-[#AAAAAA]'}
                          />
                        </button>
                      )}

                      {/* Image */}
                      <div className="relative overflow-hidden aspect-[4/3] bg-[#F2EFEA]">
                        <img
                          src={getImageUrl(prod.thumbnail)}
                          alt={prod.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        {/* Material tag */}
                        {prod.material && (
                          <div className="absolute bottom-0 left-0 m-4">
                            <span
                              className="text-[9px] tracking-widest text-white/90 uppercase font-semibold px-2.5 py-1 bg-[#111111]/60 backdrop-blur-sm"
                              style={{ borderRadius: '1px' }}
                            >
                              {prod.material.split(',')[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                          <h3
                            className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-[#111111] leading-snug line-clamp-1"
                            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                          >
                            {prod.title}
                          </h3>
                          {prod.dimensions && (
                            <span className="text-[9px] text-[#AAAAAA] shrink-0 mt-0.5">{prod.dimensions}</span>
                          )}
                        </div>
                        <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 flex-1">
                          {prod.description}
                        </p>

                        {/* Footer */}
                        <div className="mt-5 pt-5 border-t border-[#F0F0F0] flex items-center justify-between">
                          <div>
                            <span className="text-[9px] tracking-widest text-[#AAAAAA] uppercase font-semibold block mb-0.5">
                              Estimate
                            </span>
                            <span className="text-base font-bold text-[#111111]">
                              €{parseFloat(prod.price).toLocaleString('de-DE')}.00
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenInquiry(prod)}
                            className="flex items-center gap-2 text-[10px] text-white bg-[#C1121F] hover:bg-[#9B0F18] uppercase tracking-widest font-semibold px-4 py-2.5 transition-all duration-200 hover:-translate-y-px"
                            style={{ borderRadius: '2px' }}
                          >
                            <MessageSquare size={12} />
                            Request Quote
                          </button>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>

        {/* INQUIRY MODAL */}
        {modalOpen && (
          <InquiryModal
            product={activeProduct}
            user={user}
            onClose={() => setModalOpen(false)}
            onSubmit={handleInquirySubmit}
            submitting={submittingInquiry}
            success={inquirySuccess}
          />
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     VIEW 2 — COLLECTIONS
  ══════════════════════════════════════════ */
  if (categorySlug && category) {
    return (
      <div className="flex-1 pt-28 pb-24 bg-[#FAFAFA] page-padding">
        <style>{`
          @media (max-width: 768px) {
            .page-hero-title { font-size: 36px !important; }
            .page-padding { padding-top: 88px !important; }
            .mobile-grid-override {
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-6">

          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#888888] hover:text-[#C1121F] uppercase font-semibold mb-12 transition-colors group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            All Categories
          </Link>

          <Reveal>
            <div className="mb-14">
              <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-2">
                Interior Category
              </p>
              <h1
                className="page-hero-title text-4xl md:text-5xl font-bold text-[#111111] uppercase tracking-wide leading-none"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm text-[#666666] max-w-lg leading-relaxed mt-3">
                  {category.description}
                </p>
              )}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E5E5]" />
                <div className="w-1.5 h-1.5 bg-[#C1121F] rotate-45 shrink-0" />
              </div>
            </div>
          </Reveal>

          {!category.collections?.length ? (
            <div className="text-center py-28 border border-dashed border-[#E5E5E5]">
              <Layers size={28} className="text-[#DDDDDD] mx-auto mb-3" />
              <p className="text-xs text-[#AAAAAA] uppercase tracking-widest">
                No collections configured in this category
              </p>
            </div>
          ) : (
            <div className="mobile-grid-override grid grid-cols-2 gap-3 md:gap-6">
              {category.collections.map((col, idx) => (
                <Reveal key={col.id} delay={idx * 100}>
                  <Link
                    to={`/categories/${categorySlug}/collections/${col.slug}`}
                    className="group flex flex-col bg-white overflow-hidden h-full"
                    style={{
                      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                      borderRadius: '2px',
                      textDecoration: 'none',
                    }}
                  >
                    {/* Image */}
                    <div className="w-full aspect-[4/3] sm:aspect-video bg-[#F2EFEA] overflow-hidden relative shrink-0">
                      <img
                        src={getImageUrl(col.image) || 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=600'}
                        alt={col.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                      <div>
                        <p className="text-[8px] sm:text-[9px] tracking-[0.2em] text-[#C1121F] uppercase font-semibold mb-1 sm:mb-2 line-clamp-1">
                          Active Collection
                        </p>
                        <h3
                          className="text-xs sm:text-lg font-bold uppercase tracking-wider text-[#111111] leading-snug mb-1 sm:mb-3 line-clamp-2"
                          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                        >
                          {col.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-[#666666] leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {col.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 mt-4 sm:mt-6 text-[9px] sm:text-[10px] text-[#C1121F] uppercase tracking-widest font-semibold group-hover:gap-2 sm:group-hover:gap-3 transition-all duration-300">
                        <span>Explore</span>
                        <ArrowRight size={11} className="sm:w-[13px] sm:h-[13px]" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     VIEW 1 — CATEGORIES OVERVIEW
  ══════════════════════════════════════════ */
  return (
    <div className="flex-1 bg-[#FAFAFA]">
      <style>{`
        @media (max-width: 768px) {
          .page-hero-title { font-size: 36px !important; }
          .page-padding { padding-top: 88px !important; }
          .mobile-grid-override {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      {/* ── Page hero ── */}
      <div className="pt-32 pb-20 px-6 bg-white border-b border-[#E5E5E5] page-padding">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[9px] tracking-[0.3em] text-[#C1121F] uppercase font-semibold mb-4">
                Studio Showroom
              </p>
              <h1
                className="page-hero-title text-5xl md:text-6xl font-bold text-[#111111] uppercase leading-none tracking-wide"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Design
                <br />
                <span className="text-[#C1121F]">Catalogs</span>
              </h1>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-px bg-[#C1121F]" />
                <p className="text-sm text-[#666666] leading-relaxed">
                  Curated selections aligned with strict German interior standards.
                  <br className="hidden sm:block" />
                  Select a category to explore its collections.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Categories grid ── */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {categories.length === 0 ? (
            <div className="text-center py-28 border border-dashed border-[#E5E5E5]">
              <p className="text-xs text-[#AAAAAA] uppercase tracking-widest">No categories available</p>
            </div>
          ) : (
            <div className="mobile-grid-override grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {categories.map((cat, idx) => (
                <Reveal key={cat.id} delay={idx * 100}>
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="group relative block overflow-hidden aspect-[3/4]"
                    style={{ borderRadius: '2px', textDecoration: 'none' }}
                  >
                    {/* Image */}
                    <img
                      src={getImageUrl(cat.image) || fallbackImages[idx % fallbackImages.length]}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.target.src = fallbackImages[idx % fallbackImages.length]; }}
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent transition-opacity duration-300 group-hover:from-[#0A0A0A]/95" />

                    {/* Red left accent line */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#C1121F] origin-bottom transition-transform duration-500 scale-y-0 group-hover:scale-y-100"
                    />

                    {/* Content */}
                    <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-end">
                      {/* Index marker */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <span className="text-[9px] tracking-[0.2em] text-white/40 font-mono">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h3
                        className="text-lg sm:text-2xl md:text-3xl font-bold uppercase tracking-wider text-white leading-tight mb-1 sm:mb-3"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                      >
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-[10px] sm:text-xs text-white/60 leading-relaxed line-clamp-2 mb-3 sm:mb-5">
                          {cat.description}
                        </p>
                      )}

                      {/* CTA row */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/80 group-hover:text-white transition-colors line-clamp-1">
                          Explore Collections
                        </span>
                        <ArrowRight
                          size={13}
                          className="text-[#C1121F] group-hover:translate-x-1 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom editorial strip */}
      <Reveal>
        <div className="border-t border-[#E5E5E5] py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">
              Klare Homes Munich · Interior Atelier
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">Bespoke Consultation</span>
              <div className="w-px h-4 bg-[#E5E5E5]" />
              <span className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">German Craftsmanship</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default Categories;
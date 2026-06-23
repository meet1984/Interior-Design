import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Testimonials = () => {
  const { user } = useContext(AuthContext);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    API.get('/testimonials').then(res => {
      if (res.data.success) setTestimonials(res.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await API.post('/testimonials', {
        content: data.content, rating,
        clientName: data.clientName || undefined,
        clientTitle: data.clientTitle || undefined
      });
      if (res.data.success) { setSuccess(true); e.target.reset(); setRating(5); }
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
      <section className="relative h-[38vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1800" alt="Testimonials" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.96) 0%, rgba(10,15,30,0.3) 70%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-14 w-full">
          <span className="section-label mb-3 block">Client Reviews</span>
          <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Testimonials</h1>
        </div>
      </section>

      {/* ── REVIEWS GRID ── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          {testimonials.length === 0 ? (
            <div className="text-center py-24 bg-white border border-stone-100">
              <p className="text-sm text-stone-400 uppercase tracking-widest" style={{ fontFamily: 'Outfit, sans-serif' }}>No reviews yet — be the first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.id} className="card-elevated p-8 flex flex-col justify-between group relative overflow-hidden">
                  {/* Decorative quote mark */}
                  <div className="absolute -top-2 -left-2 text-[120px] font-serif text-[#C8A97E]/8 leading-none pointer-events-none select-none">
                    "
                  </div>

                  <div className="relative">
                    {/* Stars */}
                    <div className="flex gap-1 mb-5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={15} className={i <= t.rating ? 'text-[#C8A97E]' : 'text-stone-200'} fill={i <= t.rating ? '#C8A97E' : 'none'} />
                      ))}
                    </div>
                    <p className="text-stone-600 font-sans text-sm leading-relaxed italic mb-8">
                      "{t.content}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-5 border-t border-stone-100">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C8A97E] to-[#A8834A] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden ring-2 ring-[#C8A97E]/20">
                      {t.avatar ? (
                        <img src={t.avatar.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${t.avatar}` : t.avatar} alt="Client" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                      ) : null}
                      {!t.avatar ? `${t.clientName[0]}` : ''}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.clientName}</p>
                      <p className="text-[11px] text-[#C8A97E] uppercase tracking-wider font-medium">{t.clientTitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SUBMISSION FORM ── */}
      <section className="py-20 bg-white border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-3">Share Your Experience</span>
            <h2 className="section-title text-stone-900">Leave a Review</h2>
            <p className="text-sm text-stone-500 font-sans mt-3">All reviews are verified by our team before appearing publicly.</p>
            <div className="gold-divider" />
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-5 py-4 mb-8 text-center font-sans flex items-center justify-center gap-3">
              <span>✓</span> Thank you! Your testimonial has been submitted for review.
            </div>
          )}

          <div className="bg-[#F5F4F0] border border-stone-200 p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Full Name</label>
                  <input type="text" name="clientName" required defaultValue={user ? `${user.firstName} ${user.lastName}` : ''} placeholder="Your name" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Title / Role</label>
                  <input type="text" name="clientTitle" required placeholder="e.g. Homeowner, Berlin" className="input-field" />
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="label-field">Your Rating</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={26}
                        className="transition-colors duration-150"
                        fill={star <= (hoverRating || rating) ? '#C8A97E' : 'none'}
                        color={star <= (hoverRating || rating) ? '#C8A97E' : '#D1C4AF'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">Your Review</label>
                <textarea name="content" required rows="5" placeholder="Share your experience with our design and installation services..." className="input-field resize-none" />
              </div>

              <button type="submit" disabled={submitting} className="btn-gold w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50">
                {submitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><span>Submit Review</span><ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Testimonials;

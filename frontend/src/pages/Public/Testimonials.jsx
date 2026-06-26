import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { AuthContext } from '../../context/AuthContext';
import { Star, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Safely extracts a human-readable message from a thrown error of unknown shape. */
const getErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return fallback;
};

const getAvatarUrl = (avatar) => {
  return getImageUrl(avatar);
};

const Avatar = ({ name, avatar }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';
  const avatarUrl = getAvatarUrl(avatar);
  const showImage = avatarUrl && !imgFailed;

  return (
    <div
      className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C1121F] to-[#9B0F18] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden ring-2 ring-[rgba(193,18,31,0.15)]"
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
};

const StarRatingDisplay = ({ rating }) => (
  <div className="flex gap-1 mb-5" role="img" aria-label={`Rated ${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={15}
        aria-hidden="true"
        className={i <= rating ? 'text-[#C1121F]' : 'text-[#E5E5E5]'}
        fill={i <= rating ? '#C1121F' : 'none'}
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <div className="card-elevated p-5 sm:p-8 flex flex-col justify-between bg-white relative overflow-hidden h-full">
    {/* Decorative quote */}
    <div
      aria-hidden="true"
      className="absolute -top-3 -left-1 text-[100px] font-serif text-[rgba(193,18,31,0.06)] leading-none pointer-events-none select-none"
    >
      "
    </div>

    <div className="relative">
      <StarRatingDisplay rating={testimonial.rating} />
      <p className="text-[#555555] text-xs sm:text-sm leading-relaxed italic mb-6 sm:mb-8 line-clamp-4 sm:line-clamp-none">"{testimonial.content}"</p>
    </div>

    <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-[#F0F0F0] mt-auto">
      <Avatar name={testimonial.clientName} avatar={testimonial.avatar} />
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-[#111111] truncate">{testimonial.clientName}</p>
        <p className="text-[9px] sm:text-[11px] text-[#C1121F] uppercase tracking-wider font-medium truncate">{testimonial.clientTitle}</p>
      </div>
    </div>
  </div>
);

const RatingInput = ({ value, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-2 mt-2" role="radiogroup" aria-label="Your rating, 1 to 5 stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onFocus={() => setHoverRating(star)}
          onBlur={() => setHoverRating(0)}
          className="p-1 transition-transform hover:scale-110 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C1121F]"
        >
          <Star
            size={28}
            aria-hidden="true"
            className="transition-colors duration-150"
            fill={star <= (hoverRating || value) ? '#C1121F' : 'none'}
            color={star <= (hoverRating || value) ? '#C1121F' : '#DDDDDD'}
          />
        </button>
      ))}
    </div>
  );
};

export const Testimonials = () => {
  const { user } = useContext(AuthContext);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    API.get('/testimonials')
      .then((res) => {
        if (res.data.success) setTestimonials(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await API.post('/testimonials', {
        content: data.content,
        rating,
        clientName: data.clientName || undefined,
        clientTitle: data.clientTitle || undefined,
      });
      if (res.data.success) {
        setSuccess(true);
        e.target.reset();
        setRating(5);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit review. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" role="status" aria-live="polite">
        <div className="spinner" />
        <span className="sr-only">Loading testimonials…</span>
      </div>
    );
  }

  return (
    <div className="flex-grow">
      <style>{`
        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
          .testimonials-hero {
            min-height: auto !important;
            padding-top: 88px; /* Offset for navbar */
            padding-bottom: 40px;
          }
          .testimonials-hero-title {
            font-size: 44px !important;
            line-height: 1.1 !important;
          }
          .testimonials-hero-overlay {
            background: linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.4) 60%, transparent 100%) !important;
          }
          .testimonials-grid-mobile {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="testimonials-hero relative h-[48vh] min-h-[320px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1800"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="testimonials-hero-overlay absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.88) 0%, rgba(17,17,17,0.25) 65%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-16 w-full">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-5 h-0.5 bg-[#C1121F]" />
            <span className="section-label !text-[#E63946]">Client Reviews</span>
          </div>
          <h1
            className="testimonials-hero-title text-5xl md:text-7xl font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
          >
            Testimonials
          </h1>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-16 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-base text-[#555555] leading-relaxed">
            Read what our distinguished clients say about their experience working with Klare Homes. Every review is personally verified before being published.
          </p>
          <div className="section-divider mt-6" />
        </div>
      </section>

      {/* ── REVIEWS GRID ── */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          {testimonials.length === 0 ? (
            <div className="text-center py-28 bg-white border border-[#E5E5E5] rounded-2xl">
              <p className="text-sm text-[#888888] uppercase tracking-widest">No reviews yet — be the first!</p>
            </div>
          ) : (
            <div className="testimonials-grid-mobile grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SUBMISSION FORM ── */}
      <section className="py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-3">Share Your Experience</span>
            <h2 className="section-headline mt-2">Leave a Review</h2>
            <p className="text-sm text-[#888888] mt-3">All reviews are verified by our team before appearing publicly.</p>
            <div className="section-divider mt-5" />
          </div>

          {success && (
            <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-5 py-4 mb-8 rounded-xl flex items-center justify-center gap-3">
              <CheckCircle size={16} aria-hidden="true" />
              Thank you! Your testimonial has been submitted for review.
            </div>
          )}

          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 mb-8 rounded-xl flex items-center justify-center gap-3">
              <AlertCircle size={16} aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-10 rounded-2xl">
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="clientName" className="label-field">Full Name</label>
                    <input
                      id="clientName"
                      type="text"
                      name="clientName"
                      required
                      defaultValue={user ? `${user.firstName} ${user.lastName}` : ''}
                      placeholder="Your name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="clientTitle" className="label-field">Title / Role</label>
                    <input
                      id="clientTitle"
                      type="text"
                      name="clientTitle"
                      required
                      placeholder="e.g. Homeowner, Berlin"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-field" id="rating-label">Your Rating</label>
                  <RatingInput value={rating} onChange={setRating} />
                </div>

                <div>
                  <label htmlFor="content" className="label-field">Your Review</label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows="5"
                    minLength={10}
                    placeholder="Share your experience with our design and installation services..."
                    className="input-field resize-none"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full !py-4 flex items-center justify-center gap-3 disabled:opacity-50">
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    : <><span>Submit Review</span><ArrowRight size={14} /></>}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-bold text-[#111111] mb-2" style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}>
                  Sign in to leave a review
                </h3>
                <p className="text-sm text-[#555555] mb-6">
                  We ask our clients to sign in so we can verify the authenticity of all reviews.
                </p>
                <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                  Client Login <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
export default Testimonials;
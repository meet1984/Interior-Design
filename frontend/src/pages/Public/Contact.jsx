import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { Phone, Mail, MapPin, Clock, ArrowRight, Send, CheckCircle } from 'lucide-react';

/* ─────────────────────────────────────────────
   SCROLL-REVEAL HOOK
───────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
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

const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s cubic-bezier(.4,0,.2,1) ${delay}ms, transform 0.6s cubic-bezier(.4,0,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────
   FORM INPUT — shared style
───────────────────────────────────────────── */
const inputCls =
  'w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#CCCCCC] outline-none transition-all duration-200';
const labelCls = 'block text-[10px] tracking-[0.18em] text-[#888888] uppercase font-semibold mb-1.5';

/* ─────────────────────────────────────────────
   CONTACT INFO ITEM
───────────────────────────────────────────── */
const InfoItem = ({ icon: Icon, label, value, href, delay }) => (
  <Reveal delay={delay}>
    <div className="flex items-start gap-5 group">
      {/* Icon column */}
      <div
        className="w-10 h-10 shrink-0 flex items-center justify-center bg-[#F8F6F3] border border-[#E5E5E5] text-[#C1121F] transition-all duration-300 group-hover:bg-[#C1121F] group-hover:text-white group-hover:border-[#C1121F]"
        style={{ borderRadius: '2px' }}
      >
        <Icon size={16} />
      </div>

      {/* Text column */}
      <div className="pt-0.5">
        <p className="text-[9px] tracking-[0.22em] text-[#AAAAAA] uppercase font-semibold mb-1">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-sm text-[#333333] hover:text-[#C1121F] transition-colors leading-relaxed whitespace-pre-line"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-line">{value}</p>
        )}
      </div>
    </div>
  </Reveal>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const Contact = () => {
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get('/settings')
      .then((res) => {
        if (res.data.success) {
          const dict = {};
          res.data.data.forEach((s) => { dict[s.key] = s.value; });
          setSettings(dict);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await API.post('/inquiries', {
        ...data,
        subject: data.subject || 'Showroom Inquiry Request',
        inquiryType: 'general',
      });
      if (res.data.success) {
        setStatus('success');
        const cleanPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '919319919131';
        const waMsg = `*New Studio Inquiry*\n\n*Name:* ${data.name}\n*Email:* ${data.email}\n*Phone:* ${data.phone || 'N/A'}\n*Subject:* ${data.subject || 'Showroom Request'}\n\n*Message:*\n${data.message}`;
        window.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
        e.target.reset();
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const address  = settings?.studio_address  || 'Maximilianstraße 45,\n80539 München, Germany';
  const hours    = settings?.opening_hours   || 'Mon – Fri: 09:00 – 18:00\nSaturday: 10:00 – 15:00';
  const phone    = settings?.contact_phone   || '+49 (89) 123-4567';
  const email    = settings?.contact_email   || 'concierge@klarehomes.com';

  return (
    <div className="flex-grow bg-[#FAFAFA]">
      <style>{`
        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
          .contact-hero-grid {
            min-height: auto !important;
            padding-top: 88px; /* navbar offset */
          }
          .contact-hero-content {
            padding-top: 40px !important;
            padding-bottom: 40px !important;
          }
          .contact-hero-title {
            font-size: 44px !important;
            line-height: 1.1 !important;
          }
          .contact-section-padding {
            padding-top: 64px !important;
            padding-bottom: 64px !important;
          }
          .contact-gap {
            gap: 48px !important;
          }
          .contact-form-card {
            padding: 28px 24px !important;
          }
          .contact-trust-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO — editorial split layout
      ══════════════════════════════════════════ */}
      <section className="relative bg-white border-b border-[#E5E5E5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="contact-hero-grid grid grid-cols-1 lg:grid-cols-2 min-h-[52vh]">

            {/* Left: text */}
            <div className="contact-hero-content flex flex-col justify-end py-20 lg:py-28 pr-0 lg:pr-16 relative z-10">
              <Reveal>
                <p className="text-[9px] tracking-[0.3em] text-[#C1121F] uppercase font-semibold mb-4">
                  Get In Touch
                </p>
                <h1
                  className="contact-hero-title text-5xl md:text-6xl lg:text-7xl font-bold text-[#111111] uppercase leading-none tracking-wide"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  Contact
                  <br />
                  <span className="text-[#C1121F]">Studio</span>
                </h1>
                <div className="mt-6 flex items-start gap-4">
                  <div className="w-12 h-px bg-[#C1121F] mt-2.5 shrink-0" />
                  <p className="text-sm text-[#666666] leading-relaxed max-w-sm">
                    Private visits by advance appointment only. A studio representative
                    will confirm within 24 hours.
                  </p>
                </div>
              </Reveal>

              {/* Architectural detail */}
              <Reveal delay={100}>
                <div className="mt-10 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#C1121F] rotate-45" />
                    <span className="text-[10px] tracking-[0.2em] text-[#AAAAAA] uppercase">Munich Atelier</span>
                  </div>
                  <div className="w-px h-4 bg-[#E5E5E5]" />
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#E6C77A] rotate-45" />
                    <span className="text-[10px] tracking-[0.2em] text-[#AAAAAA] uppercase">Est. 2009</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right: image */}
            <div className="hidden lg:block relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
                alt="Munich Showroom"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
              {/* Top-right caption */}
              <div className="absolute top-8 right-8">
                <span
                  className="text-[9px] tracking-[0.2em] text-white/60 uppercase font-semibold px-3 py-1.5 border border-white/20 backdrop-blur-sm"
                  style={{ borderRadius: '1px' }}
                >
                  Maximilianstraße, München
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <section className="contact-section-padding py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="contact-gap grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">

            {/* ── LEFT COLUMN: Info ── */}
            <div className="lg:col-span-2 space-y-12">

              {/* Studio intro */}
              <Reveal>
                <div>
                  <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-3">
                    Munich Showroom
                  </p>
                  <h2
                    className="text-2xl font-bold text-[#111111] uppercase tracking-wider leading-tight"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    Klare Homes<br />Design Studio
                  </h2>
                  <p className="text-sm text-[#666666] leading-relaxed mt-3 max-w-xs">
                    Experience custom wood-grain veneers, marble counters, and
                    silent automated drawers — by appointment.
                  </p>
                  {/* rule */}
                  <div className="mt-6 flex items-center gap-4">
                    <div className="w-8 h-px bg-[#C1121F]" />
                    <div className="flex-1 h-px bg-[#E5E5E5]" />
                  </div>
                </div>
              </Reveal>

              {/* Contact info items */}
              <div className="space-y-7">
                <InfoItem icon={MapPin} label="Address" value={address} delay={0} />
                <InfoItem icon={Clock}  label="Hours"   value={hours}   delay={60} />
                <InfoItem icon={Phone}  label="Phone"   value={phone}   href={`tel:${phone.replace(/\s/g, '')}`} delay={120} />
                <InfoItem icon={Mail}   label="Email"   value={email}   href={`mailto:${email}`} delay={180} />
              </div>

              {/* Map placeholder */}
              <Reveal delay={200}>
                <div
                  className="contact-map-placeholder relative overflow-hidden bg-[#F2EFEA] border border-[#E5E5E5]"
                  style={{ borderRadius: '2px', height: '180px' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                    alt="Munich location"
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3">
                    <div
                      className="w-10 h-10 bg-[#C1121F] flex items-center justify-center"
                      style={{
                        borderRadius: '2px',
                        boxShadow: '0 4px 20px rgba(193,18,31,0.35)',
                      }}
                    >
                      <MapPin size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#333333] font-semibold uppercase tracking-wider">
                        {address.split('\n')[0] || address}
                      </p>
                      <p className="text-[10px] text-[#888888] mt-0.5">{address.split('\n').slice(1).join(' ')}</p>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] text-[#C1121F] hover:text-[#9B0F18] uppercase tracking-widest font-semibold transition-colors"
                    >
                      Open in Maps
                      <ArrowRight size={10} />
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ── RIGHT COLUMN: Form ── */}
            <div className="lg:col-span-3">
              <Reveal delay={80}>
                <div
                  className="contact-form-card bg-white border border-[#E5E5E5] p-10 lg:p-12"
                  style={{
                    borderRadius: '2px',
                    boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Form header */}
                  <div className="mb-8 pb-8 border-b border-[#F0F0F0]">
                    <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-2">
                      Make an Enquiry
                    </p>
                    <h3
                      className="text-2xl font-bold text-[#111111] uppercase tracking-wider"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                      Request a Private<br />Consultation
                    </h3>
                    <p className="text-sm text-[#888888] mt-2">
                      A studio representative will respond within 24 hours.
                    </p>
                  </div>

                  {/* Status messages */}
                  {status === 'success' && (
                    <div
                      className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-5 py-4 mb-6"
                      style={{ borderRadius: '2px' }}
                    >
                      <CheckCircle size={16} className="shrink-0 mt-0.5" />
                      <span>
                        Enquiry received. A studio partner will be in touch shortly.
                      </span>
                    </div>
                  )}
                  {status === 'error' && (
                    <div
                      className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 mb-6"
                      style={{ borderRadius: '2px' }}
                    >
                      Submission failed. Please try again or contact us directly.
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Maximilian Müller"
                        className={inputCls}
                        style={{ borderRadius: '2px' }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="client@loft.de"
                          className={inputCls}
                          style={{ borderRadius: '2px' }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="+49 172 ···"
                          className={inputCls}
                          style={{ borderRadius: '2px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Subject</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        placeholder="e.g. Kitchen Millwork Consultation"
                        className={inputCls}
                        style={{ borderRadius: '2px' }}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Message</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="Describe your project — room dimensions, timeline, preferred materials (marble, oak, concrete)…"
                        className={`${inputCls} resize-none`}
                        style={{ borderRadius: '2px' }}
                      />
                    </div>

                    {/* Privacy note */}
                    <p className="text-[10px] text-[#AAAAAA] leading-relaxed">
                      By submitting you agree to be contacted by Klare Homes Munich regarding your enquiry.
                      We do not share your details with third parties.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[11px] uppercase tracking-[0.2em] font-semibold py-4 disabled:opacity-50 transition-all duration-200 hover:-translate-y-px"
                      style={{ borderRadius: '2px' }}
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </Reveal>

              {/* Under-form trust strip */}
              <Reveal delay={160}>
                <div className="contact-trust-grid mt-6 grid grid-cols-3 divide-x divide-[#E5E5E5] border border-[#E5E5E5] bg-white"
                  style={{ borderRadius: '2px' }}
                >
                  {[
                    { stat: '24h', label: 'Response Time' },
                    { stat: settings?.stat_years || '15+', label: 'Years Experience' },
                    { stat: settings?.stat_craftsmanship || '100%', label: 'Bespoke Design' },
                  ].map(({ stat, label }) => (
                    <div key={label} className="py-4 px-2 sm:py-5 sm:px-6 text-center">
                      <p
                        className="text-lg sm:text-xl font-bold text-[#111111]"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                      >
                        {stat}
                      </p>
                      <p className="text-[8px] sm:text-[9px] tracking-wider sm:tracking-widest text-[#AAAAAA] uppercase mt-1 sm:mt-0.5 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
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
            <span className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">Private Consultations</span>
            <div className="w-px h-4 bg-[#E5E5E5]" />
            <span className="text-[10px] tracking-widest text-[#AAAAAA] uppercase">German Craftsmanship</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Award, Leaf, Wrench, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '15+', label: 'Years of Excellence' },
  { value: '500+', label: 'Projects Completed' },
  { value: '12', label: 'Design Awards' },
  { value: '100%', label: 'Bespoke Craftsmanship' },
];

const pillars = [
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    desc: 'Our timber grains are sourced from certified FSC forests, utilizing water-based satin finishes and organic slate overlays for health-conscious living spaces.',
  },
  {
    icon: Wrench,
    title: 'German Engineering',
    desc: 'Partnered with Grass and Blum hardware systems — custom soft-close runners, concealed motorized cabinets, and circadian-syncing integrated LED channels.',
  },
  {
    icon: Award,
    title: 'Award-Winning Design',
    desc: 'Recognised across Europe for our commitment to precision, aesthetic innovation, and delivering interiors that transcend conventional luxury.',
  },
];

export const About = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/public/content').then(res => {
      if (res.data.success) setContent(res.data.data.about);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-2 border-[#C8A97E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-400 uppercase tracking-widest">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#F5F4F0]">
      {/* ── HERO ── */}
      <section className="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1800"
            alt="Luxury interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.3) 60%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-14 w-full">
          <span className="section-label mb-3 block">Our Heritage</span>
          <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {content?.title || 'Luxury & Precision'}
          </h1>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#0A0F1E] border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
            {stats.map(({ value, label }) => (
              <div key={label} className="px-8 py-8 text-center">
                <p className="text-3xl font-light text-[#C8A97E]" style={{ fontFamily: 'Outfit, sans-serif' }}>{value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1.5 font-sans">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left: Sticky image */}
            <div className="relative lg:sticky lg:top-28">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=900"
                  alt="Design studio"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-6 bg-[#C8A97E] p-6 max-w-[200px] hidden lg:block">
                <p className="text-2xl font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>2008</p>
                <p className="text-xs text-white/80 uppercase tracking-wider mt-1">Est. Munich</p>
              </div>
            </div>

            {/* Right: Text content */}
            <div className="space-y-10">
              <div>
                <span className="section-label mb-3">Who We Are</span>
                <h2 className="text-3xl md:text-4xl font-light text-stone-900 tracking-wide leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  A Design House Rooted in German Precision
                </h2>
                <div className="gold-divider-left" />
              </div>

              {content?.description && content.description.trim() !== '' ? (
                <div
                  className="prose prose-stone max-w-none text-stone-600 font-sans text-base leading-relaxed [&>p]:mb-5 [&>strong]:text-stone-900 [&>strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: content.description }}
                />
              ) : (
                <div className="space-y-5 text-stone-600 font-sans text-base leading-relaxed">
                  <p>
                    Established as a high-end design house in Munich, Germany, <strong className="text-stone-900">SIGNATURE</strong> represents the pinnacle of custom interior millwork. Inspired by standard-setters like Poggenpohl, Häcker, and Nobilia, we combine state-of-the-art automation and rigorous material selection to produce interior cabinetry that feels like sculpture and works like machine parts.
                  </p>
                  <p>
                    Our core architecture is defined by minimalist horizontal lines, handleless profiles, and raw textural materials. We do not design standard modules — every millwork component is custom engineered to fit the precise millimeter dimensions of your living space.
                  </p>
                  <p>
                    We invite prospective clients to request a private review appointment. In our Munich showroom, you can experience the weight of our solid natural quartzite countertops, the seamless alignment of our bookmatched oak panels, and inspect our internal organization options firsthand.
                  </p>
                </div>
              )}

              <Link to="/contact" className="btn-gold inline-flex">
                Book a Private Consultation <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="py-24 bg-white border-y border-stone-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="section-label mb-3">Our Principles</span>
            <h2 className="section-title text-stone-900">What Sets Us Apart</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-elevated p-10 group text-center">
                <div className="w-14 h-14 rounded-full bg-[#C8A97E]/10 border border-[#C8A97E]/20 flex items-center justify-center text-[#C8A97E] mx-auto mb-6 group-hover:bg-[#C8A97E] group-hover:text-white transition-all duration-300">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-stone-900 uppercase tracking-wider mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
                <p className="text-sm text-stone-500 font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1200 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
          <span className="section-label">Begin Your Journey</span>
          <h2 className="text-3xl font-light text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to Transform Your Space?
          </h2>
          <p className="text-stone-400 font-sans text-sm leading-relaxed">
            Contact our design team to schedule a private consultation at our Munich showroom.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/contact" className="btn-gold">Book Consultation</Link>
            <Link to="/projects" className="btn-outline-gold !text-white !border-white/30 hover:!border-[#C8A97E]">View Portfolio</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default About;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Award, Leaf, Wrench, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// We will construct this dynamically inside the component now

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

// Returns border classes so the stat-bar reads as a clean 2x2 grid on mobile
// (vertical + horizontal hairlines) and a single clean row on desktop
// (vertical hairlines only) — plain `divide-x` can't express both layouts.
const getStatBorderClasses = (index, total) => {
  const isEvenMobile = index % 2 === 0;
  const isLastRowMobile = index >= total - 2;
  const isLastDesktop = index === total - 1;
  return [
    'border-[#F0F0F0]',
    isEvenMobile ? 'border-r' : 'border-r-0',
    isLastRowMobile ? 'border-b-0' : 'border-b',
    'lg:border-b-0',
    isLastDesktop ? 'lg:border-r-0' : 'lg:border-r',
  ].join(' ');
};

export const About = () => {
  const [content, setContent] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get('/public/content')
      .then((res) => {
        if (res.data.success) setContent(res.data.data.about);
      })
      .catch(console.error);

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

  const stats = [
    { value: settings?.stat_years || '15+', label: 'Years of Excellence' },
    { value: settings?.stat_projects || '500+', label: 'Projects Completed' },
    { value: settings?.stat_awards || '12', label: 'Design Awards' },
    { value: settings?.stat_craftsmanship || '100%', label: 'Bespoke Craftsmanship' },
  ];

  // Note: no full-page loading gate here on purpose. Every piece of content
  // that depends on `content` already has a hardcoded fallback below, so the
  // page renders immediately with that fallback and swaps in real CMS copy
  // the moment it arrives, rather than showing a blank spinner for a call
  // the page doesn't actually need to block on.
  return (
    <div className="about-page flex-grow" style={{ backgroundColor: 'var(--bg)' }}>
      <style>{`
        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
          .about-hero {
            min-height: auto;
            padding-top: 88px; /* Offset for navbar */
            padding-bottom: 40px;
          }
          .about-hero-title {
            font-size: 40px !important;
            line-height: 1.1 !important;
          }
          .about-hero-overlay {
            background: linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.4) 60%, transparent 100%) !important;
          }
          .about-section-padding {
            padding-top: 64px !important;
            padding-bottom: 64px !important;
          }
          .about-gap {
            gap: 40px !important;
          }
          .about-cta-buttons {
            flex-direction: column;
            width: 100%;
          }
          .about-cta-buttons > a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="about-hero relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1800"
            alt="Luxury interior"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div
            className="about-hero-overlay absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.85) 0%, rgba(17,17,17,0.25) 60%, transparent 100%)' }}
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-14 w-full">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-5 h-0.5 bg-[#C1121F]" aria-hidden="true" />
            <span className="section-label !text-[#E63946]">Our Heritage</span>
          </div>
          <h1 className="about-hero-title text-5xl lg:text-7xl font-bold text-white leading-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {content?.title || 'Luxury & Precision'}
          </h1>
          {/* Heritage detail, visible on every breakpoint instead of disappearing below lg */}
          <p className="text-white/70 text-xs uppercase tracking-widest mt-4 lg:hidden">
            Est. 2008 · Munich
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-y border-[#E5E5E5]">
        <style>{`
          @media (max-width: 768px) {
            .stats-grid-mobile {
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            .stat-cell {
              padding: 24px 12px !important;
            }
            .stat-value {
              font-size: 32px !important;
            }
            .stat-label {
              font-size: 10px !important;
              max-width: 100% !important;
            }
          }
        `}</style>
        <div className="max-w-[1400px] mx-auto px-0 lg:px-6">
          <div className="stats-grid-mobile grid grid-cols-2 lg:grid-cols-4">
            {stats.map(({ value, label }, index) => (
              <div
                key={label}
                className={`stat-cell px-8 py-10 text-center flex flex-col justify-center items-center group transition-colors duration-300 hover:bg-[var(--bg)] ${getStatBorderClasses(index, stats.length)}`}
              >
                <p
                  className="stat-value text-4xl font-bold text-[#C1121F] transition-transform duration-300 group-hover:scale-105"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {value}
                </p>
                <p className="stat-label text-xs text-[#888888] uppercase tracking-wider lg:tracking-widest mt-2 max-w-none mx-auto leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="about-section-padding py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="about-gap grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Left: Image */}
            <div className="relative lg:sticky lg:top-28">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_16px_64px_rgba(0,0,0,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=900"
                  alt="Design studio"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating accent card — desktop only; mobile equivalent shown in hero */}
              <div className="absolute -bottom-6 -right-6 bg-[#C1121F] p-7 max-w-[200px] hidden lg:block rounded-2xl shadow-[0_8px_32px_rgba(193,18,31,0.35)]">
                <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>2008</p>
                <p className="text-xs text-white/80 uppercase tracking-wider mt-1">Est. Munich</p>
              </div>
            </div>

            {/* Right: Text */}
            <div className="space-y-10">
              <div>
                <span className="section-label mb-3">Who We Are</span>
                <h2 className="section-headline mt-2 mb-4">
                  {content?.title || 'A Design House Rooted in German Precision'}
                </h2>
                <div className="section-divider-left" aria-hidden="true" />
              </div>

              {content?.description && content.description.trim() !== '' ? (
                <div
                  className="prose prose-stone max-w-none text-[#555555] text-base leading-relaxed [&>p]:mb-5 [&>strong]:text-[#111111] [&>strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: content.description }}
                />
              ) : (
                <div className="space-y-5 text-[#555555] text-base leading-relaxed">
                  <p>
                    Established as a high-end design house in Munich, Germany, <strong className="text-[#111111]">Klare Homes</strong> represents the pinnacle of custom interior millwork. We combine state-of-the-art automation and rigorous material selection to produce interior cabinetry that feels like sculpture.
                  </p>
                  <p>
                    Our core architecture is defined by minimalist horizontal lines, handleless profiles, and raw textural materials. Every millwork component is custom engineered to the precise millimeter dimensions of your living space.
                  </p>
                  <p>
                    We invite prospective clients to request a private review appointment. In our Munich showroom, you can experience the weight of our solid natural quartzite countertops firsthand.
                  </p>
                </div>
              )}

              <Link to="/contact" className="btn-primary inline-flex w-full md:w-auto justify-center">
                Book a Private Consultation <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="about-section-padding py-24 bg-white border-y border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="section-label mb-3">Our Principles</span>
            <h2 className="section-headline mt-2">What Sets Us Apart</h2>
            <div className="section-divider mt-4" aria-hidden="true" />
          </div>
          <div className="about-gap grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-elevated p-10 group text-center">
                <div
                  className="w-14 h-14 rounded-2xl bg-[rgba(193,18,31,0.08)] border border-[rgba(193,18,31,0.12)] flex items-center justify-center text-[#C1121F] mx-auto mb-6 group-hover:bg-[#C1121F] group-hover:text-white transition-all duration-300"
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-3">{title}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-section-padding py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
          <span className="section-label">Begin Your Journey</span>
          <h2 className="section-headline mt-2">Ready to Transform Your Space?</h2>
          <p className="text-[#666666] text-base leading-relaxed">
            Contact our design team to schedule a private consultation at our Munich showroom.
          </p>
          <div className="about-cta-buttons flex justify-center gap-4 flex-wrap pt-2">
            <Link to="/contact" className="btn-primary">Book Consultation</Link>
            <Link to="/projects" className="btn-secondary">View Portfolio</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default About;
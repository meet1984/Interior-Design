import React, { useState, useEffect } from 'react';
import { Compass, PenTool, Layout, Layers, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';

const defaultServices = [
  { title: 'Showroom Consulting', desc: 'Meet in Munich with a senior interior architect. We analyze architectural drawings, floor plans, and material preferences.', iconName: Compass },
  { title: 'Bespoke 3D Renderings', desc: 'High-fidelity photorealistic visualizations of your spaces, incorporating exact materials, shadows, and interior lighting.', iconName: Layout },
  { title: 'Millwork Engineering', desc: 'Every cabinet, drawer, panel, and spacer is modeled in CAD to sub-millimeter tolerances. Engineered for flawless fits.', iconName: PenTool },
  { title: 'Material Curation', desc: 'Sourcing premium marbles, Fenix NTM surfaces, European oak timbers, and anodized hardware from premium European mills.', iconName: Layers },
  { title: 'White-Glove Installation', desc: 'Managed execution by our private crew of certified cabinetmakers. Every reveal aligned, every appliance wiring coordinated.', iconName: ShieldCheck },
  { title: 'Post-Installation Care', desc: 'Lifetime alignment verification on hinges and runners. 10-year structural warranty on all panel components.', iconName: Heart },
];

const processSteps = [
  { step: '01', title: 'Consultation', desc: 'Initial discovery of your vision and spatial requirements' },
  { step: '02', title: 'Design', desc: 'Photorealistic 3D rendering and material selection' },
  { step: '03', title: 'Engineering', desc: 'CAD precision engineering to exact millimeter specs' },
  { step: '04', title: 'Installation', desc: 'White-glove professional installation and handover' },
];

const ServiceCard = ({ service, index }) => {
  const FallbackIcon = service.iconName || Compass;
  const num = String(index + 1).padStart(2, '0');

  return (
    <Link
      to="/contact"
      state={{ service: service.title }}
      aria-label={`Request a consultation about ${service.title}`}
      className="card-elevated p-6 lg:p-10 group flex flex-col bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C1121F]"
    >
      <div className="flex items-start justify-between mb-6 lg:mb-8">
        <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-[rgba(193,18,31,0.08)] flex items-center justify-center text-[#C1121F] group-hover:bg-[#C1121F] group-hover:text-white transition-all duration-300">
          {service.icon ? (
            <img
              src={getImageUrl(service.icon)}
              alt=""
              loading="lazy"
              className="w-6 h-6 object-contain group-hover:brightness-[10] transition-all"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <FallbackIcon size={20} className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
          )}
        </div>
        <span
          className="text-2xl lg:text-4xl font-bold text-[#F0F0F0] group-hover:text-[rgba(193,18,31,0.15)] transition-colors"
          style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
        >
          {num}
        </span>
      </div>
      <h3 className="text-[11px] sm:text-sm font-semibold text-[#111111] uppercase tracking-wider mb-2 lg:mb-3">
        {service.title}
      </h3>
      <p className="text-[10px] sm:text-sm text-[#666666] leading-relaxed flex-grow">
        {service.description || service.desc}
      </p>
      <div className="mt-5 lg:mt-8 pt-4 lg:pt-6 border-t border-[#F0F0F0] flex items-center gap-2 text-[9px] sm:text-[11px] text-[#C1121F] font-semibold uppercase tracking-wider opacity-100 lg:opacity-0 lg:group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
        Learn More <ArrowRight size={12} aria-hidden="true" />
      </div>
    </Link>
  );
};

const ProcessStep = ({ step, title, desc }) => (
  <div className="text-center space-y-2 lg:space-y-3 p-6 lg:p-8 border border-[#E5E5E5] rounded-2xl hover:border-[#C1121F] hover:shadow-[0_4px_20px_rgba(193,18,31,0.1)] transition-all duration-300 group bg-[#FAFAFA]">
    <span
      className="text-4xl font-bold text-[#C1121F] group-hover:scale-110 inline-block transition-transform"
      style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
    >
      {step}
    </span>
    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{title}</h4>
    <p className="text-xs text-[#888888] leading-relaxed">{desc}</p>
  </div>
);

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/public/content')
      .then((res) => {
        if (res.data.success) setServices(res.data.data.services || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" role="status" aria-live="polite">
        <div className="spinner" />
        <span className="sr-only">Loading services…</span>
      </div>
    );
  }

  const renderServices = services.length > 0 ? services : defaultServices;

  return (
    <div className="flex-grow">
      <style>{`
        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
          .services-hero {
            min-height: auto !important;
            padding-top: 88px; /* Offset for navbar */
            padding-bottom: 40px;
          }
          .services-hero-title {
            font-size: 44px !important;
            line-height: 1.1 !important;
          }
          .services-hero-overlay {
            background: linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.4) 60%, transparent 100%) !important;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="services-hero relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1800"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="services-hero-overlay absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.90) 0%, rgba(17,17,17,0.30) 60%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-16 w-full">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-5 h-0.5 bg-[#C1121F]" />
            <span className="section-label !text-[#E63946]">Studio Capabilities</span>
          </div>
          <h1
            className="services-hero-title text-5xl md:text-7xl font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
          >
            Our Design Services
          </h1>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-20 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <span className="section-label">End-to-End Excellence</span>
            <p className="text-lg text-[#555555] leading-relaxed mt-3">
              From initial conceptual consultation through white-glove installation, Klare Homes provides a fully managed luxury design experience — ensuring every detail is perfected before handover.
            </p>
            <div className="section-divider" />
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {renderServices.map((service, index) => (
              <ServiceCard key={service.id ?? index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS STRIP ── */}
      <section className="py-20 bg-white border-y border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-label mb-3">Our Process</span>
            <h2 className="section-headline mt-2">How We Work</h2>
            <div className="section-divider mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
            {processSteps.map((item) => (
              <ProcessStep key={item.step} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <span className="section-label">Ready to Begin?</span>
          <h2 className="section-headline mt-2">Start Your Project Today</h2>
          <p className="text-[#666666] text-sm">Schedule a private consultation with our design team at our Munich showroom.</p>
          <Link to="/contact" className="btn-primary inline-flex">
            Request Consultation <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
};
export default Services;
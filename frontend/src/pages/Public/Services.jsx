import React, { useState, useEffect } from 'react';
import { Compass, PenTool, Layout, Layers, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultServices = [
    { title: 'Showroom Consulting', desc: 'Meet in Munich with a senior interior architect. We analyze architectural drawings, floor plans, and material preferences.', iconName: Compass },
    { title: 'Bespoke 3D Renderings', desc: 'High-fidelity photorealistic visualizations of your spaces, incorporating exact materials, shadows, and interior lighting.', iconName: Layout },
    { title: 'Millwork Engineering', desc: 'Every cabinet, drawer, panel, and spacer is modeled in CAD to sub-millimeter tolerances. Engineered for flawless fits.', iconName: PenTool },
    { title: 'Material Curation', desc: 'Sourcing premium marbles, Fenix NTM surfaces, European oak timbers, and anodized hardware from premium European mills.', iconName: Layers },
    { title: 'White-Glove Installation', desc: 'Managed execution by our private crew of certified cabinetmakers. Every reveal aligned, every appliance wiring coordinated.', iconName: ShieldCheck },
    { title: 'Post-Installation Care', desc: 'Lifetime alignment verification on hinges and runners. 10-year structural warranty on all panel components.', iconName: Heart },
  ];

  useEffect(() => {
    API.get('/public/content').then(res => {
      if (res.data.success) setServices(res.data.data.services || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
        <div className="w-10 h-10 border-2 border-[#C8A97E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderServices = services.length > 0 ? services : defaultServices;

  return (
    <div className="flex-grow bg-[#F5F4F0]">
      {/* ── HERO ── */}
      <section className="relative h-[45vh] min-h-[320px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1800"
            alt="Design services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.95) 0%, rgba(10,15,30,0.4) 60%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-14 w-full">
          <span className="section-label mb-3 block">Studio Capabilities</span>
          <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Our Design Services</h1>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-20 bg-white border-b border-stone-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <span className="section-label">End-to-End Excellence</span>
            <p className="text-lg text-stone-600 font-sans leading-relaxed">
              From initial conceptual consultation through white-glove installation, SIGNATURE provides a fully managed luxury design experience — ensuring every detail is perfected before handover.
            </p>
            <div className="gold-divider" />
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderServices.map((ser, index) => {
              const FallbackIcon = ser.iconName || Compass;
              const num = String(index + 1).padStart(2, '0');
              return (
                <div key={index} className="card-elevated p-10 group flex flex-col">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-none bg-[#C8A97E]/10 flex items-center justify-center text-[#C8A97E] group-hover:bg-[#C8A97E] group-hover:text-white transition-all duration-300">
                      {ser.icon ? (
                        <img src={`${import.meta.env.VITE_API_URL}${ser.icon}`} alt="" className="w-6 h-6 object-contain filter group-hover:brightness-[10]" />
                      ) : (
                        <FallbackIcon size={22} />
                      )}
                    </div>
                    <span className="text-4xl font-extralight text-stone-100 group-hover:text-[#E8D5B0] transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {num}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 uppercase tracking-wider mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {ser.title}
                  </h3>
                  <p className="text-sm text-stone-500 font-sans leading-relaxed flex-grow">
                    {ser.description || ser.desc}
                  </p>
                  <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-2 text-[11px] text-[#C8A97E] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn More <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESS STRIP ── */}
      <section className="py-16 bg-[#0A0F1E] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-2">Our Process</span>
            <h2 className="text-2xl font-light text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>How We Work</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Consultation', desc: 'Initial discovery of your vision and spatial requirements' },
              { step: '02', title: 'Design', desc: 'Photorealistic 3D rendering and material selection' },
              { step: '03', title: 'Engineering', desc: 'CAD precision engineering to exact millimeter specs' },
              { step: '04', title: 'Installation', desc: 'White-glove professional installation and handover' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-3 p-6 border border-white/5 hover:border-[#C8A97E]/30 transition-colors group">
                <span className="text-3xl font-extralight text-[#C8A97E]" style={{ fontFamily: 'Outfit, sans-serif' }}>{step}</span>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-[#F5F4F0] border-t border-stone-200">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <span className="section-label">Ready to Begin?</span>
          <h2 className="text-3xl font-light text-stone-900 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Start Your Project Today</h2>
          <p className="text-stone-500 font-sans text-sm">Schedule a private consultation with our design team at our Munich showroom.</p>
          <Link to="/contact" className="btn-gold inline-flex">
            Request Consultation <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
};
export default Services;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Phone, Mail, MapPin, Clock, ArrowRight, Send } from 'lucide-react';

export const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get('/settings').then(res => {
      if (res.data.success) {
        const dict = {};
        res.data.data.forEach(s => { dict[s.key] = s.value; });
        setSettings(dict);
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await API.post('/inquiries', {
        ...data,
        subject: data.subject || 'Showroom Inquiry Request',
        inquiryType: 'general'
      });
      if (res.data.success) {
        setStatus('success');
        const cleanPhone = '919319919131';
        const messageText = `*New Studio Inquiry*\n\n*Name:* ${data.name}\n*Email:* ${data.email}\n*Phone:* ${data.phone || 'N/A'}\n*Subject:* ${data.subject || 'Showroom Request'}\n\n*Message:*\n${data.message}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
        e.target.reset();
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: MapPin, label: 'Address', value: settings?.studio_address || 'Maximilianstraße 45,\n80539 München, Germany' },
    { icon: Clock, label: 'Hours', value: settings?.opening_hours || 'Mon – Fri: 09:00 – 18:00\nSaturday: 10:00 – 15:00' },
    { icon: Phone, label: 'Phone', value: settings?.contact_phone || '+49 (89) 123-4567' },
    { icon: Mail, label: 'Email', value: settings?.contact_email || 'concierge@signature.com' },
  ];

  return (
    <div className="flex-grow bg-[#F5F4F0]">
      {/* ── HERO ── */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1800" alt="Munich" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.96) 0%, rgba(10,15,30,0.3) 70%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-14 w-full">
          <span className="section-label mb-3 block">Get In Touch</span>
          <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact Studio</h1>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Left: Info panel */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-3">
                <span className="section-label">Munich Showroom</span>
                <h2 className="text-2xl font-light text-stone-900 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Signature Design Studio</h2>
                <p className="text-sm text-stone-500 font-sans leading-relaxed">
                  Experience the fine details of custom wood grain veneers, marble counters, and silent automated drawers. Private visits reserved strictly by advance appointment.
                </p>
                <div className="gold-divider-left" />
              </div>

              {/* Contact cards */}
              <div className="space-y-4">
                {contactItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 p-5 bg-white border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-[#E8D5B0] transition-all group">
                    <div className="w-10 h-10 bg-[#C8A97E]/10 flex items-center justify-center text-[#C8A97E] shrink-0 group-hover:bg-[#C8A97E] group-hover:text-white transition-all duration-300">
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{label}</p>
                      <p className="text-sm text-stone-700 font-sans whitespace-pre-line leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="relative h-48 bg-stone-900 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                  alt="Munich location"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2">
                  <MapPin size={22} className="text-[#C8A97E]" />
                  <p className="text-xs text-white font-semibold uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Maximilianstraße 45, Munich</p>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                    className="text-[10px] text-[#C8A97E] hover:text-[#DFCDAE] flex items-center gap-1 uppercase tracking-wider transition-colors">
                    Open in Maps <ArrowRight size={10} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-stone-100 shadow-[0_4px_30px_rgba(0,0,0,0.06)] p-10">
                <div className="mb-8">
                  <span className="section-label mb-2 block">Make an Enquiry</span>
                  <h3 className="text-xl font-light text-stone-900 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Request a Private Consultation</h3>
                  <p className="text-sm text-stone-400 font-sans mt-1">A studio representative will respond within 24 hours.</p>
                </div>

                {status === 'success' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-5 py-4 mb-6 font-sans flex items-center gap-3">
                    <span className="text-emerald-500">✓</span>
                    Enquiry received. A studio partner will be in touch shortly.
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 mb-6 font-sans">⚠ Failed to submit. Please try again.</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="label-field">Full Name</label>
                    <input type="text" name="name" required placeholder="Maximilian Müller" className="input-field" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-field">Email Address</label>
                      <input type="email" name="email" required placeholder="client@loft.de" className="input-field" />
                    </div>
                    <div>
                      <label className="label-field">Phone <span className="text-stone-400 normal-case tracking-normal">(optional)</span></label>
                      <input type="text" name="phone" placeholder="+49 172..." className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="label-field">Subject</label>
                    <input type="text" name="subject" required placeholder="e.g. Kitchen Millwork Consultation" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Message</label>
                    <textarea name="message" required rows="5"
                      placeholder="Describe your project — room dimensions, timing, preferred materials (marble, oak, concrete)..."
                      className="input-field resize-none"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50">
                    {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={14} /><span>Send Message</span></>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Contact;

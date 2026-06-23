import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Heart, Compass, PenTool, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../services/api';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Fetch categories
    API.get('/categories')
      .then(res => { if (res.data.success) setCategories(res.data.data); })
      .catch(err => console.error(err));

    // Fetch featured products
    API.get('/products?featured=true&limit=3')
      .then(res => { if (res.data.success) setFeaturedProducts(res.data.data); })
      .catch(err => console.error(err));

    // Fetch approved testimonials
    API.get('/testimonials')
      .then(res => { if (res.data.success) setTestimonials(res.data.data.slice(0, 2)); })
      .catch(err => console.error(err));

    // Fetch projects for the consultation section carousel
    API.get('/projects')
      .then(res => { if (res.data.success) setProjects(res.data.data); })
      .catch(err => console.error(err));

    // Fetch dynamic services
    API.get('/public/content')
      .then(res => { 
        if (res.data.success) {
          setServices(res.data.data.services || []); 
        }
      })
      .catch(err => console.error(err));
  }, []);

  const carouselSlides = projects.map(proj => {
    const primaryImg = proj.media?.find(m => m.isPrimary) || proj.media?.[0];
    return {
      id: proj.id,
      image: primaryImg ? `${import.meta.env.VITE_API_URL}${primaryImg.filePath}` : '',
      title: proj.title,
      subtitle: proj.projectType || 'Signature Design',
      location: proj.location || 'Private Collection'
    };
  });

  useEffect(() => {
    if (carouselSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInquiryStatus('');
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await API.post('/inquiries', {
        ...data,
        subject: 'General Showroom Request',
        inquiryType: 'general'
      });
      if (res.data.success) {
        setInquiryStatus('success');
        
        // Automatically open WhatsApp to share details
        const cleanPhone = '919319919131'; // Forced redirect number requested by user
        const messageText = `*New Private Request*\n\n*Name:* ${data.name}\n*Email:* ${data.email}\n*Phone:* ${data.phone || 'N/A'}\n\n*Message:*\n${data.message}`;
        
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');

        e.target.reset();
      }
    } catch (err) {
      setInquiryStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#F8FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Background Image overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-4"
          >
            <span className="text-[10px] tracking-[0.4em] text-[#C8A97E] uppercase font-semibold block">
              Architectural Precision & Luxury Engineering
            </span>
            <h1 className="text-4xl md:text-7xl font-extralight tracking-[0.15em] text-white uppercase leading-tight font-display">
              Bespoke Spaces
            </h1>
            <h1 className="text-4xl md:text-7xl font-light tracking-[0.2em] text-[#C8A97E] uppercase leading-tight font-display -mt-2">
              For Premium Living
            </h1>
            <p className="text-sm text-slate-300 font-light max-w-xl mx-auto font-sans leading-relaxed tracking-wider pt-2">
              Inspired by the absolute peak of German craftsmanship, SIGNATURE constructs tailor-made kitchens, wardrobes, and living solutions matching your exact spatial footprint.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="pt-6 flex justify-center gap-4 flex-wrap"
          >
            <Link to="/categories" className="btn-gold">
              Explore Collections
            </Link>
            <Link to="/contact" className="btn-outline-gold !text-white hover:!text-slate-950">
              Book Showroom Tour
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. THE THREE PILLARS (SERVICES SUMMARY) */}
      {services.length > 0 && (
        <section className="py-24 border-b border-slate-200 overflow-hidden bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
              <span className="text-[10px] tracking-[0.3em] text-[#C8A97E] uppercase font-semibold">OUR EXPERTISE</span>
              <h2 className="text-3xl font-light uppercase tracking-widest mt-2">SIGNATURE SERVICES</h2>
          </div>
          
          <div className="flex relative overflow-hidden group">
            <motion.div
              className="flex gap-8 whitespace-nowrap px-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: Math.max(20, services.length * 5), repeat: Infinity }}
            >
              {/* Duplicate the array to create a seamless infinite scroll effect */}
              {[...services, ...services, ...services, ...services].map((srv, idx) => {
                return (
                <div key={`srv-${srv.id}-${idx}`} className="w-[320px] md:w-[380px] flex-shrink-0 bg-white p-8 border border-slate-200 shadow-sm space-y-4 hover:border-[#C8A97E] transition-colors duration-300 whitespace-normal">
                  <div className="w-10 h-10 bg-[#C8A97E]/10 flex items-center justify-center text-[#C8A97E]">
                    {srv.icon ? (
                      <img 
                        src={srv.icon.startsWith('/') ? `${import.meta.env.VITE_API_URL}${srv.icon}` : srv.icon} 
                        alt="icon" 
                        className="w-6 h-6 object-contain" 
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                    ) : null}
                    <Compass size={20} style={{ display: srv.icon ? 'none' : 'block' }} />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary font-display">{srv.title}</h3>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-4">
                    {srv.description || srv.desc}
                  </p>
                </div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* 3. CATEGORIES/COLLECTIONS FLOW BANNER */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-2 mb-16">
            <span className="text-[10px] tracking-[0.3em] text-[#C8A97E] uppercase font-semibold">FLOW HIERARCHY</span>
            <h2 className="text-3xl font-light uppercase tracking-widest">CATEGORIES & COLLECTIONS</h2>
            <div className="w-12 h-[1px] bg-[#C8A97E] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="group relative overflow-hidden bg-slate-900 aspect-[3/4]">
                {/* Fallback Unsplash image for luxury render visual */}
                <img 
                  src={
                    cat.image 
                      ? (cat.image.startsWith('/') ? `${import.meta.env.VITE_API_URL}${cat.image}` : cat.image)
                      : idx === 0 
                        ? 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800' // Kitchens
                        : idx === 1
                          ? 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800' // Wardrobes
                          : 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800' // Living Spaces
                  } 
                  alt={cat.name} 
                  className="w-full h-full object-cover opacity-60 hover:opacity-40 transition-opacity duration-500 group-hover:scale-105 transform transition-transform" 
                  onError={(e) => {
                    e.target.src = idx === 0 
                      ? 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
                      : idx === 1
                        ? 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800'
                        : 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                
                {/* Text overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent">
                  <span className="text-[9px] tracking-widest text-[#C8A97E] uppercase font-semibold">CATEGORY 0{idx+1}</span>
                  <h3 className="text-2xl font-light tracking-widest text-white uppercase mt-1">{cat.name}</h3>
                  <p className="text-[10px] text-slate-300 font-sans mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <Link 
                    to={`/categories/${cat.slug}`} 
                    className="mt-4 flex items-center gap-2 text-xs text-white uppercase tracking-widest hover:text-[#C8A97E] transition-colors"
                  >
                    <span>View Collections</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS PREVIEWS */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] tracking-[0.3em] text-[#C8A97E] uppercase font-semibold">PREMIUM MILLWORK</span>
              <h2 className="text-3xl font-light uppercase tracking-widest">FEATURED PIECES</h2>
            </div>
            <Link 
              to="/categories" 
              className="text-xs uppercase tracking-widest text-slate-600 hover:text-[#C8A97E] mt-4 md:mt-0 font-medium flex items-center gap-1"
            >
              <span>Explore full catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="bg-white border border-slate-200/60 shadow-sm flex flex-col group">
                <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
                  <img 
                    src={prod.thumbnail.startsWith('/') ? `${import.meta.env.VITE_API_URL}${prod.thumbnail}` : prod.thumbnail} 
                    alt={prod.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transform transition-transform duration-500"
                    onError={(e) => {
                      // Fallback image if local file isn't uploaded yet
                      e.target.src = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/95 px-3 py-1 text-[9px] tracking-widest uppercase font-semibold text-slate-700">
                    {prod.material.split(',')[0]}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] tracking-widest text-[#C8A97E] uppercase font-semibold">
                      {prod.collection?.name || 'Luxury Collection'}
                    </span>
                    <h3 className="text-lg font-light tracking-wide text-primary uppercase line-clamp-1">{prod.title}</h3>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#0F172A]">
                      €{parseFloat(prod.price).toLocaleString('de-DE')}.00
                    </span>
                    <Link 
                      to={`/categories/${prod.category?.slug}`}
                      className="text-xs uppercase tracking-widest text-[#C8A97E] hover:text-[#AA8753] font-medium"
                    >
                      Inquire Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SLIDER SECTION */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-[#0F172A] text-white border-y border-slate-800">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <span className="text-[10px] tracking-[0.3em] text-[#C8A97E] uppercase font-semibold">CLIENT SATISFACTION</span>
            
            <div className="space-y-6">
              {testimonials.map((t, idx) => (
                <div key={t.id} className="space-y-4">
                  <div className="flex justify-center text-[#C8A97E]">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="#C8A97E" />)}
                  </div>
                  <p className="text-lg md:text-xl font-light italic leading-relaxed text-slate-300 font-serif">
                    "{t.content}"
                  </p>
                  <div>
                    <h4 className="text-xs font-semibold tracking-widest uppercase text-white">{t.clientName}</h4>
                    <p className="text-[10px] tracking-widest uppercase text-slate-500 mt-1">{t.clientTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CONCIERGE CONSULTATION REQUEST */}
      <section className="py-24 bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1E1B4B] text-white relative overflow-hidden">
        {/* Decorative elements to look premium */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8A97E]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C8A97E]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-stretch">
            
            {/* LEFT SIDE (60%): Carousel and Brand Trust Elements */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-12">
              <div className="space-y-4">
                <span className="text-[10px] tracking-[0.4em] text-[#C8A97E] uppercase font-semibold block">
                  Signature Spaces
                </span>
                <h2 className="text-3xl md:text-5xl font-extralight tracking-wider uppercase leading-tight font-display">
                  Transforming Spaces Into <span className="text-[#C8A97E] font-normal">Timeless</span> Masterpieces
                </h2>
                <p className="text-xs text-slate-400 font-sans max-w-xl leading-relaxed tracking-wider">
                  Our custom German-engineered installations blend precision with premium Italian aesthetics. Browse some of our recent luxury executions and request a design partners review.
                </p>
              </div>

              {/* IMAGE CAROUSEL WITH DYNAMIC SLIDES */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border border-slate-800/60 group shadow-2xl">
                {carouselSlides.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                      >
                        <img
                          src={carouselSlides[currentSlide].image}
                          alt={carouselSlides[currentSlide].title}
                          className="w-full h-full object-cover opacity-80"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600';
                          }}
                        />
                        
                        {/* Visual gradient overlay for title contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        
                        {/* Title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end">
                          <span className="text-[9px] tracking-[0.2em] text-[#C8A97E] uppercase font-semibold">
                            {carouselSlides[currentSlide].subtitle}
                          </span>
                          <h4 className="text-lg md:text-xl font-light text-white uppercase tracking-widest mt-1">
                            {carouselSlides[currentSlide].title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-sans">
                            {carouselSlides[currentSlide].location}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Left/Right manual arrows shown on hover */}
                    {carouselSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-[#C8A97E] text-white hover:text-slate-950 w-8 h-8 flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-[#C8A97E] text-white hover:text-slate-950 w-8 h-8 flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}

                    {/* Carousel Pagination Dots */}
                    {carouselSlides.length > 1 && (
                      <div className="absolute bottom-6 right-8 flex gap-2 z-20">
                        {carouselSlides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-1.5 h-1.5 transition-all duration-300 ${
                              currentSlide === idx ? 'bg-[#C8A97E] w-4' : 'bg-white/40'
                            }`}
                          ></button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center border border-slate-800/40">
                    <span className="text-[10px] tracking-widest uppercase text-slate-600 font-sans">Design Gallery Studio</span>
                  </div>
                )}
              </div>

              {/* Luxury trust signals / details */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#C8A97E] uppercase tracking-wider block">01 / German Engineered</span>
                  <p className="text-[9px] text-slate-400 font-sans leading-relaxed">Cabinetry, fittings, and movements crafted to the highest European industrial standards.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#C8A97E] uppercase tracking-wider block">02 / Tailor-made</span>
                  <p className="text-[9px] text-slate-400 font-sans leading-relaxed">Every piece customized down to the millimeter to perfectly suit your spatial dimensions.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#C8A97E] uppercase tracking-wider block">03 / Luxury Renders</span>
                  <p className="text-[9px] text-slate-400 font-sans leading-relaxed">Access 3D interior design mockups tailored for your villa architecture project.</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE (40%): Consultation form */}
            <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 md:p-10 flex flex-col justify-center shadow-2xl relative">
              <div className="space-y-2 mb-8">
                <span className="text-[9px] tracking-[0.3em] text-[#C8A97E] uppercase font-semibold block">SHOWROOM ENQUIRIES</span>
                <h3 className="text-2xl font-light uppercase tracking-widest text-white">REQUEST A CONSULTATION</h3>
                <div className="w-8 h-[1px] bg-[#C8A97E] mt-2"></div>
              </div>

              {inquiryStatus === 'success' && (
                <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs px-4 py-3 mb-6 text-center font-sans tracking-wide">
                  Showroom enquiry submitted successfully. A design partner will reach out within 24 hours.
                </div>
              )}

              {inquiryStatus === 'error' && (
                <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs px-4 py-3 mb-6 text-center font-sans">
                  Failed to submit request. Please verify connection to server.
                </div>
              )}

              <form onSubmit={handleInquirySubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="E.g., Dr. Andreas Fischer"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-[#C8A97E] focus:outline-none text-xs text-white rounded-none placeholder-slate-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="E.g., andreas@fischer-partners.de"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-[#C8A97E] focus:outline-none text-xs text-white rounded-none placeholder-slate-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Contact Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="E.g., +49 89 2019382"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-[#C8A97E] focus:outline-none text-xs text-white rounded-none placeholder-slate-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Message / Design Intent</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    placeholder="Briefly describe the dimensions, materials, or timelines of your project..."
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-[#C8A97E] focus:outline-none text-xs text-white rounded-none placeholder-slate-600 transition-colors"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold disabled:opacity-50 mt-2 font-display uppercase tracking-widest text-xs py-4"
                >
                  {loading ? 'Submitting request...' : 'SUBMIT PRIVATE REQUEST'}
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;

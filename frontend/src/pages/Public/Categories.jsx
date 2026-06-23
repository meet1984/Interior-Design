import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { Heart, ArrowRight, ArrowLeft, Grid, SlidersHorizontal, MessageSquare } from 'lucide-react';

export const Categories = () => {
  const { categorySlug, collectionSlug } = useParams();
  const { user, token } = useContext(AuthContext);
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null); // For inquiry modal
  const [modalOpen, setModalOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // 1. Fetch categories list if on root Categories page
  useEffect(() => {
    const fetchRootData = async () => {
      setLoading(true);
      try {
        if (!categorySlug) {
          const res = await API.get('/categories');
          if (res.data.success) setCategories(res.data.data);
        } else if (categorySlug && !collectionSlug) {
          // Fetch specific category and its collections
          const res = await API.get(`/categories/${categorySlug}`);
          if (res.data.success) setCategory(res.data.data);
        } else if (categorySlug && collectionSlug) {
          // Fetch products in specific collection
          const res = await API.get(`/collections/${collectionSlug}`);
          if (res.data.success) {
            setCollection(res.data.data);
            setProducts(res.data.data.products || []);
          }
        }
        
        // Fetch user favorites if logged in as client
        if (token && user?.role === 'client') {
          const favsRes = await API.get('/favorites');
          if (favsRes.data.success) {
            setFavorites(favsRes.data.data.map(f => f.productId));
          }
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
    if (!token) {
      alert("Please login to save favorite designs.");
      return;
    }
    try {
      const res = await API.post('/favorites', { productId });
      if (res.data.success) {
        if (res.data.favorited) {
          setFavorites([...favorites, productId]);
        } else {
          setFavorites(favorites.filter(id => id !== productId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenInquiry = (product) => {
    setActiveProduct(product);
    setModalOpen(true);
    setInquirySuccess(false);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmittingInquiry(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await API.post('/inquiries', {
        ...data,
        productId: activeProduct.id,
        subject: `Product Inquiry: ${activeProduct.title}`,
        inquiryType: 'product_inquiry'
      });
      if (res.data.success) {
        setInquirySuccess(true);
        
        // Open WhatsApp with prefilled message
        const whatsappNumber = "4915112345678"; // Dummy WhatsApp number
        const waMsg = `Hello SIGNATURE Munich, I'm interested in the product "${activeProduct.title}". My name is ${data.name}. Notes: ${data.message}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`, '_blank');

        setTimeout(() => {
          setModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: PRODUCT CATALOG (Collection Selected)
  // ==========================================
  if (categorySlug && collectionSlug && collection) {
    return (
      <div className="flex-1 pt-24 pb-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Navigation breadcrumb */}
          <Link 
            to={`/categories/${categorySlug}`}
            className="inline-flex items-center gap-2 text-[10px] tracking-widest text-[#C8A97E] hover:text-[#AA8753] uppercase font-semibold mb-8"
          >
            <ArrowLeft size={12} />
            <span>Back to collections</span>
          </Link>

          {/* Collection Header */}
          <div className="border-b border-slate-200 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between">
            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.25em] text-[#C8A97E] uppercase font-semibold">
                {collection.category?.name || 'Category'} Collection
              </span>
              <h2 className="text-3xl font-light uppercase tracking-widest text-primary">{collection.name}</h2>
              <p className="text-xs text-slate-500 font-sans max-w-xl leading-relaxed mt-2">
                {collection.description}
              </p>
            </div>
            <div className="text-xs text-slate-400 font-sans mt-4 md:mt-0">
              Showing {products.length} luxury design units
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200">
              <p className="text-xs text-slate-400 uppercase tracking-widest">No products currently loaded in this collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {products.map((prod) => {
                const isFav = favorites.includes(prod.id);
                return (
                  <div key={prod.id} className="bg-white border border-slate-200/50 shadow-sm flex flex-col group relative">
                    {/* Favorite Heart (Client only) */}
                    {user?.role === 'client' && (
                      <button 
                        onClick={() => handleFavoriteToggle(prod.id)}
                        className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Heart size={16} fill={isFav ? '#EF4444' : 'none'} className={isFav ? 'text-red-500' : ''} />
                      </button>
                    )}

                    {/* Image */}
                    <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
                      <img 
                        src={prod.thumbnail.startsWith('/') ? `${import.meta.env.VITE_API_URL}${prod.thumbnail}` : prod.thumbnail} 
                        alt={prod.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transform transition-transform duration-750"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] tracking-widest text-[#C8A97E] uppercase font-semibold">
                            {prod.material?.split(',')[0]}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 font-sans">
                            {prod.dimensions}
                          </span>
                        </div>
                        <h3 className="text-base font-medium uppercase tracking-wider text-primary line-clamp-1">{prod.title}</h3>
                        <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-3">
                          {prod.description}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[9px] tracking-widest text-slate-400 uppercase font-semibold">Price Estimate</span>
                          <span className="text-sm font-semibold text-slate-900 font-sans">
                            €{parseFloat(prod.price).toLocaleString('de-DE')}.00
                          </span>
                        </div>
                        <button 
                          onClick={() => handleOpenInquiry(prod)}
                          className="flex items-center gap-1.5 text-xs text-[#C8A97E] hover:text-[#AA8753] font-semibold uppercase tracking-wider"
                        >
                          <MessageSquare size={14} />
                          <span>Request Quotation</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* INQUIRY MODAL */}
        {modalOpen && activeProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-white p-8 border border-slate-100 shadow-2xl z-10 rounded-none animate-fadeIn">
              <div className="text-center mb-6">
                <span className="text-[9px] tracking-widest text-[#C8A97E] uppercase font-semibold">STUDIO ENQUIRY</span>
                <h3 className="text-xl font-light uppercase tracking-widest text-primary mt-1">Quotation Request</h3>
                <p className="text-xs text-slate-500 font-sans mt-1">Item: {activeProduct.title}</p>
              </div>

              {inquirySuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 text-center font-sans">
                  Quotation request submitted. A designer from SIGNATURE Munich will contact you shortly.
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={user ? `${user.firstName} ${user.lastName}` : ''}
                      placeholder="E.g., Dr. Andreas Fischer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#C8A97E] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={user ? user.email : ''}
                        placeholder="andreas@fischer.de"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#C8A97E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        defaultValue={user ? user.phone : ''}
                        placeholder="+49 89 2019"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#C8A97E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Design custom requests / notes</label>
                    <textarea
                      name="message"
                      required
                      rows="4"
                      placeholder="Specify customized sizing, matching colors, drawer options, or showroom review timeline..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#C8A97E] focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 uppercase tracking-widest text-[9px] font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submittingInquiry}
                      className="px-6 py-2 bg-[#C8A97E] hover:bg-[#AA8753] text-white uppercase tracking-widest text-[9px] font-semibold"
                    >
                      {submittingInquiry ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: COLLECTION LISTING (Category Selected)
  // ==========================================
  if (categorySlug && category) {
    return (
      <div className="flex-1 pt-24 pb-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Navigation breadcrumb */}
          <Link 
            to="/categories"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest text-[#C8A97E] hover:text-[#AA8753] uppercase font-semibold mb-8"
          >
            <ArrowLeft size={12} />
            <span>All Categories</span>
          </Link>

          {/* Category Header */}
          <div className="border-b border-slate-200 pb-8 mb-12">
            <span className="text-[10px] tracking-[0.25em] text-[#C8A97E] uppercase font-semibold">Interior Categories</span>
            <h2 className="text-4xl font-light uppercase tracking-widest text-primary mt-1">{category.name}</h2>
            <p className="text-xs text-slate-500 font-sans max-w-xl leading-relaxed mt-2">
              {category.description}
            </p>
          </div>

          {/* Collections Grid */}
          {category.collections?.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200">
              <p className="text-xs text-slate-400 uppercase tracking-widest">No collections currently configured in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.collections?.map((col) => (
                <div key={col.id} className="bg-white border border-slate-200/50 shadow-sm flex flex-col md:flex-row group">
                  <div className="w-full md:w-1/2 aspect-video md:aspect-auto md:h-64 bg-slate-100 overflow-hidden">
                    <img 
                      src={
                        col.image
                          ? (col.image.startsWith('/') ? `${import.meta.env.VITE_API_URL}${col.image}` : col.image)
                          : col.name.includes('Oak') 
                            ? 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=600'
                            : col.name.includes('Minimalist')
                              ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'
                              : 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=600'
                      }
                      alt={col.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transform transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                  <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[8px] tracking-widest text-[#C8A97E] uppercase font-semibold">Active Collection</span>
                      <h3 className="text-lg font-light uppercase tracking-wider text-primary">{col.name}</h3>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
                        {col.description}
                      </p>
                    </div>
                    
                    <Link 
                      to={`/categories/${categorySlug}/collections/${col.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-[#C8A97E] hover:text-[#AA8753] uppercase tracking-widest font-semibold pt-4"
                    >
                      <span>Explore Catalog</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: CATEGORIES OVERVIEW
  // ==========================================
  return (
    <div className="flex-1 pt-24 pb-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-16">
          <span className="text-[10px] tracking-[0.3em] text-[#C8A97E] uppercase font-semibold">STUDIO SHOWROOM</span>
          <h2 className="text-4xl font-light uppercase tracking-widest">DESIGN CATALOGS</h2>
          <div className="w-12 h-[1px] bg-[#C8A97E] mx-auto mt-4"></div>
          <p className="text-xs text-slate-500 font-sans mt-2 max-w-sm mx-auto">
            Enforcing strict German interior guidelines. Select a category below to explore its collections.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="group bg-white border border-slate-200/50 shadow-sm flex flex-col relative aspect-[3/4]">
              {/* Unsplash backgrounds */}
              <div className="absolute inset-0 bg-slate-950 overflow-hidden">
                <img 
                  src={
                    cat.image 
                      ? (cat.image.startsWith('/') ? `${import.meta.env.VITE_API_URL}${cat.image}` : cat.image)
                      : idx === 0 
                        ? 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
                        : idx === 1
                          ? 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800'
                          : 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800'
                  } 
                  alt={cat.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transform transition-transform duration-500" 
                  onError={(e) => {
                    e.target.src = idx === 0 
                      ? 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
                      : idx === 1
                        ? 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800'
                        : 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-[8px] tracking-widest text-[#C8A97E] uppercase font-semibold">CATALOG 0{idx+1}</span>
                <h3 className="text-2xl font-light uppercase tracking-widest text-white mt-1">{cat.name}</h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2 line-clamp-3">
                  {cat.description}
                </p>
                
                <Link 
                  to={`/categories/${cat.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-xs uppercase text-white hover:text-[#C8A97E] tracking-widest font-semibold"
                >
                  <span>Explore Collections</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Categories;

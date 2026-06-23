import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Heart, MessageSquare, Clock, Bookmark, HelpCircle } from 'lucide-react';

export const ClientDashboard = () => {
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const favsRes = await API.get('/favorites');
        const inqsRes = await API.get('/inquiries');

        if (favsRes.data.success) setFavorites(favsRes.data.data.slice(0, 3));
        if (inqsRes.data.success) setInquiries(inqsRes.data.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-display">
      {/* Welcome header */}
      <div>
        <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">My Design Studio Desk</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Track saved products and quotation inquires</p>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Saved Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recently Saved Designs</h3>
              <Link to="/client/favorites" className="text-[10px] uppercase text-[#C8A97E] hover:underline font-semibold flex items-center gap-1">
                <span>View all saved</span>
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200">
                <Bookmark size={20} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 uppercase tracking-widest">No saved designs yet.</p>
                <Link to="/categories" className="inline-block mt-3 text-[10px] uppercase text-[#C8A97E] border border-[#C8A97E] px-3 py-1 font-semibold hover:bg-[#C8A97E] hover:text-white transition-colors">
                  Explore catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {favorites.map((fav) => {
                  const prod = fav.product;
                  if (!prod) return null;
                  return (
                    <div key={fav.id} className="border border-slate-200 bg-white group flex flex-col justify-between">
                      <div className="aspect-video bg-slate-100 overflow-hidden relative">
                        <img 
                          src={prod.thumbnail.startsWith('/') ? `${import.meta.env.VITE_API_URL}${prod.thumbnail}` : prod.thumbnail} 
                          alt={prod.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transform transition-transform"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300"; }}
                        />
                      </div>
                      <div className="p-4 space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-[#C8A97E]">{prod.material?.split(',')[0]}</span>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 truncate">{prod.title}</h4>
                        <Link 
                          to={`/categories/${prod.category?.slug}/collections/${prod.collection?.slug}`}
                          className="text-[9px] uppercase tracking-wider text-[#C8A97E] font-semibold block pt-2 hover:underline"
                        >
                          Inquire Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inquiries */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">My Consultation Tracks</h3>
              <Link to="/client/inquiries" className="text-[10px] uppercase text-[#C8A97E] hover:underline font-semibold">
                <span>View all inquiries</span>
              </Link>
            </div>

            {inquiries.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-xs font-sans">No inquiries submitted yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 font-sans text-xs">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="py-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-semibold text-slate-800">{inq.subject}</span>
                        <span className="text-[8px] border px-1 py-0.2 uppercase tracking-widest text-[#C8A97E] border-[#C8A97E]">
                          {inq.inquiryType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Submitted: {new Date(inq.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${
                        inq.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {inq.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Studio Assistance Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <span className="text-[9px] tracking-widest text-[#C8A97E] uppercase font-semibold">STUDIO ASSISTANCE</span>
            <h3 className="text-lg font-light uppercase tracking-wider text-white">Private Concierge</h3>
            
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Your inquiries are monitored directly by our design coordinators. If you wish to expedite a drawing check, please reach out directly:
            </p>
            
            <div className="space-y-2 font-sans text-xs pt-4 text-slate-300">
              <p><strong>Phone:</strong> +49 (89) 123-4567</p>
              <p><strong>Email:</strong> concierge@signature.com</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-8 text-[9px] uppercase tracking-widest text-slate-500 font-sans">
            Showroom Hours: Mon-Sat by appointment.
          </div>
        </div>

      </div>
    </div>
  );
};
export default ClientDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { Heart, Trash2 } from 'lucide-react';

export const ClientFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await API.get('/favorites');
      if (res.data.success) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const res = await API.post('/favorites', { productId });
      if (res.data.success) {
        fetchFavorites();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-display">
      <div>
        <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Saved Design Board</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Your saved luxury furniture collections and customized pieces</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200">
          <Heart size={36} className="text-slate-200 mx-auto mb-4" />
          <p className="text-xs text-slate-400 uppercase tracking-widest">No saved items found on your board.</p>
          <Link to="/categories" className="btn-gold !py-2 mt-4 inline-block">
            Browse Luxury Catalogs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const prod = fav.product;
            if (!prod) return null;
            return (
              <div key={fav.id} className="bg-white border border-slate-200/50 shadow-sm flex flex-col group justify-between relative">
                <button
                  onClick={() => handleRemove(prod.id)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-red-50 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-red-500 transition-colors shadow-sm"
                  title="Remove from favorites"
                >
                  <Trash2 size={12} />
                </button>

                <div className="aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={getImageUrl(prod.thumbnail)}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-102 transform transition-transform"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400"; }}
                  />
                </div>

                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-widest text-[#C8A97E] font-semibold">
                      {prod.category?.name}
                    </span>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 line-clamp-1">{prod.title}</h3>
                    <p className="text-xs text-slate-400 font-sans line-clamp-2 mt-2 leading-relaxed">{prod.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">
                      €{parseFloat(prod.price).toLocaleString('de-DE')}.00
                    </span>

                    <Link
                      to={`/categories/${prod.category?.slug}/collections/${prod.collection?.slug}`}
                      className="text-[9px] uppercase tracking-widest text-[#C8A97E] hover:underline font-semibold"
                    >
                      Inquire Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ClientFavorites;

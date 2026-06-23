import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import API from '../../services/api';

export const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    try {
      const res = await API.get('/testimonials');
      if (res.data.success) {
        setTestimonials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await API.delete(`/testimonials/${id}`);
      if (res.data.success) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete testimonial', err);
      alert('Error deleting testimonial');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/testimonials/${id}/status`, { status });
      if (res.data.success) {
        setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, status } : t)));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#C8A97E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Testimonials Management</h2>
          <p className="text-sm text-slate-500">Review, approve, and delete client testimonials.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Review</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  No testimonials found.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 align-top">
                    <p className="font-semibold text-slate-800">{t.clientName}</p>
                    <p className="text-xs text-slate-500">{t.clientTitle}</p>
                  </td>
                  <td className="px-6 py-4 max-w-md align-top">
                    <p className="text-slate-600 line-clamp-3 italic">"{t.content}"</p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex text-[#C8A97E]">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right align-top space-x-2">
                    {t.status !== 'approved' && (
                      <button 
                        onClick={() => handleUpdateStatus(t.id, 'approved')}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {t.status !== 'rejected' && (
                      <button 
                        onClick={() => handleUpdateStatus(t.id, 'rejected')}
                        className="text-amber-600 hover:text-amber-800 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTestimonials;

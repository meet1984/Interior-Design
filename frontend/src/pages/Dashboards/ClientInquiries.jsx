import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Mail, Phone, Calendar, ClipboardList } from 'lucide-react';

export const ClientInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await API.get('/inquiries');
      if (res.data.success) {
        setInquiries(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

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
        <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">My Consultation Enquiries</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Review live quotation and design request tickets</p>
      </div>

      <div className="space-y-6">
        {inquiries.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200">
            <ClipboardList size={36} className="text-slate-200 mx-auto mb-4" />
            <p className="text-xs text-slate-400 uppercase tracking-widest">No enquiries submitted yet.</p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <div key={inq.id} className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              
              {/* Core Content */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-[8px] bg-slate-100 border text-[#C8A97E] border-[#C8A97E] px-2 py-0.5 uppercase tracking-widest font-semibold font-sans">
                    {inq.inquiryType}
                  </span>
                  
                  {inq.product && (
                    <span className="text-[9px] text-slate-400 font-sans uppercase">
                      Regarding: <strong>{inq.product.title}</strong>
                    </span>
                  )}
                  
                  <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-800">{inq.subject}</h3>
                  <p className="text-xs text-slate-500 font-sans whitespace-pre-wrap bg-slate-50 p-4 border border-slate-100">{inq.message}</p>
                </div>
              </div>

              {/* Status and Coordination */}
              <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between items-end shrink-0">
                <div className="text-right space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Inquiry Status</span>
                    <span className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider inline-block mt-1 ${
                      inq.status === 'pending' 
                        ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                        : inq.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {inq.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[9px] text-slate-400 font-sans">
                  {inq.assignee 
                    ? `Assigned coordinator: ${inq.assignee.firstName}` 
                    : 'Awaiting coordinator assignment'}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ClientInquiries;

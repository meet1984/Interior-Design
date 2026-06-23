import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { Mail, Phone, Calendar, ClipboardList, CheckSquare } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export const ManagerInquiries = () => {
  const { user } = useContext(AuthContext);
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchData = async () => {
    try {
      const inqRes = await API.get('/inquiries');
      if (inqRes.data.success) setInquiries(inqRes.data.data);
    } catch (err) {
      console.error('Fetch inquiries error:', err);
    }

    try {
      const usersRes = await API.get('/users/staff');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/inquiries/${id}`, { status });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleUpdateAssignee = async (id, assignedTo) => {
    try {
      const res = await API.put(`/inquiries/${id}`, { assignedTo });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Analytics Calculations
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const inDiscussionCount = inquiries.filter(i => i.status === 'in_discussion').length;
  const resolvedCount = inquiries.filter(i => i.status === 'resolved').length;
  const closedCount = inquiries.filter(i => i.status === 'closed').length;

  const filteredInquiries = activeFilter === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === activeFilter);

  return (
    <div className="space-y-6 font-display">
      <div>
        <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Showroom Inbox Queue</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Review quotations and design request consultations</p>
      </div>

      {/* Analytics Summary Panel as Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`p-4 flex flex-col items-center justify-center shadow-sm border transition-colors ${
            activeFilter === 'all' ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={`text-3xl font-light ${activeFilter === 'all' ? 'text-white' : 'text-slate-800'}`}>{totalCount}</span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold mt-1 ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>Total Requests</span>
        </button>

        <button 
          onClick={() => setActiveFilter('pending')}
          className={`p-4 flex flex-col items-center justify-center shadow-sm border transition-colors ${
            activeFilter === 'pending' ? 'bg-amber-500 border-amber-500' : 'bg-white border-amber-200 hover:bg-amber-50'
          }`}
        >
          <span className={`text-3xl font-light ${activeFilter === 'pending' ? 'text-white' : 'text-amber-600'}`}>{pendingCount}</span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold mt-1 ${activeFilter === 'pending' ? 'text-amber-100' : 'text-amber-600'}`}>Pending</span>
        </button>

        <button 
          onClick={() => setActiveFilter('in_discussion')}
          className={`p-4 flex flex-col items-center justify-center shadow-sm border transition-colors ${
            activeFilter === 'in_discussion' ? 'bg-blue-500 border-blue-500' : 'bg-white border-blue-200 hover:bg-blue-50'
          }`}
        >
          <span className={`text-3xl font-light ${activeFilter === 'in_discussion' ? 'text-white' : 'text-blue-600'}`}>{inDiscussionCount}</span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold mt-1 ${activeFilter === 'in_discussion' ? 'text-blue-100' : 'text-blue-600'}`}>In Discussion</span>
        </button>

        <button 
          onClick={() => setActiveFilter('resolved')}
          className={`p-4 flex flex-col items-center justify-center shadow-sm border transition-colors ${
            activeFilter === 'resolved' ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span className={`text-3xl font-light ${activeFilter === 'resolved' ? 'text-white' : 'text-emerald-600'}`}>{resolvedCount}</span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold mt-1 ${activeFilter === 'resolved' ? 'text-emerald-100' : 'text-emerald-600'}`}>Resolved</span>
        </button>

        <button 
          onClick={() => setActiveFilter('closed')}
          className={`p-4 flex flex-col items-center justify-center shadow-sm border transition-colors ${
            activeFilter === 'closed' ? 'bg-slate-500 border-slate-500' : 'bg-white border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span className={`text-3xl font-light ${activeFilter === 'closed' ? 'text-white' : 'text-slate-600'}`}>{closedCount}</span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold mt-1 ${activeFilter === 'closed' ? 'text-slate-200' : 'text-slate-500'}`}>Closed</span>
        </button>
      </div>

      <div className="space-y-6">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200">
            <p className="text-xs text-slate-400 uppercase tracking-widest">No inquiries found in this category.</p>
          </div>
        ) : (
          filteredInquiries.map((inq) => (
            <div key={inq.id} className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              
              {/* Inquiry Core Content */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-[8px] bg-slate-100 border text-[#C8A97E] border-[#C8A97E] px-2 py-0.5 uppercase tracking-widest font-semibold font-sans">
                    {inq.inquiryType}
                  </span>
                  
                  {inq.product && (
                    <span className="text-[9px] text-slate-400 font-sans uppercase">
                      Linked Item: <strong>{inq.product.title}</strong>
                    </span>
                  )}
                  
                  <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(inq.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-800">{inq.subject}</h3>
                  <p className="text-xs text-slate-600 font-sans whitespace-pre-wrap bg-slate-50 p-4 border border-slate-100">{inq.message}</p>
                </div>

                {/* Contact Card */}
                <div className="flex flex-wrap gap-6 text-[10px] font-sans text-slate-400 pt-2 border-t border-slate-100/50">
                  <span className="flex items-center gap-1.5">
                    <ClipboardList size={12} className="text-[#C8A97E]" />
                    <span className="font-semibold text-slate-700">{inq.name}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} className="text-[#C8A97E]" />
                    <a href={`mailto:${inq.email}`} className="hover:underline">{inq.email}</a>
                  </span>
                  {inq.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[#C8A97E]" />
                      <span>{inq.phone}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Assignment Panel */}
              <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between space-y-4 shrink-0">
                <div className="space-y-3">
                  {/* Status update dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Inquiry Status</label>
                    <select
                      value={inq.status}
                      onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                      className={`w-full px-3 py-1.5 bg-white border uppercase tracking-wider text-[9px] font-semibold focus:outline-none ${
                        inq.status === 'pending' 
                          ? 'border-amber-200 text-amber-600 bg-amber-50/20' 
                          : inq.status === 'resolved'
                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50/20'
                            : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_discussion">In Discussion</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Assignment dropdown */}
                  {user?.role === 'admin' && users.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Assigned Curation Agent</label>
                      <select
                        value={inq.assignedTo || ''}
                        onChange={(e) => handleUpdateAssignee(inq.id, e.target.value || null)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="text-right text-[9px] text-slate-400 font-sans">
                  {inq.assignee ? `Assigned to: ${inq.assignee.firstName} ${inq.assignee.lastName}` : 'Unassigned'}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ManagerInquiries;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { MessageSquare, FolderKanban, ShoppingBag, Plus, ArrowRight } from 'lucide-react';

export const ManagerDashboard = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const statsRes = await API.get('/admin/stats'); // reuse stats endpoint if roles permit, or mock safely
        const inquiriesRes = await API.get('/inquiries');

        if (statsRes.data.success) setStats(statsRes.data.data.kpis);
        if (inquiriesRes.data.success) setInquiries(inquiriesRes.data.data.slice(0, 5)); // show recent 5
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchManagerData();
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
        <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Workspace Overview</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Catalog curation and client consultation panel</p>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Active Products</span>
            <span className="text-2xl font-semibold font-sans text-slate-800">{stats?.totalProducts || 0}</span>
          </div>
          <ShoppingBag size={24} className="text-[#C8A97E]" />
        </div>

        <div className="bg-white border border-slate-200 p-6 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Portfolio Projects</span>
            <span className="text-2xl font-semibold font-sans text-slate-800">{stats?.totalProjects || 0}</span>
          </div>
          <FolderKanban size={24} className="text-indigo-500" />
        </div>

        <div className="bg-white border border-slate-200 p-6 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Customer Inquiries</span>
            <span className="text-2xl font-semibold font-sans text-slate-800">{stats?.totalInquiries || 0}</span>
          </div>
          <MessageSquare size={24} className="text-emerald-500" />
        </div>
      </div>

      {/* Quick Actions & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Col 1 & 2: Recent Inquiries */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inbox Queue</h3>
              <Link to="/manager/inquiries" className="text-[10px] uppercase text-[#C8A97E] hover:underline font-semibold flex items-center gap-1">
                <span>View inbox</span>
                <ArrowRight size={10} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 font-sans text-xs">
              {inquiries.length === 0 ? (
                <p className="text-center text-slate-400 py-6">Your inbox queue is currently empty.</p>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="py-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-semibold text-slate-800">{inq.name}</span>
                        <span className="text-[8px] bg-amber-50 text-[#C8A97E] border border-amber-200 px-1.5 py-0.5 uppercase tracking-widest">
                          {inq.inquiryType}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{inq.subject}</p>
                      <p className="text-[10px] text-slate-400">{inq.message.substring(0, 80)}...</p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                      <span className={`block text-[8px] font-semibold uppercase mt-1 ${
                        inq.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>{inq.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Col 3: Quick Shortcuts */}
        <div className="bg-slate-900 text-white p-6 shadow-sm flex flex-col justify-between border border-slate-800">
          <div className="space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C8A97E]">Millwork Quick Tools</h3>
            <div className="space-y-3">
              <Link 
                to="/manager/products" 
                className="flex items-center justify-between p-3.5 bg-slate-800 hover:bg-slate-700/80 transition-colors border border-slate-700/50"
              >
                <div className="text-xs uppercase tracking-widest font-medium">Add New Product</div>
                <Plus size={14} className="text-[#C8A97E]" />
              </Link>

              <Link 
                to="/manager/projects" 
                className="flex items-center justify-between p-3.5 bg-slate-800 hover:bg-slate-700/80 transition-colors border border-slate-700/50"
              >
                <div className="text-xs uppercase tracking-widest font-medium">Add New Project</div>
                <Plus size={14} className="text-[#C8A97E]" />
              </Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 mt-8">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 leading-relaxed">
              Design partners hold full curation rights. For role adjustments, please contact Elizabeth (Studio Admin).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ManagerDashboard;

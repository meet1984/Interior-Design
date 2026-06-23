import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get('/admin/logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
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
        <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">System Audit Trail</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Immutable track of administrative and client transactions</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              <th className="p-4">Log ID</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Transaction Event</th>
              <th className="p-4">Specification Payload</th>
              <th className="p-4">Origin IP</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="p-4 text-slate-400">#{log.id}</td>
                <td className="p-4 font-sans font-semibold text-slate-800">
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'SYSTEM'}
                  {log.user && <span className="block text-[9px] font-mono font-normal text-slate-400">{log.user.email}</span>}
                </td>
                <td className="p-4"><span className="bg-slate-100 border text-slate-700 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">{log.action}</span></td>
                <td className="p-4 font-sans text-slate-500 max-w-xs truncate" title={log.details}>{log.details ? log.details.replace(/"/g, '') : '-'}</td>
                <td className="p-4 text-slate-400">{log.ipAddress}</td>
                <td className="p-4 text-slate-400 font-sans">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminLogs;

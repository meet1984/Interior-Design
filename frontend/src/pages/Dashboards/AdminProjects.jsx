import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Edit, FileText, Image as ImageIcon, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-4 border mb-4 ${
      isError ? 'bg-red-50 border-red-300 text-red-800' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
    }`}>
      {isError ? <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" /> : <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
      <p className="text-xs font-sans flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100"><X size={16} /></button>
    </div>
  );
};

export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenEdit = (proj) => {
    setEditingProj(proj);
    setSelectedFiles([]);
    setDragActive(false);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProj(null);
    setSelectedFiles([]);
    setDragActive(false);
    setModalOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);

    // Append files from state if changed via drag & drop
    if (selectedFiles.length > 0) {
      formData.delete('media'); // Remove empty inputs
      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });
    }

    try {
      if (editingProj) {
        const res = await API.put(`/projects/${editingProj.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) setModalOpen(false);
      } else {
        const res = await API.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) setModalOpen(false);
      }
      fetchProjects();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Soft delete project "${title}"?`)) return;
    setDeletingId(id);
    clearToast();
    try {
      const res = await API.delete(`/projects/${id}`);
      if (res.data.success) {
        showToast('success', `Project "${title}" deleted successfully.`);
        fetchProjects();
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Delete failed.';
      if (status === 403) showToast('error', `Permission denied: ${msg}`);
      else if (!err.response) showToast('error', 'Cannot reach backend server on port 5000.');
      else showToast('error', `Error (${status}): ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Permanently remove this image file from the project?')) return;
    try {
      const res = await API.delete(`/projects/media/${mediaId}`);
      if (res.data.success) fetchProjects();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete media file.');
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light uppercase tracking-widest text-slate-800">Portfolio Desk</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Curate finished interior projects and media assets</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-gold !py-2 flex items-center gap-2"
        >
          <Plus size={14} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Persistent Toast */}
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      <div className="space-y-6">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex gap-4 items-center">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 border uppercase tracking-wider font-semibold font-sans">{proj.projectType}</span>
                <span className="text-xs text-slate-400 font-sans">{proj.location}</span>
              </div>
              <h3 className="text-xl font-light uppercase tracking-widest text-slate-800">{proj.title}</h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">{proj.description}</p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {proj.media?.map((m) => (
                  <div key={m.id} className="relative w-16 h-12 border border-slate-200 bg-slate-50 group">
                    <img src={`${import.meta.env.VITE_API_URL}${m.filePath}`} alt="" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeleteMedia(m.id)}
                      className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between items-end shrink-0">
              <div className="text-right space-y-1 text-xs font-sans text-slate-400">
                <span className="block"><strong>Client:</strong> {proj.clientName}</span>
                <span className="block"><strong>Completion:</strong> {proj.completionDate || 'N/A'}</span>
                <span className="block"><strong>Status:</strong> {proj.status}</span>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => handleOpenEdit(proj)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 uppercase tracking-widest text-[9px] font-semibold flex items-center gap-1 hover:border-[#C8A97E]"
                >
                  <Edit size={10} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(proj.id, proj.title)}
                  disabled={deletingId === proj.id}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 uppercase tracking-widest text-[9px] font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  {deletingId === proj.id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />} Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white p-8 border border-slate-100 shadow-2xl z-10 rounded-none overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-light uppercase tracking-widest text-primary mb-6">
              {editingProj ? 'Modify Project Portfolio Details' : 'Create Portfolio Entry'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Project Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingProj ? editingProj.title : ''}
                  placeholder="E.g., Munich Penthouse Kitchen"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingProj ? editingProj.location : ''}
                    placeholder="Bogenhausen, Munich"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    defaultValue={editingProj ? editingProj.clientName : ''}
                    placeholder="E.g., Dr. Andreas Fischer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Project Type</label>
                  <input
                    type="text"
                    name="projectType"
                    defaultValue={editingProj ? editingProj.projectType : ''}
                    placeholder="Residential Villa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Completion Date</label>
                  <input
                    type="date"
                    name="completionDate"
                    defaultValue={editingProj ? editingProj.completionDate : ''}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Status</label>
                  <select
                    name="status"
                    defaultValue={editingProj ? editingProj.status : 'completed'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="planning">Planning</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Upload Media Files (Images/Videos)</label>
                <div 
                  className={`relative border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[96px] ${
                    dragActive ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    name="media"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon size={18} className="text-slate-400 mb-2" />
                  {selectedFiles.length > 0 ? (
                    <p className="text-[10px] text-primary font-medium px-2">
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                    </p>
                  ) : (
                    <>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Drag & drop files</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">or click to browse</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Description / Scope Details</label>
                <textarea
                  name="description"
                  rows="4"
                  defaultValue={editingProj ? editingProj.description : ''}
                  placeholder="Detail logistics challenges, lighting systems configured, engineered materials..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 uppercase tracking-widest text-[9px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#C8A97E] hover:bg-[#AA8753] text-white uppercase tracking-widest text-[9px] font-semibold"
                >
                  {submitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminProjects;

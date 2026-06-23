import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Settings, Image, FileText, Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('global');
  
  // Global Settings State
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // About Content State
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutSuccess, setAboutSuccess] = useState(false);
  const [aboutSubmitting, setAboutSubmitting] = useState(false);

  // Services State
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch settings
      const resSettings = await API.get('/admin/settings');
      if (resSettings.data.success) {
        const dict = {};
        let aTitle = '';
        let aDesc = '';
        resSettings.data.data.forEach(s => {
          dict[s.key] = s.value;
          if (s.key === 'about_title') aTitle = s.value;
          if (s.key === 'about_description') aDesc = s.value;
        });
        setSettings(dict);
        if(aTitle) setAboutTitle(aTitle);
        if(aDesc) setAboutDescription(aDesc);
      }
      // Fetch services
      fetchServices();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const res = await API.get('/admin/services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setServicesLoading(false);
    }
  };

  // --- Global Settings Handlers ---
  const handleUpdateGlobal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await API.put('/admin/settings', { settings: data });
      if (res.data.success) setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  // --- About Content Handlers ---
  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    setAboutSubmitting(true);
    setAboutSuccess(false);
    try {
      const res = await API.put('/admin/content/about', {
        title: aboutTitle,
        description: aboutDescription
      });
      if (res.data.success) setAboutSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update about content');
    } finally {
      setAboutSubmitting(false);
    }
  };

  // --- Services Handlers ---
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setServices(items); // Optimistic UI update

    // Send to backend
    const orderedIds = items.map(item => item.id);
    try {
      await API.put('/admin/services/reorder', { orderedIds });
    } catch (err) {
      alert('Failed to reorder services');
      fetchServices(); // Revert on failure
    }
  };

  const handleDeleteService = async (id) => {
    if(!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await API.delete(`/admin/services/${id}`);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Convert switch/checkbox value
    const isActive = formData.get('isActive') === 'on';
    formData.set('isActive', isActive);

    try {
      if (editingService) {
        await API.put(`/admin/services/${editingService.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.post('/admin/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setServiceModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service');
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
    <div className="max-w-6xl mx-auto font-display">
      <div className="mb-8">
        <h2 className="text-xl font-light uppercase tracking-widest text-slate-800">Content Management</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Configure global properties, about content, and services</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors ${
            activeTab === 'global' ? 'border-b-2 border-[#C8A97E] text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings size={14} /> Global Properties
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors ${
            activeTab === 'about' ? 'border-b-2 border-[#C8A97E] text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={14} /> Website Content
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors ${
            activeTab === 'services' ? 'border-b-2 border-[#C8A97E] text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Image size={14} /> Services Management
        </button>
      </div>

      {/* GLOBAL SETTINGS TAB */}
      {activeTab === 'global' && (
        <div className="bg-white border border-slate-200 p-8 shadow-sm max-w-2xl mx-auto">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 mb-6 text-center font-sans">
              Studio configurations synced successfully.
            </div>
          )}
          <form onSubmit={handleUpdateGlobal} className="space-y-6 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Studio Name</label>
              <input type="text" name="site_name" defaultValue={settings.site_name || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Concierge Email</label>
                <input type="email" name="contact_email" defaultValue={settings.contact_email || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Contact Hotline</label>
                <input type="text" name="contact_phone" defaultValue={settings.contact_phone || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Physical Showroom Address</label>
              <input type="text" name="studio_address" defaultValue={settings.studio_address || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Showroom Access Hours</label>
              <input type="text" name="opening_hours" defaultValue={settings.opening_hours || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold tracking-widest uppercase text-xs">
              {submitting ? 'Saving...' : 'SYNC GLOBAL CONFIGURATIONS'}
            </button>
          </form>
        </div>
      )}

      {/* ABOUT US TAB */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 p-8 shadow-sm">
            <h3 className="text-sm uppercase tracking-widest font-semibold text-slate-800 mb-6">Edit Content</h3>
            {aboutSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 mb-6 text-center font-sans">
                About content updated successfully.
              </div>
            )}
            <form onSubmit={handleUpdateAbout} className="space-y-6 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Title</label>
                <input 
                  type="text" 
                  value={aboutTitle} 
                  onChange={(e) => setAboutTitle(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Description</label>
                <textarea 
                  rows={15}
                  value={aboutDescription} 
                  onChange={(e) => setAboutDescription(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]" 
                ></textarea>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">HTML tags like &lt;br&gt; or &lt;p&gt; are supported for line breaks.</p>
              </div>
              <button type="submit" disabled={aboutSubmitting} className="w-full py-3 bg-[#C8A97E] hover:bg-[#AA8753] text-white font-semibold tracking-widest uppercase text-xs">
                {aboutSubmitting ? 'Saving...' : 'PUBLISH CHANGES'}
              </button>
            </form>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200 p-8 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-sm uppercase tracking-widest font-semibold text-slate-800 mb-6">Live Preview</h3>
            <div className="flex-grow bg-white border border-slate-200 p-6 overflow-y-auto">
              {/* Preview mimicking About.jsx style */}
              <div className="text-center space-y-2 mb-8">
                <span className="text-[8px] tracking-[0.3em] text-[#C8A97E] uppercase font-semibold">OUR HERITAGE</span>
                <h2 className="text-2xl font-light uppercase tracking-widest text-slate-900">{aboutTitle || 'LUXURY AND PRECISION'}</h2>
                <div className="w-8 h-[1px] bg-[#C8A97E] mx-auto mt-4"></div>
              </div>
              <div 
                className="space-y-4 font-sans text-slate-600 text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: aboutDescription || '<p>Start typing to preview content...</p>' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase tracking-widest font-semibold text-slate-800">Services Configuration</h3>
            <button 
              onClick={() => { setEditingService(null); setServiceModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-slate-800"
            >
              <Plus size={14} /> Add Service
            </button>
          </div>

          {servicesLoading ? (
             <div className="py-8 text-center text-xs text-slate-400 uppercase tracking-widest">Loading services...</div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="services-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {services.map((service, index) => (
                      <Draggable key={service.id.toString()} draggableId={service.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center bg-slate-50 border border-slate-200 p-4 transition-all ${snapshot.isDragging ? 'shadow-lg border-[#C8A97E]' : ''}`}
                          >
                            <div {...provided.dragHandleProps} className="text-slate-400 hover:text-[#C8A97E] mr-4 cursor-grab">
                              <GripVertical size={18} />
                            </div>
                            
                            <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center mr-4 shrink-0">
                              {service.icon ? (
                                <img src={`${import.meta.env.VITE_API_URL}${service.icon}`} alt="" className="w-8 h-8 object-contain" />
                              ) : (
                                <Image size={16} className="text-slate-300" />
                              )}
                            </div>

                            <div className="flex-grow min-w-0 pr-4">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 truncate">{service.title}</h4>
                              <p className="text-[10px] text-slate-500 font-sans truncate mt-1">{service.description}</p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-1 ${service.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => { setEditingService(service); setServiceModalOpen(true); }}
                                  className="p-1.5 text-slate-400 hover:text-[#C8A97E] bg-white border border-slate-200"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteService(service.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Modal for Service */}
          {serviceModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white border border-slate-200 w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-slate-900">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <button onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <form id="service-form" onSubmit={handleServiceSubmit} className="space-y-5 font-sans text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Service Title</label>
                      <input 
                        type="text" 
                        name="title" 
                        required 
                        defaultValue={editingService?.title || ''} 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Description</label>
                      <textarea 
                        name="description" 
                        required 
                        rows={4}
                        defaultValue={editingService?.description || ''} 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#C8A97E]" 
                      ></textarea>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Icon / Image Upload</label>
                      <input 
                        type="file" 
                        name="icon" 
                        accept="image/*"
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-[#C8A97E] file:text-[9px] file:font-semibold file:uppercase file:tracking-widest file:bg-transparent file:text-[#C8A97E] hover:file:bg-[#C8A97E] hover:file:text-white file:cursor-pointer"
                      />
                      {editingService?.icon && (
                        <p className="text-[9px] text-emerald-600 uppercase tracking-wider mt-2">Current icon: {editingService.icon.split('/').pop()}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input 
                        type="checkbox" 
                        name="isActive" 
                        id="isActive"
                        defaultChecked={editingService ? editingService.isActive : true}
                        className="w-4 h-4 text-[#C8A97E] focus:ring-[#C8A97E] border-slate-300 rounded-none"
                      />
                      <label htmlFor="isActive" className="text-[10px] uppercase tracking-widest font-semibold text-slate-700">
                        Service is Active (Visible to public)
                      </label>
                    </div>
                  </form>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                  <button type="submit" form="service-form" className="w-full py-3 bg-[#C8A97E] hover:bg-[#AA8753] text-white font-semibold tracking-widest uppercase text-xs">
                    SAVE SERVICE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminSettings;

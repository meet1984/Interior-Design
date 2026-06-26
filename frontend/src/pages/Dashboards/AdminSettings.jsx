import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Settings, Image as ImageIcon, FileText, Plus, Edit2, Trash2,
  GripVertical, X, AlertCircle, CheckCircle, Loader2, ImageOff,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Toast — accessible, auto-roled by type. Replaces every alert()    */
/*  call from the original (six of them) with the same pattern used   */
/*  across Collections / Gallery / Logs / Products / Projects.        */
/* ------------------------------------------------------------------ */
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-lg border p-4 mb-6 transition-colors ${
        isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      {isError ? (
        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <p className="text-sm flex-1 leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-current opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

const TABS = [
  { id: 'global', label: 'Global Properties', icon: Settings },
  { id: 'about', label: 'Website Content', icon: FileText },
  { id: 'services', label: 'Services', icon: ImageIcon },
];

/* ------------------------------------------------------------------ */
/*  Service icon thumb with graceful fallback                         */
/* ------------------------------------------------------------------ */
const ServiceIconThumb = ({ src }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white">
      {!src || failed ? (
        <ImageOff size={16} className="text-stone-300" aria-hidden="true" />
      ) : (
        <img src={src} alt="" className="h-8 w-8 object-contain" onError={() => setFailed(true)} />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Service modal — focus trap + Escape-to-close                      */
/* ------------------------------------------------------------------ */
const ServiceModal = ({ editingService, submitting, onClose, onSubmit }) => {
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    firstFieldRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-stone-200 bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 p-6">
          <h3 id={titleId} className="text-base font-semibold text-stone-900">
            {editingService ? 'Edit Service' : 'New Service'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-stone-400 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="service-form" onSubmit={onSubmit} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label htmlFor="service-title" className="block text-xs font-medium text-stone-500">
                Service Title
              </label>
              <input
                ref={firstFieldRef}
                id="service-title"
                type="text"
                name="title"
                required
                defaultValue={editingService?.title || ''}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="service-description" className="block text-xs font-medium text-stone-500">
                Description
              </label>
              <textarea
                id="service-description"
                name="description"
                required
                rows={4}
                defaultValue={editingService?.description || ''}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="service-icon" className="block text-xs font-medium text-stone-500">
                Icon / Image
              </label>
              <input
                id="service-icon"
                type="file"
                name="icon"
                accept="image/*"
                className="block w-full text-xs text-stone-500 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-stone-700 hover:file:bg-stone-200"
              />
              {editingService?.icon && (
                <p className="text-xs text-stone-400">
                  Current: {editingService.icon.split('/').pop()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={editingService ? editingService.isActive : true}
                className="h-4 w-4 rounded border-stone-300 text-[#C1121F] focus:ring-[#C1121F]"
              />
              <label htmlFor="isActive" className="cursor-pointer text-xs font-medium text-stone-600">
                Active (visible to public)
              </label>
            </div>
          </form>
        </div>

        <div className="shrink-0 border-t border-stone-100 bg-stone-50 p-6">
          <button
            type="submit"
            form="service-form"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#C1121F] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9B0F18] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {submitting ? 'Saving…' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('global');

  // Global settings
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [globalToast, setGlobalToast] = useState({ type: '', message: '' });

  // About content
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutSubmitting, setAboutSubmitting] = useState(false);
  const [aboutToast, setAboutToast] = useState({ type: '', message: '' });

  // Services
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [servicesToast, setServicesToast] = useState({ type: '', message: '' });

  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const res = await API.get('/admin/services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setServicesToast({ type: 'error', message: err.response?.data?.message || 'Failed to load services.' });
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resSettings = await API.get('/admin/settings');
      if (resSettings.data.success) {
        const dict = {};
        let aTitle = '';
        let aDesc = '';
        resSettings.data.data.forEach((s) => {
          dict[s.key] = s.value;
          if (s.key === 'about_title') aTitle = s.value;
          if (s.key === 'about_description') aDesc = s.value;
        });
        setSettings(dict);
        if (aTitle) setAboutTitle(aTitle);
        if (aDesc) setAboutDescription(aDesc);
      }
      fetchServices();
    } catch (err) {
      console.error(err);
      setGlobalToast({ type: 'error', message: err.response?.data?.message || 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* --- Global settings --- */
  const handleUpdateGlobal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setGlobalToast({ type: '', message: '' });
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await API.put('/admin/settings', { settings: data });
      if (res.data.success) {
        setGlobalToast({ type: 'success', message: 'Studio configurations synced successfully.' });
      }
    } catch (err) {
      setGlobalToast({ type: 'error', message: err.response?.data?.message || 'Failed to save settings.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* --- About content --- */
  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    setAboutSubmitting(true);
    setAboutToast({ type: '', message: '' });
    try {
      const res = await API.put('/admin/content/about', {
        title: aboutTitle,
        description: aboutDescription,
      });
      if (res.data.success) {
        setAboutToast({ type: 'success', message: 'About content updated successfully.' });
      }
    } catch (err) {
      setAboutToast({ type: 'error', message: err.response?.data?.message || 'Failed to update about content.' });
    } finally {
      setAboutSubmitting(false);
    }
  };

  /* --- Services --- */
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setServices(items); // Optimistic UI update

    const orderedIds = items.map((item) => item.id);
    try {
      await API.put('/admin/services/reorder', { orderedIds });
    } catch (err) {
      setServicesToast({ type: 'error', message: 'Failed to reorder services.' });
      fetchServices(); // Revert on failure
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await API.delete(`/admin/services/${id}`);
      setServices(services.filter((s) => s.id !== id));
    } catch (err) {
      setServicesToast({ type: 'error', message: 'Failed to delete service.' });
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceSubmitting(true);
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
      setServicesToast({ type: 'success', message: 'Service saved successfully.' });
      fetchServices();
    } catch (err) {
      setServicesToast({ type: 'error', message: err.response?.data?.message || 'Failed to save service.' });
    } finally {
      setServiceSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-300" aria-hidden="true" />
        <span className="sr-only">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-stone-900">Content Management</h2>
        <p className="mt-0.5 text-sm text-stone-500">
          Configure global properties, about content, and services.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 border-b border-stone-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 ${
              activeTab === id
                ? 'border-[#C1121F] text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* GLOBAL SETTINGS TAB */}
      {activeTab === 'global' && (
        <div className="mx-auto max-w-2xl rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <Toast
            type={globalToast.type}
            message={globalToast.message}
            onClose={() => setGlobalToast({ type: '', message: '' })}
          />
          <form onSubmit={handleUpdateGlobal} className="space-y-5 text-sm">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-500">Studio Name</label>
              <div className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-500">
                Klare Home
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="contact_email" className="block text-xs font-medium text-stone-500">
                  Contact Email
                </label>
                <input
                  id="contact_email"
                  type="email"
                  name="contact_email"
                  defaultValue={settings.contact_email || ''}
                  className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact_phone" className="block text-xs font-medium text-stone-500">
                  Contact Phone
                </label>
                <input
                  id="contact_phone"
                  type="text"
                  name="contact_phone"
                  defaultValue={settings.contact_phone || ''}
                  className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="studio_address" className="block text-xs font-medium text-stone-500">
                Showroom Address
              </label>
              <input
                id="studio_address"
                type="text"
                name="studio_address"
                defaultValue={settings.studio_address || ''}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="opening_hours" className="block text-xs font-medium text-stone-500">
                Showroom Hours
              </label>
              <input
                id="opening_hours"
                type="text"
                name="opening_hours"
                defaultValue={settings.opening_hours || ''}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
              />
            </div>
            
            <div className="pt-4 pb-2">
              <h3 className="text-sm font-semibold text-stone-900 border-b border-stone-200 pb-2">Company Stats</h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">These statistics appear in the About section.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="stat_years" className="block text-xs font-medium text-stone-500">Years of Excellence</label>
                  <input id="stat_years" type="text" name="stat_years" defaultValue={settings.stat_years || '15+'} className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="stat_projects" className="block text-xs font-medium text-stone-500">Projects Completed</label>
                  <input id="stat_projects" type="text" name="stat_projects" defaultValue={settings.stat_projects || '500+'} className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="stat_awards" className="block text-xs font-medium text-stone-500">Design Awards</label>
                  <input id="stat_awards" type="text" name="stat_awards" defaultValue={settings.stat_awards || '12'} className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="stat_craftsmanship" className="block text-xs font-medium text-stone-500">Bespoke Craftsmanship</label>
                  <input id="stat_craftsmanship" type="text" name="stat_craftsmanship" defaultValue={settings.stat_craftsmanship || '100%'} className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#C1121F] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9B0F18] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {submitting ? 'Saving…' : 'Save Configuration'}
            </button>
          </form>
        </div>
      )}

      {/* ABOUT US TAB */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-stone-900">Edit Content</h3>
            <Toast
              type={aboutToast.type}
              message={aboutToast.message}
              onClose={() => setAboutToast({ type: '', message: '' })}
            />
            <form onSubmit={handleUpdateAbout} className="space-y-5 text-sm">
              <div className="space-y-1.5">
                <label htmlFor="about-title" className="block text-xs font-medium text-stone-500">
                  Title
                </label>
                <input
                  id="about-title"
                  type="text"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="about-description" className="block text-xs font-medium text-stone-500">
                  Description
                </label>
                <textarea
                  id="about-description"
                  rows={15}
                  value={aboutDescription}
                  onChange={(e) => setAboutDescription(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-900 focus:border-[#C1121F] focus:outline-none focus:ring-1 focus:ring-[#C1121F]"
                />
                <p className="text-xs text-stone-400">
                  HTML tags like &lt;br&gt; or &lt;p&gt; are supported for line breaks.
                </p>
              </div>
              <button
                type="submit"
                disabled={aboutSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#C1121F] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9B0F18] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                {aboutSubmitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                {aboutSubmitting ? 'Saving…' : 'Publish Changes'}
              </button>
            </form>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-stone-900">Live Preview</h3>
            <div className="flex-grow overflow-y-auto rounded-lg border border-stone-200 bg-white p-6">
              <div className="mb-8 space-y-2 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C1121F]">
                  Our Heritage
                </span>
                <h2 className="text-2xl font-semibold text-stone-900">
                  {aboutTitle || 'Luxury and Precision'}
                </h2>
                <div className="mx-auto mt-3 h-px w-8 bg-[#C1121F]" />
              </div>
              <div
                className="space-y-4 text-sm leading-relaxed text-stone-600"
                dangerouslySetInnerHTML={{ __html: aboutDescription || '<p>Start typing to preview content...</p>' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-semibold text-stone-900">Services</h3>
            <button
              onClick={() => { setEditingService(null); setServiceModalOpen(true); }}
              className="inline-flex items-center gap-2 rounded-md bg-[#C1121F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B0F18] focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <Plus size={15} aria-hidden="true" />
              Add Service
            </button>
          </div>

          <Toast
            type={servicesToast.type}
            message={servicesToast.message}
            onClose={() => setServicesToast({ type: '', message: '' })}
          />

          {servicesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-stone-300" aria-hidden="true" />
              <span className="sr-only">Loading services…</span>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
              <p className="text-sm font-medium text-stone-600">No services yet</p>
              <p className="mt-1 text-sm text-stone-400">Click "Add Service" to create the first one.</p>
            </div>
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
                            className={`flex items-center rounded-lg border bg-stone-50 p-4 transition-shadow ${
                              snapshot.isDragging ? 'border-[#C1121F] shadow-lg' : 'border-stone-200'
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              aria-label="Drag to reorder"
                              className="mr-4 cursor-grab text-stone-400 hover:text-[#C1121F] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                            >
                              <GripVertical size={18} aria-hidden="true" />
                            </div>

                            <ServiceIconThumb
                              src={getImageUrl(service.icon)}
                            />

                            <div className="min-w-0 flex-grow px-4">
                              <h4 className="truncate text-sm font-semibold text-stone-900">{service.title}</h4>
                              <p className="mt-0.5 truncate text-xs text-stone-500">{service.description}</p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                  service.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => { setEditingService(service); setServiceModalOpen(true); }}
                                  aria-label={`Edit ${service.title}`}
                                  className="rounded-md border border-stone-200 bg-white p-1.5 text-stone-400 transition-colors hover:border-[#C1121F] hover:text-[#C1121F] focus:outline-none focus:ring-2 focus:ring-red-100"
                                >
                                  <Edit2 size={14} aria-hidden="true" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service.id)}
                                  aria-label={`Delete ${service.title}`}
                                  className="rounded-md border border-stone-200 bg-white p-1.5 text-stone-400 transition-colors hover:border-red-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                                >
                                  <Trash2 size={14} aria-hidden="true" />
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

          {serviceModalOpen && (
            <ServiceModal
              editingService={editingService}
              submitting={serviceSubmitting}
              onClose={() => { setServiceModalOpen(false); setEditingService(null); }}
              onSubmit={handleServiceSubmit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
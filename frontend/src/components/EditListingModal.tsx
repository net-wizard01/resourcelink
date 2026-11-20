'use client';
import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { X, Save, Wrench, BookOpen, Hammer, Sprout, Upload, Image as ImageIcon } from 'lucide-react';

export default function EditListingModal({ listing, onClose, onSuccess }: { listing: any, onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description || '',
    category: listing.category,
    estimated_hours: listing.estimated_hours,
    is_urgent: listing.is_urgent || false
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(listing.image_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    let imageUrl = listing.image_url || '';

    try {
      // 1. Upload new image if selected
      if (imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
        setIsUploading(false);
      }

      // 2. Update the listing
      await api.put(`/listings/${listing.id}`, {
        ...form,
        image_url: imageUrl
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to update listing');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const categories = [
    { name: 'Tools', icon: <Wrench size={14} /> },
    { name: 'Tutoring', icon: <BookOpen size={14} /> },
    { name: 'Repairs', icon: <Hammer size={14} /> },
    { name: 'Gardening', icon: <Sprout size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button key={c.name} type="button" onClick={() => setForm({...form, category: c.name})}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${form.category === c.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
            <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
            <textarea required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Est. Hours</label>
              <input type="number" step="0.5" min="0.5" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.estimated_hours} onChange={e => setForm({...form, estimated_hours: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Photo</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              {imagePreview ? (
                <div className="relative w-full h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setForm({...form, image_url: ''}) }} 
                    className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full h-10 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-blue-400 transition-all text-xs">
                  <Upload size={14} className="mr-1" /> Upload
                </button>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <input type="checkbox" checked={form.is_urgent} onChange={e => setForm({...form, is_urgent: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 dark:border-slate-600" />
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">Mark as Urgent</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">Highlight this listing at the top of the feed.</p>
            </div>
          </label>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
            <button type="submit" disabled={isSaving || isUploading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
              <Save size={18} /> {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

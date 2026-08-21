import React, { useState, useEffect } from 'react';
import api, { API_URL } from '../services/api';
import type { Idol } from '../types';
import { Image as ImageIcon, Plus, X, Upload, Check, AlertCircle, Sparkles } from 'lucide-react';

const IdolCatalog: React.FC = () => {
  const [idols, setIdols] = useState<Idol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [idolId, setIdolId] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [clothingDescription, setClothingDescription] = useState<string>('');
  const [crownDescription, setCrownDescription] = useState<string>('');
  const [decorationDescription, setDecorationDescription] = useState<string>('');
  const [customization, setCustomization] = useState<string>('');
  const [otherDetails, setOtherDetails] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadIdols = async () => {
    try {
      setLoading(true);
      const response = await api.get('/idols');
      setIdols(response.data);
    } catch (error) {
      console.error('Error loading idols:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdols();
  }, []);

  // Handle Photo Picker
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIdol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !height || !price || !color) {
      setError('Model name, height, price, and color are required.');
      return;
    }
    if (!imageFile && !imagePreview) {
      setError('Please select or capture a photo of the idol.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      let finalImageUrl = imagePreview;

      // 1. Upload photo if a file is chosen
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // Construct full URL or store relative path. 
        // Relative path is better, we can prepend backend server URL in frontend.
        finalImageUrl = uploadRes.data.imageUrl;
      }

      // 2. Create the Idol record
      await api.post('/idols', {
        name,
        idolId: idolId || undefined,
        height: Number(height),
        price: Number(price),
        color,
        clothingDescription,
        crownDescription,
        decorationDescription,
        customization,
        otherDetails,
        imageUrl: finalImageUrl,
        availabilityStatus: 'Available',
      });

      // Clear Form and reload
      setName('');
      setIdolId('');
      setHeight('');
      setPrice('');
      setColor('');
      setClothingDescription('');
      setCrownDescription('');
      setDecorationDescription('');
      setCustomization('');
      setOtherDetails('');
      setImageFile(null);
      setImagePreview('');
      setShowAddForm(false);
      loadIdols();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create idol.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to prepend Server Base URL for uploaded images
  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const base = API_URL.replace('/api', '');
    return `${base}${url}`;
  };

  if (loading && idols.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-festive-saffron border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Idol Inventory</h1>
          <p className="text-sm text-slate-500">Manage available models and catalog pictures</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 bg-festive-saffron hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all btn-tap shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add Idol
          </button>
        )}
      </div>

      {/* Add Idol Drawer Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg relative space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-festive-saffron" />
              <span>Create New Idol Model</span>
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddIdol} className="space-y-4">
            {/* Image picker */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Idol Photo *</span>
              <div className="flex gap-4 items-center">
                {imagePreview ? (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-xl hover:border-festive-saffron flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-festive-saffron transition-all">
                    <Upload className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment" // Hints mobile browser to open rear camera
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="text-xs text-slate-400 max-w-[200px]">
                  Take a photo directly with your phone camera or select one from the gallery.
                </div>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Ganpati"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Idol ID / Code (Optional)</label>
                <input
                  type="text"
                  value={idolId}
                  onChange={(e) => setIdolId(e.target.value)}
                  placeholder="e.g. RG-26"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Height (ft) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 8500"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Color Palette *</label>
                <input
                  type="text"
                  required
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Red/Gold, Yellow/Orange"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Clothing / Vastra Description</label>
                <textarea
                  value={clothingDescription}
                  onChange={(e) => setClothingDescription(e.target.value)}
                  placeholder="e.g. Yellow dhoti with red borders"
                  rows={2}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Crown Description</label>
                <input
                  type="text"
                  value={crownDescription}
                  onChange={(e) => setCrownDescription(e.target.value)}
                  placeholder="e.g. Golden Peshwa Mukut"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Decoration Backing</label>
                <input
                  type="text"
                  value={decorationDescription}
                  onChange={(e) => setDecorationDescription(e.target.value)}
                  placeholder="e.g. Velvet arch with roses"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Other Details / Notes</label>
                <input
                  type="text"
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                  placeholder="e.g. Heavy clay model, requires two people"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-festive-saffron hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all btn-tap disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Save Model in Inventory'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Idol Cards List */}
      {idols.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-premium">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No idols in inventory</h3>
          <p className="text-sm text-slate-500 mt-1">
            Create your first model to begin recording bookings.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {idols.map((idol) => {
            const isBooked = idol.availabilityStatus !== 'Available';
            return (
              <div
                key={idol._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-premium hover:border-slate-300 flex flex-col justify-between"
              >
                {/* Photo container */}
                <div className="relative aspect-[4/3] bg-slate-100 border-b border-slate-100 overflow-hidden">
                  <img
                    src={resolveImageUrl(idol.imageUrl)}
                    alt={idol.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                        isBooked
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {idol.availabilityStatus === 'Available' ? 'Available' : 'Booked'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs truncate leading-tight">{idol.name}</h3>
                    {idol.idolId && <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">{idol.idolId}</p>}
                    
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-semibold mt-2.5">
                      <span>Ht: {idol.height} ft</span>
                      <span className="text-right truncate">Col: {idol.color.split('/')[0]}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-2.5 mt-2.5 flex justify-between items-center text-xs font-extrabold text-slate-900">
                    <span>₹{idol.price.toLocaleString()}</span>
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

export default IdolCatalog;
export { IdolCatalog };

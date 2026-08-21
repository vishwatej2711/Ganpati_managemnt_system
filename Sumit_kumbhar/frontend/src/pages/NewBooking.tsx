import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Idol } from '../types';
import { Camera, Image as ImageIcon, CheckCircle, AlertCircle, Save, X } from 'lucide-react';

const NewBooking: React.FC = () => {
  const navigate = useNavigate();

  // Load Inventory Idols
  const [availableIdols, setAvailableIdols] = useState<Idol[]>([]);
  const [loadingIdols, setLoadingIdols] = useState<boolean>(true);

  // Form Fields
  const [selectedIdolId, setSelectedIdolId] = useState<string>('');
  const [customIdolName, setCustomIdolName] = useState<string>(''); // For custom name entry
  
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('0');
  const [clothesDescription, setClothesDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // Photo file and local preview states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchIdols = async () => {
      try {
        setLoadingIdols(true);
        const res = await api.get('/idols');
        // Only allow selection of idols with availableCount > 0
        setAvailableIdols(res.data.filter((idol: Idol) => idol.availableCount > 0));
      } catch (err) {
        console.error('Failed to load idols:', err);
      } finally {
        setLoadingIdols(false);
      }
    };
    fetchIdols();
  }, []);

  // Convert uploaded image file to base64 preview string and store raw File object
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdolId) {
      setError('Please select an idol name from the inventory or choose Custom.');
      return;
    }
    if (selectedIdolId === 'custom' && !customIdolName.trim()) {
      setError('Please enter a custom idol name.');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('idolId', selectedIdolId);
      if (selectedIdolId === 'custom') {
        formData.append('customIdolName', customIdolName.trim());
      }
      if (customerName.trim()) formData.append('customerName', customerName.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      if (size.trim()) formData.append('size', size.trim());
      if (price !== '') formData.append('price', price);
      if (advanceAmount !== '') formData.append('advanceAmount', advanceAmount);
      if (clothesDescription.trim()) formData.append('clothesDescription', clothesDescription.trim());
      if (description.trim()) formData.append('description', description.trim());
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await api.post('/bookings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`Booking saved successfully. ID: ${response.data.bookingId}`);
      
      setTimeout(() => {
        navigate(`/bookings/${response.data._id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while saving the booking.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">New Booking</h1>
        <p className="text-sm text-slate-500 font-medium">Create a new customer order</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-100 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-700 border border-emerald-100 shadow-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Idol Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Idol Selection
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Idol *</label>
              {loadingIdols ? (
                <div className="h-10 animate-pulse bg-slate-100 rounded-xl"></div>
              ) : (
                <select
                  value={selectedIdolId}
                  onChange={(e) => setSelectedIdolId(e.target.value)}
                  required
                  className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                >
                  <option value="">-- Choose Idol Name --</option>
                  {availableIdols.map((idol) => (
                    <option key={idol._id} value={idol._id}>
                      {idol.name} ({idol.availableCount} available)
                    </option>
                  ))}
                  <option value="custom">✍️ Custom Idol (Not in Inventory)</option>
                </select>
              )}
            </div>

            {/* Custom name input when "custom" is selected */}
            {selectedIdolId === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Custom Idol Name *</label>
                <input
                  type="text"
                  required
                  value={customIdolName}
                  onChange={(e) => setCustomIdolName(e.target.value)}
                  placeholder="e.g. VIP Dagdusheth Replica"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Customer Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Customer Information (Optional)
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Patil"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Customized Idol Specifics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Idol Booking Details (Optional)
          </h2>
          <div className="grid gap-3 grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Size / Height</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 4 ft"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 7500"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Advance (₹)</label>
              <input
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                placeholder="e.g. 2000"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Clothes / Vastra Description</label>
              <input
                type="text"
                value={clothesDescription}
                onChange={(e) => setClothesDescription(e.target.value)}
                placeholder="e.g. Yellow dhoti with red shawl"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>



            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description / Notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any special requests or instructions..."
                rows={2}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Photo Capture */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Idol Photo (Optional)
          </h2>
          
          <div className="space-y-4">
            {photoPreview ? (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={photoPreview} alt="Captured preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview('');
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="border-2 border-dashed border-slate-200 rounded-2xl hover:border-festive-saffron p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-festive-saffron transition-all">
                  <Camera className="w-6 h-6" />
                  <span className="text-[11px] font-bold text-center">Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                <label className="border-2 border-dashed border-slate-200 rounded-2xl hover:border-festive-saffron p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-festive-saffron transition-all">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[11px] font-bold text-center">Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-festive-saffron hover:bg-orange-600 text-white font-extrabold rounded-xl text-sm transition-all btn-tap shadow-lg shadow-orange-500/30 disabled:opacity-50"
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Booking
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewBooking;

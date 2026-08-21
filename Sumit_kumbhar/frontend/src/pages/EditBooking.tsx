import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Booking } from '../types';
import { Camera, Image as ImageIcon, Save, ArrowLeft, AlertCircle, X } from 'lucide-react';

const EditBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Form Fields
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [clothesDescription, setClothesDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // Photo file, local preview, and clear indicators
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [clearPhoto, setClearPhoto] = useState<boolean>(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bookings/${id}`);
        const data: Booking = res.data;
        setBooking(data);

        // Prepopulate form fields
        setCustomerName(data.customerName || '');
        setPhone(data.phone || '');
        setSize(data.size || '');
        setPrice(data.price !== undefined ? String(data.price) : '');
        setAdvanceAmount(data.advanceAmount !== undefined ? String(data.advanceAmount) : '0');
        setClothesDescription(data.clothesDescription || '');
        setDescription(data.description || '');
        setPhotoPreview(data.photo || '');
        setPhotoFile(null);
        setClearPhoto(false);
      } catch (err: any) {
        console.error('Failed to load booking:', err);
        setError('Error loading booking data.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  // Convert uploaded image file to base64 preview string and store raw File object
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setClearPhoto(false); // since they uploaded a new image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const formData = new FormData();
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
      if (clearPhoto) {
        formData.append('clearPhoto', 'true');
      }

      await api.put(`/bookings/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/bookings/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating order.');
    } finally {
      setSaving(false);
    }
  };

  const remainingAmount = Number(price || 0) - Number(advanceAmount || 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-festive-saffron border-t-transparent"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center max-w-md mx-auto mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">Order Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">{error || 'This order details cannot be loaded.'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-festive-saffron text-white rounded-xl text-xs font-bold transition-all"
        >
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel Edit
        </button>
        <h1 className="text-sm font-bold text-slate-800">Edit Booking BK-{booking.bookingId}</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section A — Customer Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Customer Information
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section B — Customized Idol Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Idol Booking Details
          </h2>

          <div className="grid gap-3 grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Size / Height</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Advance Amount Paid (₹)</label>
              <input
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Remaining Balance (₹)</label>
              <div className="w-full px-3 py-3 bg-slate-100 border border-slate-100 rounded-xl text-slate-900 font-extrabold text-sm">
                ₹{remainingAmount.toLocaleString()}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Clothes / Vastra Description</label>
              <input
                type="text"
                value={clothesDescription}
                onChange={(e) => setClothesDescription(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>



            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description / Notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section C — Match Photo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-premium space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Idol Photo
          </h2>

          <div className="space-y-4">
            {photoPreview ? (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview('');
                    setClearPhoto(true);
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
                  <span className="text-[11px] font-bold text-center">Capture Photo</span>
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
                  <span className="text-[11px] font-bold text-center">Select Photo</span>
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

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-festive-saffron hover:bg-orange-600 text-white font-extrabold rounded-xl text-sm transition-all btn-tap shadow-lg shadow-orange-500/30"
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EditBooking;
export { EditBooking };

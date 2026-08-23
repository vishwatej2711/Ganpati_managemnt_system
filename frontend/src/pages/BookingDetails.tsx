import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import type { Booking } from '../types';
import { Calendar, Phone, ClipboardList, Edit3, ArrowLeft, AlertCircle, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [copying, setCopying] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will restore 1 count of this idol back to the inventory (if it was a stock item).')) {
      return;
    }
    
    setCancelling(true);
    try {
      const res = await api.put(`/bookings/${id}/cancel`);
      setBooking(res.data);
      alert('Booking cancelled successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };
  const copyImageToClipboard = async () => {
    if (!displayPhoto) return;
    setCopying(true);
    try {
      const response = await fetch(displayPhoto);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      alert('Photo copied to clipboard! You can paste (Ctrl+V) it in WhatsApp.');
    } catch (err) {
      console.error(err);
      alert('Could not copy image automatically. Please long-press/right-click the photo to copy it.');
    } finally {
      setCopying(false);
    }
  };
  const handleWhatsAppShare = async () => {
    if (!booking) return;
    setSharing(true);

    const dateFormatted = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    
    const shopName = user?.businessName || 'SK Arts';
    const textMessage = 
      `*${shopName} Booking Receipt*\n\n` +
      `🚩 *Booking ID:* ${booking.bookingId}\n` +
      `👤 *Customer Name:* ${booking.customerName || 'N/A'}\n` +
      (booking.clothesDescription ? `👗 *Vastra:* ${booking.clothesDescription}\n` : '') +
      (booking.description ? `📝 *Description:* ${booking.description}\n` : '') +
      (booking.advanceAmount ? `💰 *Advance Paid:* ₹${booking.advanceAmount.toLocaleString()}\n` : '') +
      (booking.price !== undefined && booking.advanceAmount !== undefined ? `💳 *Remaining Balance:* ₹${(booking.price - booking.advanceAmount).toLocaleString()}\n` : '') +
      `📅 *Booking Date:* ${dateFormatted}\n` +
      `🌸 *Status:* ${booking.status.toUpperCase()}\n\n` +
      `*Idol Details:*\n` +
      `🕉️ *Idol Name:* ${booking.idolName}\n` +
      (booking.size ? `📏 *Size / Height:* ${booking.size}\n` : '') +
      (booking.price ? `💵 *Total Price:* ₹${booking.price.toLocaleString()}\n` : '') +
      (displayPhoto ? `📷 *Idol Photo Preview:* ${displayPhoto}\n` : '') +
      `Thank you for booking with ${shopName}!`;

    const cleanPhone = (booking.phone || '').replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(textMessage)}`;
    
    setSharing(false);
    window.open(whatsappUrl, '_blank');
  };

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
        <h3 className="font-bold text-slate-800 text-base">Booking Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">{error || 'This booking does not exist.'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-festive-saffron text-white rounded-xl text-xs font-bold transition-all btn-tap"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isCancelled = booking.status === 'Cancelled';
  const displayPhoto = booking.photo || booking.idolPhoto;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <Link
            to={`/bookings/${booking._id}/edit`}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 border border-slate-200 rounded-xl text-xs transition-all btn-tap shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Details
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium p-5 space-y-6">
        
        {/* Ticket Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Ganpati Order</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{booking.bookingId}</h1>
          </div>
          <div>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border leading-tight uppercase ${
              isCancelled ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse'
            }`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Stored Photo */}
        {displayPhoto && (
          <div className="space-y-2">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {booking.photo ? 'Custom Idol Photo' : 'Inventory Model Photo'}
            </h2>
            <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <img
                src={displayPhoto}
                alt={booking.idolName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Detailed Attributes (Hides empty fields) */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            Order Details
          </h2>
          
          <div className="space-y-3.5 text-sm text-slate-700 font-semibold">
            <div className="flex justify-between border-b border-slate-50 pb-1.5">
              <span className="text-slate-400 font-medium">Selected Model</span>
              <span className="text-slate-900 font-bold">{booking.idolName}</span>
            </div>

            {booking.customerName && (
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Customer Name</span>
                <span className="text-slate-900 font-bold">{booking.customerName}</span>
              </div>
            )}

            {booking.phone && (
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <span className="text-slate-900 font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {booking.phone}
                </span>
              </div>
            )}

            {booking.size && (
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Size / Height</span>
                <span className="text-slate-900 font-bold">{booking.size}</span>
              </div>
            )}

            {booking.price !== undefined && (
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Price</span>
                <span className="text-slate-900 font-bold">₹{booking.price.toLocaleString()}</span>
              </div>
            )}

            {booking.advanceAmount !== undefined && (
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Advance Amount</span>
                <span className="text-slate-900 font-bold">₹{booking.advanceAmount.toLocaleString()}</span>
              </div>
            )}

            {booking.price !== undefined && booking.advanceAmount !== undefined && (
              <div className="flex justify-between border-b border-slate-50 pb-1.5 bg-slate-50 p-2 rounded-xl">
                <span className="text-slate-500 font-medium">Remaining Due</span>
                <span className="text-red-600 font-extrabold">
                  ₹{(booking.price - booking.advanceAmount).toLocaleString()}
                </span>
              </div>
            )}

            {booking.clothesDescription && (
              <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-medium text-xs leading-none">Clothes / Vastra</span>
                <span className="text-slate-900 font-bold leading-tight">{booking.clothesDescription}</span>
              </div>
            )}



            {booking.description && (
              <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-medium text-xs leading-none">Description / Notes</span>
                <span className="text-slate-900 font-bold leading-tight">{booking.description}</span>
              </div>
            )}

            <div className="flex justify-between pt-1 text-xs text-slate-400 font-semibold leading-none">
              <span>Booking Date</span>
              <span>{new Date(booking.bookingDate).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Options (WhatsApp Receipt & Cancellation) */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          {booking.phone && (
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleWhatsAppShare}
                disabled={sharing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold rounded-xl text-xs transition-all btn-tap flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
              >
                {sharing ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                    Generating Photo Link...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" /> Share Receipt via WhatsApp
                  </>
                )}
              </button>

              {displayPhoto && (
                <button
                  type="button"
                  onClick={copyImageToClipboard}
                  disabled={copying}
                  className="w-full py-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all btn-tap flex items-center justify-center gap-1.5"
                >
                  {copying ? 'Copying...' : '📋 Copy Photo to Clipboard (Paste in WhatsApp)'}
                </button>
              )}
            </div>
          )}

          {!isCancelled && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="w-full py-3 bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 font-bold rounded-xl text-xs transition-all btn-tap flex items-center justify-center gap-1.5"
            >
              Cancel Booking Order
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingDetails;
export { BookingDetails };

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Booking } from '../types';
import { Search, Calendar, ClipboardList } from 'lucide-react';

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Filter bookings locally by Customer Name, Booking ID, Custom Idol ID, Phone, or Model Name
  const filteredBookings = bookings.filter((booking) => {
    const customer = booking.customerName || '';
    const bookingId = booking.bookingId || '';
    const customIdolId = booking.customIdolId || '';
    const phone = booking.phone || '';
    const idolName = booking.idolName || '';
    const query = searchQuery.toLowerCase();
    return (
      customer.toLowerCase().includes(query) ||
      bookingId.toLowerCase().includes(query) ||
      customIdolId.toLowerCase().includes(query) ||
      phone.toLowerCase().includes(query) ||
      idolName.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-festive-saffron border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bookings</h1>
        <p className="text-sm text-slate-500">Search customer notebook entries</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm shadow-premium"
          placeholder="Search by customer, booking ID, phone, model, or custom ID..."
        />
      </div>

      {/* Bookings Card List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-premium">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No bookings found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try typing another customer name query.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              onClick={() => navigate(`/bookings/${booking._id}`)}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-premium hover:border-slate-300 transition-all cursor-pointer flex gap-4 active:bg-slate-50 btn-tap"
            >
              {booking.photo ? (
                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                  <img
                    src={booking.photo}
                    alt={booking.idolName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center text-slate-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {booking.customerName || 'Unnamed Booking'}
                      </h3>
                      {booking.customIdolId && (
                        <span className="inline-block mt-1 text-[11px] font-extrabold text-festive-saffron bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-lg">
                          Custom ID: {booking.customIdolId}
                        </span>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border leading-tight uppercase ${
                      booking.status === 'Cancelled' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{booking.bookingId}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Idol: {booking.idolName} {booking.size ? `(${booking.size})` : ''}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-900 border-t border-slate-50 pt-2 mt-2">
                  <span>Price: {booking.price ? `₹${booking.price.toLocaleString()}` : 'Not set'}</span>
                  {booking.phone && <span className="text-slate-400 font-semibold">{booking.phone}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsList;
export { BookingsList };

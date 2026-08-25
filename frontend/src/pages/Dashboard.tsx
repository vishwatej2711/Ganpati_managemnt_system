import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import type { Booking, DashboardStats } from '../types';
import { PlusSquare, Calendar, LayoutGrid, ClipboardList, AlertCircle, ShoppingBag, Layers, FolderArchive } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleDownloadBackup = async () => {
    try {
      setDownloading(true);
      const response = await api.get('/bookings/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings_backup.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert('Could not download backup. Please check connection.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadZipBackup = async () => {
    try {
      setDownloadingZip(true);
      const response = await api.get('/backups/download-zip', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings_backups_archive.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backups ZIP:', error);
      alert('Could not download backups ZIP. Please check connection.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-festive-saffron border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-5 py-6 text-white shadow-xl festive-bg">
        <div className="relative z-10 space-y-2">
          <h1 className="text-xl font-bold tracking-tight">🌸 Ganpati Management</h1>
        </div>
        <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full border-8 border-white/5 pointer-events-none"></div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/bookings/new"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-premium hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center gap-2 btn-tap"
          >
            <div className="p-3 bg-orange-50 text-festive-saffron rounded-full">
              <PlusSquare className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">New Booking</span>
          </Link>

          <Link
            to="/bookings"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-premium hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center gap-2 btn-tap"
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Search Bookings</span>
          </Link>

          <Link
            to="/inventory"
            className="col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-premium hover:border-slate-300 transition-all flex items-center gap-4 btn-tap"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-slate-800 block">Idol Inventory</span>
              <span className="text-[11px] text-slate-400 font-medium">Verify available counts and stock status</span>
            </div>
          </Link>

          <button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-premium hover:border-slate-300 transition-all flex items-center gap-4 text-left w-full btn-tap"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
              {downloading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
              ) : (
                <ClipboardList className="w-6 h-6" />
              )}
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-slate-800 block">Download Excel Backup</span>
              <span className="text-[11px] text-slate-400 font-medium">Export all bookings to Excel-compatible sheet</span>
            </div>
          </button>

          <button
            onClick={handleDownloadZipBackup}
            disabled={downloadingZip}
            className="col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-premium hover:border-slate-300 transition-all flex items-center gap-4 text-left w-full btn-tap disabled:opacity-50"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              {downloadingZip ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              ) : (
                <FolderArchive className="w-6 h-6" />
              )}
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-slate-800 block">Download Backups ZIP</span>
              <span className="text-[11px] text-slate-400 font-medium">Download zip of all CSV backups files</span>
            </div>
          </button>
        </div>
      </div>

      {/* Numerical Stats Summaries */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-premium flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-festive-saffron rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none mb-1">Total Bookings</span>
            <span className="text-base font-extrabold text-slate-900">{stats?.totalBookings || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-premium flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none mb-1">Idol Types</span>
            <span className="text-base font-extrabold text-slate-900">{stats?.totalIdolTypes || 0}</span>
          </div>
        </div>
      </div>

      {/* Latest Bookings List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Bookings</h2>
          <Link to="/bookings" className="text-xs font-bold text-festive-saffron hover:underline">
            View All
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-premium overflow-hidden">
          {!stats?.recentBookings || stats.recentBookings.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">
              No bookings recorded yet.
            </div>
          ) : (
            stats.recentBookings.map((booking) => (
              <div
                key={booking._id}
                onClick={() => navigate(`/bookings/${booking._id}`)}
                className="p-3.5 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-all active:bg-slate-100 select-none btn-tap"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {booking.photo ? (
                    <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                      <img src={booking.photo} alt={booking.idolName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center text-slate-400">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate leading-tight">
                      {booking.customerName || 'No Name'}
                    </p>
                    {booking.customIdolId && (
                      <span className="inline-block mt-0.5 text-[9px] font-extrabold text-festive-saffron bg-orange-50 border border-orange-50 px-1.5 py-0.2 rounded-md">
                        ID: {booking.customIdolId}
                      </span>
                    )}
                    <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">
                      {booking.idolName} {booking.size ? `• ${booking.size}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-100 uppercase ${booking.status === 'Cancelled' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-orange-50 text-orange-700'
                    }`}>
                    {booking.status}
                  </span>
                  <span className="block text-xs font-bold text-slate-400 leading-none mt-1">
                    {booking.bookingId}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard };

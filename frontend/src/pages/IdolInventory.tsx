import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Idol } from '../types';
import { LayoutGrid, Plus, X, Trash2, Edit2, AlertCircle, Check, Camera, Image as ImageIcon } from 'lucide-react';

const IdolInventory: React.FC = () => {
  const [idols, setIdols] = useState<Idol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Add Form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [availableCount, setAvailableCount] = useState<string>('0');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // Edit Form state
  const [editingIdol, setEditingIdol] = useState<Idol | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCount, setEditCount] = useState<string>('0');
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>('');
  const [clearEditPhoto, setClearEditPhoto] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const loadIdols = async () => {
    try {
      setLoading(true);
      const res = await api.get('/idols');
      setIdols(res.data);
    } catch (err) {
      console.error('Error loading inventory idols:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdols();
  }, []);

  // Convert files to base64 preview and store raw File object
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isEdit) {
        setEditPhotoFile(file);
        setClearEditPhoto(false);
      } else {
        setPhotoFile(file);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditPhotoPreview(reader.result as string);
        } else {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIdol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Idol model name is required.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('availableCount', availableCount);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await api.post('/idols', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Idol added successfully!');
      setName('');
      setAvailableCount('0');
      setPhotoFile(null);
      setPhotoPreview('');
      setShowAddForm(false);
      loadIdols();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add idol.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (idol: Idol) => {
    setEditingIdol(idol);
    setEditName(idol.name);
    setEditCount(String(idol.availableCount));
    setEditPhotoPreview(idol.photo || '');
    setEditPhotoFile(null);
    setClearEditPhoto(false);
  };

  const handleUpdateIdol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdol || !editName.trim()) {
      setError('Model name is required.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('availableCount', editCount);
      if (editPhotoFile) {
        formData.append('photo', editPhotoFile);
      }
      if (clearEditPhoto) {
        formData.append('clearPhoto', 'true');
      }

      await api.put(`/idols/${editingIdol._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Idol updated successfully!');
      setEditingIdol(null);
      loadIdols();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update idol.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIdol = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this idol type? This will not affect existing bookings.')) {
      return;
    }

    try {
      await api.delete(`/idols/${id}`);
      setSuccess('Idol deleted successfully.');
      loadIdols();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete idol.');
    }
  };

  const handleIncrement = async (id: string) => {
    try {
      const res = await api.post(`/idols/${id}/increment`);
      setIdols(idols.map(idol => idol._id === id ? res.data : idol));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecrement = async (id: string) => {
    try {
      const res = await api.post(`/idols/${id}/decrement`);
      setIdols(idols.map(idol => idol._id === id ? res.data : idol));
    } catch (err) {
      console.error(err);
    }
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
          <p className="text-sm text-slate-500">Track and manage available stock counts</p>
        </div>
        {!showAddForm && !editingIdol && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-festive-saffron hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all btn-tap shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add Idol
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-100 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-700 border border-emerald-100 shadow-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Idol Drawer Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Add New Idol Type</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddIdol} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Idol Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Raja Ganpati"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Available Count</label>
              <input
                type="number"
                value={availableCount}
                onChange={(e) => setAvailableCount(e.target.value)}
                placeholder="0"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            {/* Photo upload for base idol model */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Model Photo (Optional)</label>
              <div className="flex gap-4 items-center">
                {photoPreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview('');
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label className="w-16 h-16 border border-dashed border-slate-350 rounded-xl hover:border-festive-saffron flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-festive-saffron transition-all">
                      <Camera className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageChange(e, false)}
                        className="hidden"
                      />
                    </label>
                    <label className="w-16 h-16 border border-dashed border-slate-350 rounded-xl hover:border-festive-saffron flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-festive-saffron transition-all">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-festive-saffron hover:bg-orange-600 text-white font-extrabold rounded-xl text-sm transition-all btn-tap disabled:opacity-50"
            >
              Save Idol
            </button>
          </form>
        </div>
      )}

      {/* Edit Idol Drawer Form */}
      {editingIdol && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Edit Idol Type</h2>
            <button
              onClick={() => setEditingIdol(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUpdateIdol} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Idol Name *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Available Count</label>
              <input
                type="number"
                value={editCount}
                onChange={(e) => setEditCount(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-festive-saffron text-sm"
              />
            </div>

            {/* Photo upload for editing */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Model Photo (Optional)</label>
              <div className="flex gap-4 items-center">
                {editPhotoPreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditPhotoFile(null);
                        setEditPhotoPreview('');
                        setClearEditPhoto(true);
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label className="w-16 h-16 border border-dashed border-slate-350 rounded-xl hover:border-festive-saffron flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-festive-saffron transition-all">
                      <Camera className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageChange(e, true)}
                        className="hidden"
                      />
                    </label>
                    <label className="w-16 h-16 border border-dashed border-slate-350 rounded-xl hover:border-festive-saffron flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-festive-saffron transition-all">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm transition-all btn-tap disabled:opacity-50"
            >
              Update Idol
            </button>
          </form>
        </div>
      )}

      {/* Inventory Cards List */}
      {idols.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-premium">
          <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No idols in inventory</h3>
          <p className="text-sm text-slate-500 mt-1">
            Add your first model to begin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {idols.map((idol) => {
            const isOutOfStock = idol.availableCount <= 0;
            return (
              <div
                key={idol._id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-premium flex justify-between items-center gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {idol.photo ? (
                    <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={idol.photo} alt={idol.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-300">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-xs truncate leading-tight">{idol.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-slate-400 font-semibold leading-none">Available:</span>
                      {isOutOfStock ? (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 leading-none">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-900 leading-none">
                          {idol.availableCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adjust buttons and Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleDecrement(idol._id)}
                    className="w-9 h-9 bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 font-extrabold text-xs flex items-center justify-center btn-tap"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleIncrement(idol._id)}
                    className="w-9 h-9 bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 font-extrabold text-xs flex items-center justify-center btn-tap"
                  >
                    +
                  </button>

                  <div className="flex gap-0.5 ml-1 pl-1.5 border-l border-slate-100">
                    <button
                      onClick={() => handleStartEdit(idol)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteIdol(idol._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

export default IdolInventory;
export { IdolInventory };

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  GalleryHorizontalEnd,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CourseBanner } from '../types';
import { getAll, addItem, updateItem, deleteItem } from '../services/firestoreService';
import ImageUploadField from '../components/ImageUploadField';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const PAGE_SIZE = 10;

const COLLECTION = 'courseBanners';

export default function CourseBanners() {
  const [banners, setBanners] = useState<CourseBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CourseBanner | null>(null);

  const [formData, setFormData] = useState<Partial<CourseBanner>>({
    imageUrl: '',
    order: 1,
    active: true
  });

  const loadBanners = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAll<CourseBanner>(COLLECTION);
      setBanners(data);
    } catch (error) {
      console.error('Failed to load course banners', error);
      setErrorMessage('Failed to load course banners.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenModal = (banner?: CourseBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData(banner);
    } else {
      setEditingBanner(null);
      setFormData({
        imageUrl: '',
        order: banners.length + 1,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (editingBanner) {
        await updateItem<CourseBanner>(COLLECTION, editingBanner.id, formData);
      } else {
        await addItem<CourseBanner>(COLLECTION, {
          ...formData,
          createdAt: new Date().toISOString()
        } as CourseBanner);
      }
      await loadBanners();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save course banner', error);
      setErrorMessage('Failed to save course banner.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      setErrorMessage(null);
      try {
        await deleteItem(COLLECTION, id);
        await loadBanners();
      } catch (error) {
        console.error('Failed to delete course banner', error);
        setErrorMessage('Failed to delete course banner.');
      }
    }
  };

  const toggleStatus = async (banner: CourseBanner) => {
    setErrorMessage(null);
    try {
      await updateItem<CourseBanner>(COLLECTION, banner.id, { active: !banner.active });
      await loadBanners();
    } catch (error) {
      console.error('Failed to update banner status', error);
      setErrorMessage('Failed to update banner status.');
    }
  };

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  const { pagedItems: pagedBanners, currentPage, totalPages, setPage } = usePagination(sortedBanners, PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Banners</h1>
            <p className="text-slate-500 mt-1">Manage the rotating banner carousel at the top of the Courses page.</p>
          </div>
        </div>
        <div className="admin-card flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-game-teal rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Banners</h1>
          <p className="text-slate-500 mt-1">Manage the rotating banner carousel at the top of the Courses page.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {errorMessage}
        </div>
      )}

      <div className="admin-card">
        <div className="space-y-6">
          {pagedBanners.map((banner) => (
            <motion.div
              key={banner.id}
              layout
              className="group border border-slate-100 rounded-3xl overflow-hidden hover:border-game-teal transition-all duration-300 bg-white shadow-sm"
            >
              <div className="relative bg-slate-100 aspect-[3.5/1] overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={`Course banner #${banner.order}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-lg flex items-center gap-1.5 ${
                    banner.active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {banner.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-slate-900 border border-slate-200 shadow-sm flex items-center gap-1.5">
                  <ArrowUpDown className="w-3 h-3 text-game-teal" />
                  BANNER #{banner.order}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-50">
                <button
                  onClick={() => toggleStatus(banner)}
                  className={`btn-secondary text-xs px-4 ${banner.active ? 'text-slate-600' : 'text-game-teal'}`}
                >
                  {banner.active ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="p-3 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-2xl transition-all border border-transparent hover:border-game-teal/20"
                  >
                    <Edit2 className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {banners.length === 0 && (
            <div className="text-center py-24 bg-slate-50/50 rounded-[40px] border-3 border-dashed border-slate-100">
              <GalleryHorizontalEnd className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-500 font-bold text-lg">No course banners yet.</p>
              <button onClick={() => handleOpenModal()} className="btn-primary mx-auto mt-6">
                Create First Banner
              </button>
            </div>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 bg-white z-20">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
                  <p className="text-sm text-slate-500 mt-1">Set the artwork and position for the Courses page carousel.</p>
                </div>
                <button onClick={handleCloseModal} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                <ImageUploadField
                  label="Banner Image"
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="banners"
                  hint="Recommended: 1400 × 400 px wide banner (3.5:1)"
                  renderPreview={(value) => (
                    <img src={value} alt="Banner" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  )}
                />

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <label className="label-text mb-0">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="input-field w-24" min="1" required
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-colors ${formData.active ? 'bg-game-teal' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="font-bold text-slate-700">Active</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-4 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 py-4 justify-center text-base">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-4 justify-center text-base">
                    {editingBanner ? 'Save Changes' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

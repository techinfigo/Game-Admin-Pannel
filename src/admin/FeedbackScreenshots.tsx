/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, MessageSquare, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeedbackScreenshot } from '../types';
import { getAll, addItem, updateItem, deleteItem } from '../services/firestoreService';
import ImageUploadField from '../components/ImageUploadField';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const PAGE_SIZE = 12;
const COLLECTION = 'feedbackScreenshots';

const emptyForm: Partial<FeedbackScreenshot> = { imageUrl: '', caption: '' };

export default function FeedbackScreenshots() {
  const [items, setItems] = useState<FeedbackScreenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FeedbackScreenshot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<FeedbackScreenshot>>(emptyForm);

  const load = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAll<FeedbackScreenshot>(COLLECTION);
      setItems(data);
    } catch (error) {
      console.error('Failed to load feedback screenshots', error);
      setErrorMessage('Failed to load feedback screenshots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (it?: FeedbackScreenshot) => {
    if (it) { setEditing(it); setFormData(it); }
    else { setEditing(null); setFormData(emptyForm); }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.imageUrl) {
      setErrorMessage('Please upload a screenshot image first.');
      return;
    }
    try {
      if (editing) {
        await updateItem<FeedbackScreenshot>(COLLECTION, editing.id, formData);
      } else {
        await addItem<FeedbackScreenshot>(COLLECTION, { ...formData, createdAt: new Date().toISOString() } as FeedbackScreenshot);
      }
      await load();
      closeModal();
    } catch (error) {
      console.error('Failed to save feedback screenshot', error);
      setErrorMessage('Failed to save feedback screenshot.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this feedback screenshot?')) {
      setErrorMessage(null);
      try {
        await deleteItem(COLLECTION, id);
        await load();
      } catch (error) {
        console.error('Failed to delete feedback screenshot', error);
        setErrorMessage('Failed to delete feedback screenshot.');
      }
    }
  };

  const filtered = items.filter(it => (it.caption || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const { pagedItems, currentPage, totalPages, setPage } = usePagination(filtered, PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Feedback Screenshots</h1>
          <p className="text-slate-500 mt-1">WhatsApp / feedback screenshots shown in the phone slider on the Reviews page.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Screenshot
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">{errorMessage}</div>
      )}

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by caption..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-game-teal rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No feedback screenshots yet. Click "Add Screenshot" to upload one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {pagedItems.map((it) => (
              <motion.div
                key={it.id}
                layout
                className="group admin-card p-0 overflow-hidden hover:border-game-teal transition-all duration-300 flex flex-col"
              >
                <div className="relative overflow-hidden bg-slate-100 aspect-[9/16]">
                  <img
                    src={it.imageUrl}
                    alt={it.caption || 'Feedback screenshot'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                  {it.caption && <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">{it.caption}</p>}
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => openModal(it)} className="p-1.5 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(it.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Screenshot' : 'Add Feedback Screenshot'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <ImageUploadField
                  label="Screenshot Image"
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="feedback"
                  hint="The WhatsApp / feedback screenshot. Portrait images look best (phone shape)."
                  previewClassName="w-24 h-40"
                />
                <div>
                  <label className="label-text">Caption (optional)</label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    className="input-field min-h-[70px]"
                    placeholder="e.g. Cracked GATE Mechanical with Gaurav Babu Sir's mentorship!"
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Add Screenshot'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

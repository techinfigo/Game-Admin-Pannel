/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Lightbulb,
  Edit2,
  Trash2,
  X,
  Youtube,
  ExternalLink,
  PlayCircle,
  Tag as TagIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StrategyVideo } from '../types';
import { getAll, addItem, updateItem, deleteItem } from '../services/firestoreService';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const PAGE_SIZE = 12;
const COLLECTION = 'strategyVideos';

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
function getYoutubeThumbnail(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const emptyForm: Partial<StrategyVideo> = { title: '', category: '', youtubeUrl: '' };

export default function StrategyVideos() {
  const [videos, setVideos] = useState<StrategyVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<StrategyVideo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<StrategyVideo>>(emptyForm);

  const load = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAll<StrategyVideo>(COLLECTION);
      setVideos(data);
    } catch (error) {
      console.error('Failed to load strategy videos', error);
      setErrorMessage('Failed to load strategy videos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (v?: StrategyVideo) => {
    if (v) { setEditing(v); setFormData(v); }
    else { setEditing(null); setFormData(emptyForm); }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!extractYoutubeId(formData.youtubeUrl || '')) {
      setErrorMessage('Please enter a valid YouTube link (e.g. https://youtu.be/...).');
      return;
    }
    try {
      if (editing) {
        await updateItem<StrategyVideo>(COLLECTION, editing.id, formData);
      } else {
        await addItem<StrategyVideo>(COLLECTION, { ...formData, createdAt: new Date().toISOString() } as StrategyVideo);
      }
      await load();
      closeModal();
    } catch (error) {
      console.error('Failed to save strategy video', error);
      setErrorMessage('Failed to save strategy video.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this strategy video?')) {
      setErrorMessage(null);
      try {
        await deleteItem(COLLECTION, id);
        await load();
      } catch (error) {
        console.error('Failed to delete strategy video', error);
        setErrorMessage('Failed to delete strategy video.');
      }
    }
  };

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const { pagedItems, currentPage, totalPages, setPage } = usePagination(filtered, PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Strategy Videos</h1>
          <p className="text-slate-500 mt-1">Manage the videos shown on the website's Hacks &amp; Strategies page. The category becomes a filter tab.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Video
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
              placeholder="Search by title or category..."
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
            <Lightbulb className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No strategy videos yet. Click "Add Video" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedItems.map((v) => (
              <motion.div
                key={v.id}
                layout
                className="group admin-card p-0 overflow-hidden hover:border-game-teal transition-all duration-300 flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-900">
                  <img
                    src={getYoutubeThumbnail(v.youtubeUrl) || 'https://placehold.co/480x270?text=No+Thumbnail'}
                    alt={v.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/480x270?text=No+Thumbnail'; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="w-12 h-12 text-white opacity-50 group-hover:opacity-90 transition-opacity drop-shadow-lg" />
                  </div>
                  {v.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 bg-game-teal text-white text-[9px] font-bold uppercase rounded-md shadow-lg flex items-center gap-1.5">
                        <TagIcon className="w-2.5 h-2.5" /> {v.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 group-hover:text-game-teal transition-colors">{v.title}</h3>
                    <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider">
                      <Youtube className="w-3.5 h-3.5" /> Watch <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-4 mt-3 border-t border-slate-50">
                    <button onClick={() => openModal(v)} className="p-1.5 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Strategy Video' : 'Add Strategy Video'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="label-text">Video Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="e.g. How to do Parallel Revision?" required />
                </div>
                <div>
                  <label className="label-text">Category (becomes a filter tab)</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" placeholder="e.g. Exam Strategy, Revision, Time Management" required />
                  <p className="text-[11px] text-slate-400 mt-1">Videos with the same category are grouped under one tab on the website.</p>
                </div>
                <div>
                  <label className="label-text">YouTube URL</label>
                  <div className="relative">
                    <input type="url" value={formData.youtubeUrl} onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })} className="input-field pl-10" placeholder="https://youtu.be/..." required />
                    <Youtube className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">The thumbnail is pulled from YouTube automatically.</p>
                </div>
                {extractYoutubeId(formData.youtubeUrl || '') && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
                    <img src={getYoutubeThumbnail(formData.youtubeUrl || '') || ''} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update Video' : 'Add Video'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

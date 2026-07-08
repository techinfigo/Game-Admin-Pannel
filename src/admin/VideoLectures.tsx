/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Video, 
  Edit2, 
  Trash2, 
  X, 
  Youtube,
  GraduationCap,
  PlayCircle,
  ExternalLink,
  Image as ImageIcon,
  Clock,
  Eye,
  Tag as TagIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoLecture } from '../types';

const initialLectures: VideoLecture[] = [
  {
    id: '1',
    title: 'How to Crack GATE 2025',
    subtitle: 'Proven Strategy by Gaurav Babu Sir',
    tag: 'GATE Strategy',
    duration: '14:15',
    views: '245k',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    examTag: 'GATE',
    description: 'Learn the most important topics in Engineering Mathematics that carry high weightage in GATE.',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  },
  {
    id: '2',
    title: 'Basic Mechanics Intro',
    subtitle: 'Concepts by Vikram Singh Sir',
    tag: 'Basic Mechanics',
    duration: '22:40',
    views: '112k',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    examTag: 'SSC-JE',
    description: 'Live interactive session on Thermodynamics and Fluid Mechanics for SSC-JE aspirants.',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  }
];

export default function VideoLectures() {
  const [lectures, setLectures] = useState<VideoLecture[]>(initialLectures);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<VideoLecture | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<VideoLecture>>({
    title: '',
    subtitle: '',
    tag: '',
    duration: '',
    views: '',
    examTag: '',
    youtubeUrl: '',
    description: '',
    thumbnailUrl: ''
  });

  const handleOpenModal = (lecture?: VideoLecture) => {
    if (lecture) {
      setEditingLecture(lecture);
      setFormData(lecture);
    } else {
      setEditingLecture(null);
      setFormData({
        title: '',
        subtitle: '',
        tag: '',
        duration: '',
        views: '',
        examTag: '',
        youtubeUrl: '',
        description: '',
        thumbnailUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLecture(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLecture) {
      // TODO: connect to Firestore
      setLectures(prev => prev.map(l => l.id === editingLecture.id ? { ...l, ...formData } as VideoLecture : l));
    } else {
      // TODO: connect to Firestore
      const newLecture = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as VideoLecture;
      setLectures(prev => [newLecture, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this video lecture?')) {
      // TODO: connect to Firestore
      setLectures(prev => prev.filter(l => l.id !== id));
    }
  };

  const filteredLectures = lectures.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.examTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Free Video Lectures</h1>
          <p className="text-slate-500 mt-1">Manage YouTube video lectures categorized by examination types.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Video
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search by title or exam..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLectures.map((lecture) => (
            <motion.div 
              key={lecture.id}
              layout
              className="group admin-card p-0 overflow-hidden hover:border-game-teal transition-all duration-300 flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-900">
                <img 
                  src={lecture.thumbnailUrl || `https://img.youtube.com/vi/${lecture.youtubeUrl.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`} 
                  alt={lecture.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 bg-game-teal text-white text-[10px] font-bold uppercase rounded-lg shadow-lg flex items-center gap-2">
                    <TagIcon className="w-3 h-3" />
                    {lecture.tag}
                  </span>
                  {lecture.examTag && (
                    <span className="px-3 py-1 bg-white text-slate-900 text-[10px] font-bold uppercase rounded-lg shadow-lg flex items-center gap-2">
                      <GraduationCap className="w-3 h-3" />
                      {lecture.examTag}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {lecture.duration}
                  </div>
                  <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                    <Eye className="w-3 h-3" />
                    {lecture.views}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1 group-hover:text-game-teal transition-colors">
                    {lecture.title}
                  </h3>
                  <p className="text-xs text-game-teal font-bold mb-3 line-clamp-1 opacity-80">{lecture.subtitle}</p>
                  {lecture.description && (
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {lecture.description}
                    </p>
                  )}
                  <a 
                    href={lecture.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider"
                  >
                    <Youtube className="w-4 h-4" />
                    Watch on YouTube
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleOpenModal(lecture)}
                    className="p-2 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(lecture.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{editingLecture ? 'Edit Video Lecture' : 'Add New Video'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="label-text">Video Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field" placeholder="e.g. How to Crack GATE 2025" required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Subtitle / Author Line</label>
                    <input 
                      type="text" 
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="input-field" placeholder="e.g. Proven Strategy by Gaurav Babu Sir" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Topic Label / Tag</label>
                    <input 
                      type="text" 
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="input-field" placeholder="e.g. GATE Strategy" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Exam Category (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.examTag}
                      onChange={(e) => setFormData({ ...formData, examTag: e.target.value })}
                      className="input-field" placeholder="e.g. GATE" 
                    />
                  </div>
                  <div>
                    <label className="label-text">Duration</label>
                    <input 
                      type="text" 
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="input-field" placeholder="e.g. 14:15" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Views Count</label>
                    <input 
                      type="text" 
                      value={formData.views}
                      onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                      className="input-field" placeholder="e.g. 245k" required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">YouTube URL</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.youtubeUrl}
                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                        className="input-field pl-10" placeholder="https://youtube..." required 
                      />
                      <Youtube className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Thumbnail URL (Optional)</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        className="input-field pl-10" placeholder="Custom image URL..." 
                      />
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">If left blank, YouTube auto-thumbnail will be used.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Description (Optional)</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field min-h-[80px]" placeholder="Briefly describe the video content..." 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {editingLecture ? 'Update Video' : 'Add to List'}
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

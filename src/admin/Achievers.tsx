/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Trophy, User, Edit2, Trash2, X, Image as ImageIcon, GraduationCap, Youtube, Video, Calendar, MapPin, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Achiever } from '../types';

const initialAchievers: Achiever[] = [
  {
    id: '1',
    type: 'GATE Topper',
    name: 'Rahul Sharma',
    exam: 'GATE 2024',
    achievement: 'AIR 12',
    college: 'IIT Ropar',
    year: '2024',
    youtubeUrl: 'https://youtube.com/shorts/xyz',
    photoUrl: 'https://i.pravatar.cc/150?u=rahul',
    quote: 'GAME Academy helped me stay consistent with my preparation.'
  },
  {
    id: '2',
    type: 'Job Selection',
    name: 'Priya Singh',
    exam: 'CPWD · 2023',
    achievement: 'Junior Engineer (Civil)',
    college: 'NIT Jaipur',
    year: '2023',
    youtubeUrl: '',
    photoUrl: 'https://i.pravatar.cc/150?u=priya',
    quote: 'The test series is highly accurate compared to the actual exam.'
  }
];

export default function Achievers() {
  const [achievers, setAchievers] = useState<Achiever[]>(initialAchievers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchiever, setEditingAchiever] = useState<Achiever | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Achiever>>({
    type: 'GATE Topper',
    name: '',
    exam: '',
    achievement: '',
    college: '',
    year: '',
    youtubeUrl: '',
    photoUrl: '',
    quote: ''
  });

  const handleOpenModal = (achiever?: Achiever) => {
    if (achiever) {
      setEditingAchiever(achiever);
      setFormData(achiever);
    } else {
      setEditingAchiever(null);
      setFormData({
        type: 'GATE Topper',
        name: '',
        exam: '',
        achievement: '',
        college: '',
        year: '',
        youtubeUrl: '',
        photoUrl: '',
        quote: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAchiever(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAchiever) {
      // TODO: connect to Firestore
      setAchievers(prev => prev.map(a => a.id === editingAchiever.id ? { ...a, ...formData } as Achiever : a));
    } else {
      // TODO: connect to Firestore
      const newAchiever = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as Achiever;
      setAchievers(prev => [newAchiever, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this achiever?')) {
      // TODO: connect to Firestore
      setAchievers(prev => prev.filter(a => a.id !== id));
    }
  };

  const filteredAchievers = achievers.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.exam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Achievers & Reviews</h1>
          <p className="text-slate-500 mt-1">Showcase successful students and their testimonials.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Achiever
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search achievers by name or exam..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievers.map((achiever) => (
            <motion.div 
              key={achiever.id}
              layout
              className="group admin-card p-0 overflow-hidden hover:border-game-teal transition-all duration-300 relative"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                      <img src={achiever.photoUrl || 'https://placehold.co/150?text=No+Photo'} alt={achiever.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-game-gold rounded-lg flex items-center justify-center text-white border-2 border-white">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-game-teal/10 text-game-teal text-[9px] font-bold rounded uppercase mb-1">
                      {achiever.type}
                    </span>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{achiever.name}</h3>
                    <p className="text-xs text-game-teal font-bold uppercase line-clamp-1">{achiever.achievement}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{achiever.exam}</span>
                  </div>
                  {(achiever.college || achiever.year) && (
                    <div className="flex items-center gap-3">
                      {achiever.college && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{achiever.college}</span>
                        </div>
                      )}
                      {achiever.year && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{achiever.year}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {achiever.quote && (
                    <p className="text-slate-600 text-sm italic line-clamp-3">"{achiever.quote}"</p>
                  )}
                  {achiever.youtubeUrl && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase">
                      <Youtube className="w-3 h-3" />
                      Video Testimonial Available
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleOpenModal(achiever)}
                    className="p-2 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(achiever.id)}
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
                <h2 className="text-xl font-bold text-slate-900">{editingAchiever ? 'Edit Achiever' : 'Add Achiever'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
                {/* Type Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                    <Trophy className="w-4 h-4" />
                    Achiever Type
                  </div>
                  <div>
                    <label className="label-text">Select Achievement Style</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="GATE Topper">GATE Topper</option>
                      <option value="Video Short">Video Short / Testimonial</option>
                      <option value="Ranker">Ranker (General)</option>
                      <option value="Job Selection">Job Selection</option>
                    </select>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    Basic Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label-text">Student Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field" placeholder="e.g. Rahul Sharma" required 
                      />
                    </div>
                    <div>
                      <label className="label-text">Rank / Title</label>
                      <input 
                        type="text" 
                        value={formData.achievement}
                        onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                        className="input-field" placeholder="e.g. AIR 13 or Junior Engineer" required 
                      />
                    </div>
                    <div>
                      <label className="label-text">Exam / Dept · Year</label>
                      <input 
                        type="text" 
                        value={formData.exam}
                        onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                        className="input-field" placeholder="e.g. GATE ME or CPWD · 2023" required 
                      />
                    </div>
                  </div>
                </div>

                {/* Video / Photo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                    <Video className="w-4 h-4" />
                    Video & Media
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="label-text">YouTube Video URL (Optional)</label>
                      <div className="relative">
                        <input 
                          type="url" 
                          value={formData.youtubeUrl}
                          onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                          className="input-field pl-10" placeholder="https://youtube.com/shorts/..." 
                        />
                        <Youtube className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Leave empty for photo-only cards.</p>
                    </div>
                    <div>
                      <label className="label-text">Photo URL (Optional)</label>
                      <div className="relative">
                        <input 
                          type="url" 
                          value={formData.photoUrl}
                          onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                          className="input-field pl-10" placeholder="https://..." 
                        />
                        <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extra Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                    <Plus className="w-4 h-4" />
                    Extra Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">College</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.college}
                          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                          className="input-field pl-10" placeholder="e.g. IIT Ropar" 
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div>
                      <label className="label-text">Year</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="input-field pl-10" placeholder="e.g. 2024" 
                        />
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label-text">Quote / Testimonial</label>
                      <div className="relative">
                        <textarea 
                          value={formData.quote}
                          onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                          className="input-field min-h-[80px] pl-10" placeholder="Student's feedback..." 
                        />
                        <Quote className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editingAchiever ? 'Save Changes' : 'Add Achiever'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

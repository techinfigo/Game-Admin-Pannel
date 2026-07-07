/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Trophy, User, Edit2, Trash2, X, Image as ImageIcon, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Achiever } from '../types';

const initialAchievers: Achiever[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    exam: 'GATE 2024 (ME)',
    achievement: 'AIR 12',
    photoUrl: 'https://i.pravatar.cc/150?u=rahul',
    quote: 'GAME Academy helped me stay consistent with my preparation.'
  },
  {
    id: '2',
    name: 'Priya Singh',
    exam: 'SSC-JE 2023 (CE)',
    achievement: 'Selected - CPWD',
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
    name: '',
    exam: '',
    achievement: '',
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
        name: '',
        exam: '',
        achievement: '',
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
                      <img src={achiever.photoUrl} alt={achiever.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-game-gold rounded-lg flex items-center justify-center text-white border-2 border-white">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{achiever.name}</h3>
                    <p className="text-xs text-game-teal font-bold uppercase">{achiever.achievement}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <GraduationCap className="w-4 h-4" />
                    <span>{achiever.exam}</span>
                  </div>
                  <p className="text-slate-600 text-sm italic line-clamp-3">"{achiever.quote}"</p>
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

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    <label className="label-text">Exam & Year</label>
                    <input 
                      type="text" 
                      value={formData.exam}
                      onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                      className="input-field" placeholder="e.g. GATE 2024 (ME)" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Achievement</label>
                    <input 
                      type="text" 
                      value={formData.achievement}
                      onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                      className="input-field" placeholder="e.g. AIR 12" required 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text">Photo URL</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.photoUrl}
                        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                        className="input-field pl-10" placeholder="https://..." required 
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text">Quote / Testimonial</label>
                    <textarea 
                      value={formData.quote}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      className="input-field min-h-[100px]" placeholder="Student's feedback..." required 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
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

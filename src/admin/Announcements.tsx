/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Megaphone, Calendar, Edit2, Trash2, X, Bell, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Announcement } from '../types';

const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Batch Enrollment Started',
    message: 'Enrollment for the Vision GATE 2027 batch has officially started. Early bird discounts available.',
    date: '2026-07-05',
    active: true
  },
  {
    id: '2',
    title: 'Server Maintenance Update',
    message: 'The mobile app will be under maintenance on Sunday from 2 AM to 5 AM.',
    date: '2026-07-01',
    active: false
  }
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
    active: true
  });

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData(announcement);
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        message: '',
        date: new Date().toISOString().split('T')[0],
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      // TODO: connect to Firestore
      setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? { ...a, ...formData } as Announcement : a));
    } else {
      // TODO: connect to Firestore
      const newAnnouncement = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as Announcement;
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      // TODO: connect to Firestore
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    // TODO: connect to Firestore
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-slate-500 mt-1">Broadcast important news and updates to all students.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search announcements..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <motion.div 
              key={announcement.id}
              layout
              className="p-5 border border-slate-100 rounded-2xl hover:border-game-teal transition-all group flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${announcement.active ? 'bg-game-teal/10 text-game-teal' : 'bg-slate-100 text-slate-400'}`}>
                <Megaphone className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{announcement.title}</h3>
                  <button 
                    onClick={() => toggleStatus(announcement.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 transition-colors ${
                      announcement.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {announcement.active ? (
                      <><CheckCircle2 className="w-3 h-3" /> Visible</>
                    ) : (
                      <><Clock className="w-3 h-3" /> Hidden</>
                    )}
                  </button>
                </div>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{announcement.message}</p>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted on {announcement.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button 
                  onClick={() => handleOpenModal(announcement)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No announcements found.</p>
            </div>
          )}
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
                <h2 className="text-xl font-bold text-slate-900">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="label-text">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field" placeholder="e.g. New Batch Enrollment" required 
                  />
                </div>
                <div>
                  <label className="label-text">Message</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field min-h-[120px]" placeholder="Write your announcement details here..." required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="label-text">Date</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div className="flex items-end pb-3">
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
                      <span className="font-bold text-slate-700">Publish Now</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editingAnnouncement ? 'Save Changes' : 'Broadcast Now'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

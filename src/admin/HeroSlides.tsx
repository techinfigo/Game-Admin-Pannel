/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  MonitorPlay, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ExternalLink,
  Award,
  Zap,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroSlide } from '../types';

const initialSlides: HeroSlide[] = [
  {
    id: '1',
    badge: 'New Batch Alert',
    headline: 'Ignite Your Engineering Career',
    subheadline: 'Expert coaching for GATE, SSC-JE, and PSU exams with top-tier faculty.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Explore Courses',
    ctaLink: '/courses',
    ctaText2: 'Download App',
    ctaLink2: 'https://play.google.com/store/apps/details?id=co.iron.game',
    stats: [
      { value: '100k+', label: 'Aspirants' },
      { value: '500+', label: 'Selections' },
      { value: '4.8/5', label: 'App Rating' }
    ],
    order: 1,
    active: true
  },
  {
    id: '2',
    badge: 'Limited Seats',
    headline: 'GATE 2025 Crash Course',
    subheadline: 'Limited seats available for our intensive 3-month preparation program.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Enroll Now',
    ctaLink: '/courses/gate-crash',
    ctaText2: 'View Schedule',
    ctaLink2: '/schedule',
    stats: [
      { value: '3 Months', label: 'Duration' },
      { value: 'LIVE', label: 'Daily Classes' },
      { value: '200+', label: 'Mock Tests' }
    ],
    order: 2,
    active: true
  }
];

export default function HeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [statInput, setStatInput] = useState({ value: '', label: '' });

  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    badge: '',
    headline: '',
    subheadline: '',
    imageUrl: '',
    ctaText: 'Learn More',
    ctaLink: '',
    ctaText2: '',
    ctaLink2: '',
    stats: [],
    order: 0,
    active: true
  });

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData(slide);
    } else {
      setEditingSlide(null);
      setFormData({
        badge: '',
        headline: '',
        subheadline: '',
        imageUrl: '',
        ctaText: 'Learn More',
        ctaLink: '',
        ctaText2: '',
        ctaLink2: '',
        stats: [],
        order: slides.length + 1,
        active: true
      });
    }
    setStatInput({ value: '', label: '' });
    setIsModalOpen(true);
  };

  const handleAddStat = () => {
    if (statInput.value && statInput.label) {
      setFormData(prev => ({
        ...prev,
        stats: [...(prev.stats || []), { ...statInput }]
      }));
      setStatInput({ value: '', label: '' });
    }
  };

  const handleRemoveStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index)
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      // TODO: connect to Firestore
      setSlides(prev => prev.map(s => s.id === editingSlide.id ? { ...s, ...formData } as HeroSlide : s));
    } else {
      // TODO: connect to Firestore
      const newSlide = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as HeroSlide;
      setSlides(prev => [...prev, newSlide].sort((a, b) => a.order - b.order));
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hero slide?')) {
      // TODO: connect to Firestore
      setSlides(prev => prev.filter(s => s.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    // TODO: connect to Firestore
    setSlides(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Homepage Hero Slides</h1>
          <p className="text-slate-500 mt-1">Configure the main promotional carousel on the homepage.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Slide
        </button>
      </div>

      <div className="admin-card">
        <div className="space-y-6">
          {sortedSlides.map((slide) => (
            <motion.div 
              key={slide.id}
              layout
              className="group border border-slate-100 rounded-3xl overflow-hidden hover:border-game-teal transition-all duration-300 flex flex-col lg:flex-row bg-white shadow-sm"
            >
              <div className="w-full lg:w-80 h-48 lg:h-auto shrink-0 relative overflow-hidden bg-slate-100">
                <img src={slide.imageUrl} alt={slide.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-lg flex items-center gap-1.5 ${
                    slide.active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {slide.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {slide.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-slate-900 border border-slate-200 shadow-sm flex items-center gap-1.5">
                  <ArrowUpDown className="w-3 h-3 text-game-teal" />
                  SLIDE #{slide.order}
                </div>
              </div>

              <div className="p-6 lg:p-8 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-game-teal/10 text-game-teal text-[10px] font-bold uppercase rounded border border-game-teal/20">
                        {slide.badge || 'PROMOTION'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-game-teal transition-colors">
                      {slide.headline}
                    </h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-2xl leading-relaxed line-clamp-2">
                      {slide.subheadline}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main:</span>
                      <span className="text-sm font-bold text-game-teal">{slide.ctaText}</span>
                    </div>
                    {slide.ctaText2 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secondary:</span>
                        <span className="text-sm font-bold text-slate-600">{slide.ctaText2}</span>
                      </div>
                    )}
                  </div>

                  {slide.stats && slide.stats.length > 0 && (
                    <div className="flex flex-wrap gap-4 pt-2">
                      {slide.stats.map((stat, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{stat.value}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-50">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleStatus(slide.id)}
                      className={`btn-secondary text-xs px-4 ${slide.active ? 'text-slate-600' : 'text-game-teal'}`}
                    >
                      {slide.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <a 
                      href={slide.ctaLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-game-teal hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(slide)}
                      className="p-3 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-2xl transition-all border border-transparent hover:border-game-teal/20"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(slide.id)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {slides.length === 0 && (
            <div className="text-center py-24 bg-slate-50/50 rounded-[40px] border-3 border-dashed border-slate-100">
              <MonitorPlay className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-500 font-bold text-lg">No hero slides configured.</p>
              <button onClick={() => handleOpenModal()} className="btn-primary mx-auto mt-6">
                Create First Slide
              </button>
            </div>
          )}
        </div>
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
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{editingSlide ? 'Edit Hero Slide' : 'Add New Slide'}</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure visuals and calls to action for the homepage.</p>
                </div>
                <button onClick={handleCloseModal} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Visual Context */}
                  <div className="sm:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                      <ImageIcon className="w-4 h-4" />
                      Visual Content
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="label-text">Top Badge / Label</label>
                        <input 
                          type="text" 
                          value={formData.badge}
                          onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                          className="input-field" placeholder="e.g. New Batch Alert" required 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-text">Headline (Main Title)</label>
                        <input 
                          type="text" 
                          value={formData.headline}
                          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                          className="input-field text-lg font-bold" placeholder="e.g. Ignite Your Future" required 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-text">Subheadline (Supporting Text)</label>
                        <textarea 
                          value={formData.subheadline}
                          onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                          className="input-field min-h-[80px]" placeholder="Brief description to engage users..." required 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-text">Background Image URL</label>
                        <input 
                          type="url" 
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="input-field" placeholder="https://..." required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Call to Actions */}
                  <div className="sm:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                      <Zap className="w-4 h-4" />
                      Action Buttons
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-2xl bg-slate-50/50">
                      <div>
                        <label className="label-text">Primary Text</label>
                        <input 
                          type="text" 
                          value={formData.ctaText}
                          onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                          className="input-field font-bold" placeholder="e.g. Get Started" required 
                        />
                      </div>
                      <div>
                        <label className="label-text">Primary Link</label>
                        <input 
                          type="text" 
                          value={formData.ctaLink}
                          onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                          className="input-field" placeholder="/courses" required 
                        />
                      </div>
                      <div>
                        <label className="label-text">Secondary Text (Optional)</label>
                        <input 
                          type="text" 
                          value={formData.ctaText2}
                          onChange={(e) => setFormData({ ...formData, ctaText2: e.target.value })}
                          className="input-field" placeholder="e.g. Download App" 
                        />
                      </div>
                      <div>
                        <label className="label-text">Secondary Link (Optional)</label>
                        <input 
                          type="text" 
                          value={formData.ctaLink2}
                          onChange={(e) => setFormData({ ...formData, ctaLink2: e.target.value })}
                          className="input-field" placeholder="https://..." 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="sm:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                      <BarChart3 className="w-4 h-4" />
                      Achievement Stats (Max 3)
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          value={statInput.value}
                          onChange={(e) => setStatInput({ ...statInput, value: e.target.value })}
                          className="input-field" 
                          placeholder="Value (e.g. 100k+)" 
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={statInput.label}
                            onChange={(e) => setStatInput({ ...statInput, label: e.target.value })}
                            className="input-field flex-1" 
                            placeholder="Label (e.g. Aspirants)" 
                          />
                          <button 
                            type="button" 
                            onClick={handleAddStat}
                            disabled={(formData.stats?.length || 0) >= 3}
                            className="btn-secondary px-4 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {formData.stats?.map((stat, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
                            <div className="flex flex-col leading-tight">
                              <span className="text-xs font-black text-slate-900">{stat.value}</span>
                              <span className="text-[9px] text-slate-500 uppercase font-bold">{stat.label}</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveStat(i)} className="text-slate-400 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:col-span-2 pt-4 border-t border-slate-100">
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
                </div>

                <div className="pt-4 flex gap-4 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 py-4 justify-center text-base">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-4 justify-center text-base">
                    {editingSlide ? 'Save Changes' : 'Create Slide'}
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

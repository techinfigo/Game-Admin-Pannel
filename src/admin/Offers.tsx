/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Tag, 
  Calendar, 
  Link as LinkIcon, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Offer } from '../types';

const initialOffers: Offer[] = [
  {
    id: '1',
    title: 'Monsoon Mega Sale',
    description: 'Flat 20% OFF on all GATE 2027 Batches. Limited time offer.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4638d9f8e?w=800&auto=format&fit=crop&q=60',
    ctaText: 'Claim Discount',
    ctaLink: 'https://example.com/discount',
    active: true,
    expiryDate: '2026-07-31'
  },
  {
    id: '2',
    title: 'Early Bird SSC-JE',
    description: 'Join the new batch before July 10 and get FREE Test Series.',
    imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&auto=format&fit=crop&q=60',
    ctaText: 'Learn More',
    ctaLink: 'https://example.com/ssc-offer',
    active: false,
    expiryDate: '2026-07-10'
  }
];

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Offer>>({
    title: '',
    description: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    active: true,
    expiryDate: ''
  });

  const handleOpenModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData(offer);
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        ctaText: '',
        ctaLink: '',
        active: true,
        expiryDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      // TODO: connect to Firestore
      setOffers(prev => prev.map(o => o.id === editingOffer.id ? { ...o, ...formData } as Offer : o));
    } else {
      // TODO: connect to Firestore
      const newOffer = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as Offer;
      setOffers(prev => [newOffer, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      // TODO: connect to Firestore
      setOffers(prev => prev.filter(o => o.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    // TODO: connect to Firestore
    setOffers(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
  };

  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Offers & Banners</h1>
          <p className="text-slate-500 mt-1">Manage promotional banners and special discounts displayed on the site.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Create Offer
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search offers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-6">
          {filteredOffers.map((offer) => (
            <motion.div 
              key={offer.id}
              layout
              className="p-6 border border-slate-100 rounded-3xl hover:border-game-teal transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-48 h-48 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                  <img src={offer.imageUrl} alt={offer.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xl text-slate-900">{offer.title}</h3>
                      <button 
                        onClick={() => toggleStatus(offer.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 transition-colors ${
                          offer.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {offer.active ? (
                          <><CheckCircle2 className="w-3 h-3" /> Active</>
                        ) : (
                          <><Clock className="w-3 h-3" /> Inactive</>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-500 mb-4">{offer.description}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>Expires: <span className="font-bold text-slate-700">{offer.expiryDate}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <LinkIcon className="w-4 h-4" />
                        <span>CTA: <span className="font-bold text-slate-700">{offer.ctaText}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 lg:mt-0">
                    <button 
                      onClick={() => handleOpenModal(offer)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingOffer ? 'Edit Offer' : 'New Offer'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="label-text">Offer Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field min-h-[80px]" required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Image URL</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="input-field pl-10" required 
                      />
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">CTA Text</label>
                    <input 
                      type="text" 
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="input-field" placeholder="e.g. Enroll Now" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">CTA Link</label>
                    <input 
                      type="url" 
                      value={formData.ctaLink}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                      className="input-field" placeholder="https://..." required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Expiry Date</label>
                    <input 
                      type="date" 
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
                      <span className="font-bold text-slate-700">Set as Active</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editingOffer ? 'Update Offer' : 'Launch Offer'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Star, 
  Edit2, 
  Trash2, 
  X, 
  User,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Review } from '../types';

const initialReviews: Review[] = [
  {
    id: '1',
    studentName: 'Amit Verma',
    exam: 'GATE 2024 (EE)',
    rating: 5,
    reviewText: 'The conceptual clarity provided by GAME Academy is unmatched. Highly recommended for all engineering students.',
    photoUrl: 'https://i.pravatar.cc/150?u=amit',
    date: '2026-06-15'
  },
  {
    id: '2',
    studentName: 'Sneha Kapur',
    exam: 'SSC-JE 2023',
    rating: 4,
    reviewText: 'Excellent faculty and study material. The test series was very similar to the actual exam pattern.',
    photoUrl: 'https://i.pravatar.cc/150?u=sneha',
    date: '2026-05-20'
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Review>>({
    studentName: '',
    exam: '',
    rating: 5,
    reviewText: '',
    photoUrl: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleOpenModal = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setFormData(review);
    } else {
      setEditingReview(null);
      setFormData({
        studentName: '',
        exam: '',
        rating: 5,
        reviewText: '',
        photoUrl: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      // TODO: connect to Firestore
      setReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, ...formData } as Review : r));
    } else {
      // TODO: connect to Firestore
      const newReview = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as Review;
      setReviews(prev => [newReview, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      // TODO: connect to Firestore
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.exam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reviews / Testimonials</h1>
          <p className="text-slate-500 mt-1">Manage student feedback and ratings displayed on the website.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Review
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search by student name or exam..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <motion.div 
              key={review.id}
              layout
              className="group admin-card p-6 hover:border-game-teal transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img 
                        src={review.photoUrl || `https://ui-avatars.com/api/?name=${review.studentName}&background=0d9488&color=fff`} 
                        alt={review.studentName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{review.studentName}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'text-game-gold fill-game-gold' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" />
                      {review.date}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-game-teal">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {review.exam}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">"{review.reviewText}"</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => handleOpenModal(review)}
                  className="p-2 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredReviews.length === 0 && (
            <div className="md:col-span-2 text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
              <Star className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No reviews found.</p>
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
                <h2 className="text-xl font-bold text-slate-900">{editingReview ? 'Edit Review' : 'Add New Review'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="label-text">Student Name</label>
                    <input 
                      type="text" 
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="input-field" placeholder="Full name of the student" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Exam Title</label>
                    <input 
                      type="text" 
                      value={formData.exam}
                      onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                      className="input-field" placeholder="e.g. GATE 2024" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Rating (1-5)</label>
                    <select 
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="input-field"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text">Photo URL (Optional)</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.photoUrl}
                        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                        className="input-field pl-10" placeholder="https://..." 
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text">Review Content</label>
                    <textarea 
                      value={formData.reviewText}
                      onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                      className="input-field min-h-[100px]" placeholder="Student's feedback..." required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Date</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editingReview ? 'Save Changes' : 'Publish Review'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  GraduationCap, 
  DollarSign, 
  Link as LinkIcon, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course } from '../types';

const initialCourses: Course[] = [
  {
    id: '1',
    title: 'GATE 2027 Full Concept Batch',
    examTag: 'GATE',
    description: 'Comprehensive course covering all engineering mathematics and core subjects for Civil Engineering.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    price: '₹14,999',
    purchaseLink: 'https://example.com/gate-2027',
    features: ['300+ Live Classes', 'Solved PYQs', 'Weekly Tests', 'Mentorship']
  },
  {
    id: '2',
    title: 'SSC-JE Quick Revision Crash Course',
    examTag: 'SSC-JE',
    description: 'Intensive 45-day revision program focused on previous year patterns and high-yield topics.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60',
    price: '₹4,999',
    purchaseLink: 'https://example.com/ssc-je-crash',
    features: ['Short Notes', 'Formula Sheets', 'Mock Tests']
  }
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    examTag: '',
    description: '',
    imageUrl: '',
    price: '',
    purchaseLink: '',
    features: []
  });

  const [featureInput, setFeatureInput] = useState('');

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        examTag: '',
        description: '',
        imageUrl: '',
        price: '',
        purchaseLink: '',
        features: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleAddFeature = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && featureInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      // TODO: connect to Firestore
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...formData } as Course : c));
    } else {
      // TODO: connect to Firestore
      const newCourse = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as Course;
      setCourses(prev => [newCourse, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      // TODO: connect to Firestore
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.examTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Courses</h1>
          <p className="text-slate-500 mt-1">Manage and publish educational courses for competitive exams.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <motion.div 
              key={course.id}
              layout
              className="group border border-slate-100 rounded-3xl overflow-hidden hover:border-game-teal transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-game-teal text-xs font-bold rounded-lg uppercase shadow-sm">
                    {course.examTag}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(course)}
                    className="p-2 bg-white/90 backdrop-blur-md text-slate-600 hover:text-game-teal rounded-xl shadow-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    className="p-2 bg-white/90 backdrop-blur-md text-slate-600 hover:text-red-500 rounded-xl shadow-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-xl text-slate-900 line-clamp-1">{course.title}</h3>
                  <p className="text-game-teal font-bold text-lg">{course.price}</p>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.features.slice(0, 3).map((f, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                      <CheckCircle className="w-3 h-3 text-game-teal" />
                      {f}
                    </span>
                  ))}
                  {course.features.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5">+{course.features.length - 3} more</span>
                  )}
                </div>

                <a 
                  href={course.purchaseLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full btn-secondary justify-center text-sm"
                >
                  View Landing Page
                  <ExternalLink className="w-4 h-4" />
                </a>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="label-text">Course Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Exam Category (Tag)</label>
                    <input 
                      type="text" 
                      value={formData.examTag}
                      onChange={(e) => setFormData({ ...formData, examTag: e.target.value })}
                      className="input-field" placeholder="e.g. GATE" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Price (Label)</label>
                    <input 
                      type="text" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field" placeholder="e.g. ₹14,999" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Short Description</label>
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
                  <div className="md:col-span-2">
                    <label className="label-text">Purchase/Landing Page Link</label>
                    <input 
                      type="url" 
                      value={formData.purchaseLink}
                      onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
                      className="input-field" required 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label-text">Course Features (Press Enter)</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={handleAddFeature}
                        className="input-field" 
                        placeholder="e.g. 50+ Mock Tests"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.features?.map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 p-2 px-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-sm text-slate-600 truncate">{feature}</span>
                            <button type="button" onClick={() => removeFeature(idx)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editingCourse ? 'Save Changes' : 'Publish Course'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

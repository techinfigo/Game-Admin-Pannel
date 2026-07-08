/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Edit2, 
  Trash2, 
  X, 
  User,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Faculty } from '../types';

const initialFaculty: Faculty[] = [
  {
    id: '1',
    name: 'Dr. Vikram Singh',
    subject: 'Structural Engineering',
    qualification: 'M.Tech, Ph.D. (IIT Delhi)',
    photoUrl: 'https://i.pravatar.cc/150?u=vikram',
    bio: 'Specialist in concrete structures and earthquake engineering with over 15 years of academic and industrial experience.',
    experienceYears: 15
  },
  {
    id: '2',
    name: 'Er. Anjali Sharma',
    subject: 'Engineering Mathematics',
    qualification: 'M.Sc. Mathematics, GATE Qualified',
    photoUrl: 'https://i.pravatar.cc/150?u=anjali',
    bio: 'Renowned for making complex mathematical concepts simple for GATE aspirants. Helped 1000+ students secure top ranks.',
    experienceYears: 8
  }
];

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>(initialFaculty);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Faculty>>({
    name: '',
    subject: '',
    qualification: '',
    photoUrl: '',
    bio: '',
    experienceYears: 0
  });

  const handleOpenModal = (member?: Faculty) => {
    if (member) {
      setEditingFaculty(member);
      setFormData(member);
    } else {
      setEditingFaculty(null);
      setFormData({
        name: '',
        subject: '',
        qualification: '',
        photoUrl: '',
        bio: '',
        experienceYears: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaculty(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaculty) {
      // TODO: connect to Firestore
      setFaculty(prev => prev.map(f => f.id === editingFaculty.id ? { ...f, ...formData } as Faculty : f));
    } else {
      // TODO: connect to Firestore
      const newMember = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as Faculty;
      setFaculty(prev => [newMember, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      // TODO: connect to Firestore
      setFaculty(prev => prev.filter(f => f.id !== id));
    }
  };

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty / Educators</h1>
          <p className="text-slate-500 mt-1">Manage the team of expert educators and their professional profiles.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Faculty
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search by name or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
            <motion.div 
              key={member.id}
              layout
              className="group admin-card p-0 overflow-hidden hover:border-game-teal transition-all duration-300 relative"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow-lg">
                    <img 
                      src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.name}&background=0d9488&color=fff`} 
                      alt={member.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{member.name}</h3>
                    <div className="flex items-center gap-1.5 text-game-teal font-bold text-xs uppercase mt-1">
                      <BookOpen className="w-3 h-3" />
                      {member.subject}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{member.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>{member.experienceYears}+ Years Experience</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl">
                    {member.bio}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleOpenModal(member)}
                    className="p-2 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingFaculty ? 'Edit Faculty member' : 'Add New Faculty'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="label-text">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field" placeholder="Full name of the educator" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Subject Specialization</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field" placeholder="e.g. Mathematics" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Years of Experience</label>
                    <input 
                      type="number" 
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      className="input-field" min="0" required 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text">Qualifications</label>
                    <input 
                      type="text" 
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="input-field" placeholder="e.g. M.Tech, Ph.D." required 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text">Profile Photo URL</label>
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
                    <label className="label-text">Short Bio / Achievements</label>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="input-field min-h-[100px]" placeholder="Brief professional summary..." required 
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {editingFaculty ? 'Save Profile' : 'Add Faculty'}
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

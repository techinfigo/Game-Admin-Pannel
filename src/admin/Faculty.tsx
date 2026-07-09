/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
import { getAll, addItem, updateItem, deleteItem } from '../services/firestoreService';

const COLLECTION = 'faculty';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statInput, setStatInput] = useState('');

  const [formData, setFormData] = useState<Partial<Faculty>>({
    name: '',
    role: '',
    expLabel: '',
    experience: '',
    photoUrl: '',
    stats: [],
    isChiefMentor: false,
    subject: '',
    qualification: '',
    bio: ''
  });

  const loadFaculty = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAll<Faculty>(COLLECTION);
      setFaculty(data);
    } catch (error) {
      console.error('Failed to load faculty', error);
      setErrorMessage('Failed to load faculty.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const handleOpenModal = (member?: Faculty) => {
    if (member) {
      setEditingFaculty(member);
      setFormData(member);
    } else {
      setEditingFaculty(null);
      setFormData({
        name: '',
        role: '',
        expLabel: '',
        experience: '',
        photoUrl: '',
        stats: [],
        isChiefMentor: false,
        subject: '',
        qualification: '',
        bio: ''
      });
    }
    setIsModalOpen(statInput === ''); // Reset stat input indirectly
    setStatInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaculty(null);
  };

  const handleAddStat = () => {
    if (statInput.trim()) {
      setFormData(prev => ({
        ...prev,
        stats: [...(prev.stats || []), statInput.trim()]
      }));
      setStatInput('');
    }
  };

  const handleRemoveStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (editingFaculty) {
        await updateItem<Faculty>(COLLECTION, editingFaculty.id, formData);
      } else {
        await addItem<Faculty>(COLLECTION, formData as Faculty);
      }
      await loadFaculty();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save faculty member', error);
      setErrorMessage('Failed to save faculty member.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      setErrorMessage(null);
      try {
        await deleteItem(COLLECTION, id);
        await loadFaculty();
      } catch (error) {
        console.error('Failed to delete faculty member', error);
        setErrorMessage('Failed to delete faculty member.');
      }
    }
  };

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.role && f.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty / Educators</h1>
            <p className="text-slate-500 mt-1">Manage the team of expert educators and their professional profiles.</p>
          </div>
        </div>
        <div className="admin-card flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-game-teal rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {errorMessage}
        </div>
      )}

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {filteredFaculty.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No faculty members found.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
            <motion.div 
              key={member.id}
              layout
              className="group admin-card p-0 overflow-hidden hover:border-game-teal transition-all duration-300 relative"
            >
              {member.isChiefMentor && (
                <div className="absolute top-0 right-0 z-10">
                  <div className="bg-game-gold text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1.5 uppercase">
                    <Award className="w-3.5 h-3.5" />
                    Chief Mentor
                  </div>
                </div>
              )}
              
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
                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{member.name}</h3>
                    <div className="text-game-teal font-bold text-xs uppercase mt-1 line-clamp-1">
                      {member.role}
                    </div>
                    {member.expLabel && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">
                        {member.expLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span className="font-medium line-clamp-1">{member.experience}</span>
                  </div>
                  
                  {member.stats && member.stats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {member.stats.map((stat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-game-teal/5 text-game-teal text-[9px] font-bold rounded-lg border border-game-teal/10">
                          {stat}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 bg-slate-50 p-3 rounded-xl italic">
                    "{member.bio}"
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
        )}
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
                <h2 className="text-xl font-bold text-slate-900">{editingFaculty ? 'Edit Faculty profile' : 'Add New Faculty'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                      <User className="w-4 h-4" />
                      Basic Profile
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="label-text">Full Name</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="input-field" placeholder="e.g. Gaurav Babu Sir" required 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-text">Role / Title</label>
                        <input 
                          type="text" 
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="input-field" placeholder="e.g. Founder & Chief Mentor" required 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-text">Profile Photo URL</label>
                        <input 
                          type="url" 
                          value={formData.photoUrl}
                          onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                          className="input-field" placeholder="https://..." required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                      <Briefcase className="w-4 h-4" />
                      Experience Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="label-text">Exp. Badge</label>
                        <input 
                          type="text" 
                          value={formData.expLabel}
                          onChange={(e) => setFormData({ ...formData, expLabel: e.target.value })}
                          className="input-field" placeholder="e.g. 14+ YRS EXP." required 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-text">Experience Text</label>
                        <input 
                          type="text" 
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          className="input-field" placeholder="e.g. 14+ Years of Teaching Experience" required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats / Achievements */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-game-teal font-bold text-sm uppercase tracking-wider">
                      <Award className="w-4 h-4" />
                      Achievement Points
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={statInput}
                          onChange={(e) => setStatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStat())}
                          className="input-field" 
                          placeholder="Add an achievement point..." 
                        />
                        <button type="button" onClick={handleAddStat} className="btn-secondary px-4">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.stats?.map((stat, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-sm font-medium text-slate-700">
                            {stat}
                            <button type="button" onClick={() => handleRemoveStat(i)} className="text-slate-400 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mentor Toggle */}
                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={formData.isChiefMentor}
                          onChange={(e) => setFormData({ ...formData, isChiefMentor: e.target.checked })}
                          className="sr-only" 
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${formData.isChiefMentor ? 'bg-game-gold' : 'bg-slate-200'}`}></div>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isChiefMentor ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="font-bold text-slate-700">Mark as Chief Mentor</span>
                    </label>
                  </div>

                  {/* Optional Extra Info */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      Optional Information
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-text text-slate-400">Subject</label>
                        <input 
                          type="text" 
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="input-field bg-slate-50/50" placeholder="e.g. Thermal Science" 
                        />
                      </div>
                      <div>
                        <label className="label-text text-slate-400">Qualification</label>
                        <input 
                          type="text" 
                          value={formData.qualification}
                          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                          className="input-field bg-slate-50/50" placeholder="e.g. M.Tech (IIT Delhi)" 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-text text-slate-400">Short Bio</label>
                        <textarea 
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="input-field bg-slate-50/50 min-h-[80px]" placeholder="Brief professional summary..." 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {editingFaculty ? 'Save Changes' : 'Add Faculty'}
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  StickyNote, 
  MoreVertical, 
  Edit2, 
  Trash2,
  X,
  Upload,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FreeResource, ResourceType } from '../types';

const initialResources: FreeResource[] = [
  {
    id: '1',
    title: 'GATE 2025 Civil Engineering Syllabus',
    description: 'Complete breakdown of topics for GATE 2025 Civil Engineering paper.',
    type: 'pdf',
    fileOrLink: 'https://example.com/gate-ce-syllabus.pdf',
    examTag: 'GATE'
  },
  {
    id: '2',
    title: 'SSC-JE Previous Year Questions',
    description: 'Last 10 years solved questions for SSC-JE Mechanical.',
    type: 'pdf',
    fileOrLink: 'https://example.com/ssc-je-pyq.pdf',
    examTag: 'SSC-JE'
  },
  {
    id: '3',
    title: 'Intro to Thermodynamics Video',
    description: 'Detailed explanation of the first law of thermodynamics.',
    type: 'video',
    fileOrLink: 'https://youtube.com/watch?v=123',
    examTag: 'GATE'
  }
];

export default function FreeResources() {
  const [resources, setResources] = useState<FreeResource[]>(initialResources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<FreeResource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<FreeResource>>({
    title: '',
    description: '',
    type: 'pdf',
    fileOrLink: '',
    examTag: ''
  });

  const handleOpenModal = (resource?: FreeResource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData(resource);
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        fileOrLink: '',
        examTag: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      // TODO: connect to Firestore
      setResources(prev => prev.map(r => r.id === editingResource.id ? { ...r, ...formData } as FreeResource : r));
    } else {
      // TODO: connect to Firestore
      const newResource = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as FreeResource;
      setResources(prev => [newResource, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      // TODO: connect to Firestore
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.examTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'link': return LinkIcon;
      case 'note': return StickyNote;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Free Resources</h1>
          <p className="text-slate-500 mt-1">Manage study materials, PDFs, and video links for students.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      <div className="admin-card">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search by title or exam tag..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Resources Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-500 text-sm">Resource</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm">Exam Tag</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm">Type</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResources.map((resource) => {
                const Icon = getIcon(resource.type);
                return (
                  <tr key={resource.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-game-teal/10 group-hover:text-game-teal transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{resource.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{resource.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase">
                        {resource.examTag}
                      </span>
                    </td>
                    <td className="py-4 capitalize text-sm text-slate-600">{resource.type}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={resource.fileOrLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-game-teal transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleOpenModal(resource)}
                          className="p-2 text-slate-400 hover:text-game-teal transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(resource.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="label-text">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field" 
                    placeholder="e.g. GATE 2025 SYLLABUS"
                    required 
                  />
                </div>

                <div>
                  <label className="label-text">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field min-h-[80px]" 
                    placeholder="Briefly describe what this resource is..."
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Resource Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                      className="input-field appearance-none bg-no-repeat bg-[right_1rem_center]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7' /%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                    >
                      <option value="pdf">PDF File</option>
                      <option value="video">Video Link</option>
                      <option value="note">Short Note</option>
                      <option value="link">Other Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Exam Tag</label>
                    <input 
                      type="text" 
                      value={formData.examTag}
                      onChange={(e) => setFormData({ ...formData, examTag: e.target.value })}
                      className="input-field" 
                      placeholder="e.g. GATE, SSC-JE"
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">File / Link URL</label>
                  <input 
                    type="url" 
                    value={formData.fileOrLink}
                    onChange={(e) => setFormData({ ...formData, fileOrLink: e.target.value })}
                    className="input-field" 
                    placeholder="https://..."
                    required 
                  />
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-game-teal transition-colors group">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:text-game-teal group-hover:bg-game-teal/5 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">Click to upload file (UI only)</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, ZIP or Image up to 10MB</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {editingResource ? 'Save Changes' : 'Create Resource'}
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

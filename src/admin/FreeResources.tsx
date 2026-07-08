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
  ExternalLink,
  DollarSign,
  Tag as TagIcon,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FreeResource } from '../types';

const initialResources: FreeResource[] = [
  {
    id: '1',
    resourceKind: 'free',
    category: 'PDF Notes',
    title: 'GATE 2025 Civil Engineering Syllabus',
    description: 'Complete breakdown of topics for GATE 2025 Civil Engineering paper.',
    type: 'pdf',
    fileOrLink: 'https://example.com/gate-ce-syllabus.pdf',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    action: 'Download PDF',
    price: '',
    tag: '',
    examTag: 'GATE'
  },
  {
    id: '2',
    resourceKind: 'paid',
    category: 'Video Series',
    title: 'Advanced Thermodynamics Masterclass',
    description: 'Comprehensive 50-hour video series covering all complex topics.',
    type: 'video',
    fileOrLink: 'https://courses.gameacademy.in/thermo-master',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    action: '',
    price: 'Rs. 4,999',
    tag: 'Best Seller',
    examTag: 'GATE'
  }
];

export default function FreeResources() {
  const [resources, setResources] = useState<FreeResource[]>(initialResources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<FreeResource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<FreeResource>>({
    resourceKind: 'free',
    category: '',
    title: '',
    description: '',
    type: 'pdf',
    fileOrLink: '',
    image: '',
    action: 'Watch Now',
    price: '',
    tag: '',
    examTag: ''
  });

  const handleOpenModal = (resource?: FreeResource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData(resource);
    } else {
      setEditingResource(null);
      setFormData({
        resourceKind: 'free',
        category: '',
        title: '',
        description: '',
        type: 'pdf',
        fileOrLink: '',
        image: '',
        action: 'Watch Now',
        price: '',
        tag: '',
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
    r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.examTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Knowledge Pitara</h1>
          <p className="text-slate-500 mt-1">Manage free and paid study resources, videos, and PDFs.</p>
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
              placeholder="Search by title, category or exam tag..." 
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
                <th className="pb-4 font-semibold text-slate-500 text-sm">Kind</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm">Category</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm">Tag</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResources.map((resource) => {
                const Icon = getIcon(resource.type || 'link');
                return (
                  <tr key={resource.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          {resource.image ? (
                            <img src={resource.image} alt={resource.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Icon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{resource.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              resource.resourceKind === 'free' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {resource.resourceKind}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {resource.examTag}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 capitalize text-sm text-slate-600">{resource.resourceKind}</td>
                    <td className="py-4 capitalize text-sm text-slate-600">{resource.category}</td>
                    <td className="py-4">
                      {resource.resourceKind === 'paid' ? (
                        <div className="flex flex-col">
                          <span className="text-game-teal font-bold text-xs">{resource.price}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">{resource.tag}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">{resource.action}</span>
                      )}
                    </td>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                {/* Kind & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Resource Kind</label>
                    <select 
                      value={formData.resourceKind}
                      onChange={(e) => setFormData({ ...formData, resourceKind: e.target.value })}
                      className="input-field" required
                    >
                      <option value="free">Free Resource</option>
                      <option value="paid">Paid Content / Pitara</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Category</label>
                    <input 
                      type="text" 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field" placeholder="e.g. Video Series, PDF Notes" required 
                    />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="label-text">Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field" placeholder="e.g. GATE 2025 Syllabus breakdown" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field min-h-[80px]" placeholder="Brief summary of the resource..." required 
                    />
                  </div>
                </div>

                {/* Links & Media */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label-text">File URL / Link</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.fileOrLink}
                        onChange={(e) => setFormData({ ...formData, fileOrLink: e.target.value })}
                        className="input-field pl-10" placeholder="https://..." required 
                      />
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Thumbnail Image URL</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="input-field pl-10" placeholder="https://images.unsplash.com/..." 
                      />
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Specifics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl">
                  {formData.resourceKind === 'free' ? (
                    <div className="md:col-span-3">
                      <label className="label-text">Action Button Text</label>
                      <input 
                        type="text" 
                        value={formData.action}
                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                        className="input-field" placeholder="e.g. Watch Now, Download" 
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Applies only to FREE resources.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="label-text">Price</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="input-field pl-10" placeholder="e.g. Rs. 2,999" 
                          />
                          <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-text">Tag / Badge</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={formData.tag}
                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            className="input-field pl-10" placeholder="e.g. Best Seller" 
                          />
                          <TagIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <p className="md:col-span-3 text-[10px] text-slate-400">Price & Tag apply only to PAID resources.</p>
                    </>
                  )}
                </div>

                {/* Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Exam Tag</label>
                    <input 
                      type="text" 
                      value={formData.examTag}
                      onChange={(e) => setFormData({ ...formData, examTag: e.target.value })}
                      className="input-field" placeholder="e.g. GATE, SSC-JE" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Content Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input-field"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video / YouTube</option>
                      <option value="note">Short Note</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editingResource ? 'Save Changes' : 'Publish Resource'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

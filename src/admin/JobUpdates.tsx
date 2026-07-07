/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Briefcase, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JobUpdate, JobStatus } from '../types';

const initialJobs: JobUpdate[] = [
  {
    id: '1',
    notification: 'SSC-JE 2026 Notification',
    eligibility: 'B.E. / B.Tech / Diploma in CE/ME/EE',
    branches: ['Civil', 'Mechanical', 'Electrical'],
    startDate: '2026-08-01',
    endDate: '2026-08-30',
    status: 'Yet to start',
    pdfLink: 'https://ssc.nic.in/notification',
    usefulLinks: 'https://ssc.nic.in/apply',
    recommendedCourse: 'https://gameacademy.in/ssc-je-batch'
  },
  {
    id: '2',
    notification: 'ISRO Scientist-C Recruitment',
    eligibility: 'B.E. / B.Tech with 65% aggregate',
    branches: ['Mechanical', 'Electronics', 'CS'],
    startDate: '2026-06-15',
    endDate: '2026-07-15',
    status: 'Open',
    pdfLink: 'https://isro.gov.in/advt',
    usefulLinks: 'https://isro.gov.in/apply',
    recommendedCourse: 'https://gameacademy.in/isro-crash-course'
  }
];

export default function JobUpdates() {
  const [jobs, setJobs] = useState<JobUpdate[]>(initialJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobUpdate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<JobUpdate>>({
    notification: '',
    eligibility: '',
    branches: [],
    startDate: '',
    endDate: '',
    status: 'Yet to start',
    pdfLink: '',
    usefulLinks: '',
    recommendedCourse: ''
  });

  const [branchInput, setBranchInput] = useState('');

  const handleOpenModal = (job?: JobUpdate) => {
    if (job) {
      setEditingJob(job);
      setFormData(job);
    } else {
      setEditingJob(null);
      setFormData({
        notification: '',
        eligibility: '',
        branches: [],
        startDate: '',
        endDate: '',
        status: 'Yet to start',
        pdfLink: '',
        usefulLinks: '',
        recommendedCourse: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleAddBranch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && branchInput.trim()) {
      e.preventDefault();
      if (!formData.branches?.includes(branchInput.trim())) {
        setFormData(prev => ({
          ...prev,
          branches: [...(prev.branches || []), branchInput.trim()]
        }));
      }
      setBranchInput('');
    }
  };

  const removeBranch = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches?.filter(b => b !== branch)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      // TODO: connect to Firestore
      setJobs(prev => prev.map(j => j.id === editingJob.id ? { ...j, ...formData } as JobUpdate : j));
    } else {
      // TODO: connect to Firestore
      const newJob = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as JobUpdate;
      setJobs(prev => [newJob, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job update?')) {
      // TODO: connect to Firestore
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  const getStatusStyle = (status: JobStatus) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-red-100 text-red-700';
      case 'Yet to start': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'Open': return CheckCircle2;
      case 'Closed': return AlertCircle;
      case 'Yet to start': return Clock;
      default: return Clock;
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.notification.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.eligibility.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Updates</h1>
          <p className="text-slate-500 mt-1">Publish latest job notifications and recruitment alerts.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Job Update
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search by notification title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => {
            const StatusIcon = getStatusIcon(job.status);
            return (
              <motion.div 
                key={job.id}
                layout
                className="p-5 border border-slate-100 rounded-2xl hover:border-game-teal transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-game-teal/10 group-hover:text-game-teal transition-colors">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-900">{job.notification}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${getStatusStyle(job.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {job.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">{job.eligibility}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.branches.map(branch => (
                          <span key={branch} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                            {branch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Date</p>
                      <p className="text-sm font-bold text-slate-700">{job.startDate} to {job.endDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(job)}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filteredJobs.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
              <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No job updates found.</p>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingJob ? 'Edit Job Update' : 'New Job Notification'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="label-text">Organization / Notification Title</label>
                    <input 
                      type="text" 
                      value={formData.notification}
                      onChange={(e) => setFormData({ ...formData, notification: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Eligibility Criteria</label>
                    <input 
                      type="text" 
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  
                  <div>
                    <label className="label-text">Start Date</label>
                    <input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">End Date</label>
                    <input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input-field" required 
                    />
                  </div>

                  <div>
                    <label className="label-text">Application Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                      className="input-field appearance-none bg-no-repeat bg-[right_1rem_center]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7' /%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                      <option value="Yet to start">Yet to start</option>
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <label className="label-text">Target Branches (Press Enter)</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={branchInput}
                        onChange={(e) => setBranchInput(e.target.value)}
                        onKeyDown={handleAddBranch}
                        className="input-field" 
                        placeholder="e.g. Mechanical"
                      />
                      <div className="flex flex-wrap gap-2">
                        {formData.branches?.map(branch => (
                          <span key={branch} className="px-3 py-1 bg-game-teal/10 text-game-teal text-xs font-bold rounded-lg flex items-center gap-2">
                            {branch}
                            <button type="button" onClick={() => removeBranch(branch)}><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label-text">Official Notification Link (PDF)</label>
                    <input 
                      type="url" 
                      value={formData.pdfLink}
                      onChange={(e) => setFormData({ ...formData, pdfLink: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Useful Links (Apply Now)</label>
                    <input 
                      type="url" 
                      value={formData.usefulLinks}
                      onChange={(e) => setFormData({ ...formData, usefulLinks: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Recommended Course Link</label>
                    <input 
                      type="url" 
                      value={formData.recommendedCourse}
                      onChange={(e) => setFormData({ ...formData, recommendedCourse: e.target.value })}
                      className="input-field" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">{editingJob ? 'Update Notification' : 'Publish Update'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

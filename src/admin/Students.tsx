/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Trash2,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  ChevronRight,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';

const initialStudents: Student[] = [
  {
    id: '1',
    name: 'Aniket Sharma',
    phone: '+91 98765 43210',
    email: 'aniket.s@gmail.com',
    joinedAt: '2024-06-15T10:30:00Z',
    purchasedCount: 3
  },
  {
    id: '2',
    name: 'Priya Verma',
    phone: '+91 87654 32109',
    email: 'priya.v@outlook.com',
    joinedAt: '2024-07-02T14:20:00Z',
    purchasedCount: 1
  },
  {
    id: '3',
    name: 'Rahul Gupta',
    phone: '+91 76543 21098',
    email: 'rahul.g@yahoo.com',
    joinedAt: '2024-07-05T09:15:00Z',
    purchasedCount: 0
  }
];

export default function Students() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
      // TODO: connect to Firestore
      setStudents(prev => prev.filter(s => s.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Students</h1>
          <p className="text-slate-500 mt-1">Manage student records and view their activity.</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search students by name, email or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 text-slate-500 text-sm">
                <th className="pb-4 font-semibold">Student Name</th>
                <th className="pb-4 font-semibold">Contact Info</th>
                <th className="pb-4 font-semibold">Joined Date</th>
                <th className="pb-4 font-semibold">PDFs Owned</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedStudent(student)}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-game-teal group-hover:text-white transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-slate-800">{student.name}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{student.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatDate(student.joinedAt)}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        student.purchasedCount > 0 ? 'bg-game-teal/10 text-game-teal' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {student.purchasedCount} {student.purchasedCount === 1 ? 'PDF' : 'PDFs'}
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSelectedStudent(student)} className="p-2 text-slate-400 hover:text-game-teal transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p>No students found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Drawer */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedStudent(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Student Profile</h2>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Header Info */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <User className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-slate-500">{selectedStudent.email}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Purchases</p>
                    <p className="text-2xl font-black text-game-teal">{selectedStudent.purchasedCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Member Since</p>
                    <p className="text-sm font-bold text-slate-900">{formatDate(selectedStudent.joinedAt)}</p>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 font-medium">{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 font-medium">{selectedStudent.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Purchases History */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Purchase History</h4>
                  {selectedStudent.purchasedCount > 0 ? (
                    <div className="space-y-3">
                      {[1, 2, 3].slice(0, selectedStudent.purchasedCount).map((i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-2xl border border-slate-100 hover:border-game-teal/30 hover:bg-game-teal/5 transition-all group">
                          <div className="w-10 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-game-teal group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">Fluid Mechanics Master Notes Vol. {i}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Purchased on {formatDate(selectedStudent.joinedAt)}</p>
                          </div>
                          <ShoppingBag className="w-4 h-4 text-slate-300 group-hover:text-game-teal" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-sm text-slate-400 font-medium">No PDFs purchased yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-4 bg-slate-50/50">
                <button 
                  onClick={() => handleDelete(selectedStudent.id)}
                  className="btn-secondary text-red-500 hover:bg-red-50 hover:border-red-100 flex-1 justify-center"
                >
                  Delete Student
                </button>
                <button className="btn-primary flex-1 justify-center">
                  Message Student
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

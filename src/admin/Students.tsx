/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { getAll, deleteItem } from '../services/firestoreService';

const PAGE_SIZE = 10;

// Raw shapes as stored in Firestore.
interface UserDoc {
  uid?: string;
  displayName?: string;
  name?: string;
  phoneNumber?: string | null;
  phone?: string;
  email?: string;
  role?: string;
  createdAt?: unknown;
  joinedDate?: string;
}

interface PurchaseDoc {
  uid?: string;
  pdfId?: string;
  pdfTitle?: string;
  amount?: number;
  date?: string;
  status?: string;
}

// Firestore timestamps come back as {seconds,nanoseconds} or a Timestamp with
// toDate(); normalise any of those (or an ISO string) to an ISO string.
function toISO(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const anyVal = value as any;
  if (typeof anyVal?.toDate === 'function') return anyVal.toDate().toISOString();
  if (typeof anyVal?.seconds === 'number') return new Date(anyVal.seconds * 1000).toISOString();
  return '';
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [purchasesByUid, setPurchasesByUid] = useState<Record<string, PurchaseDoc[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const users = await getAll<UserDoc>('users');

        // Purchases power the "PDFs owned" count and the drawer history. If the
        // admin can't read them (or none exist yet), fall back to empty.
        let purchases: (PurchaseDoc & { id: string })[] = [];
        try {
          purchases = await getAll<PurchaseDoc>('purchases');
        } catch (err) {
          console.error('Could not load purchases (counts will show 0):', err);
        }

        const byUid: Record<string, PurchaseDoc[]> = {};
        purchases.forEach((p) => {
          if (!p.uid) return;
          (byUid[p.uid] ||= []).push(p);
        });

        const mapped: Student[] = users
          // Only show students, never admin accounts.
          .filter((u) => (u.role ?? 'student') !== 'admin')
          .map((u) => ({
            id: u.uid || (u as any).id,
            name: u.displayName || u.name || 'Student',
            phone: u.phoneNumber || u.phone || '—',
            email: u.email || '—',
            joinedAt: toISO(u.createdAt) || u.joinedDate || '',
            purchasedCount: byUid[(u.uid || (u as any).id) as string]?.length || 0,
          }))
          // Newest first.
          .sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''));

        if (isMounted) {
          setStudents(mapped);
          setPurchasesByUid(byUid);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load students:', err);
        if (isMounted) {
          setLoadError(
            err?.code === 'permission-denied'
              ? 'You do not have permission to view student records. Make sure you are signed in as an admin.'
              : 'Could not load student records. Please try again.'
          );
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteItem('users', id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Could not delete this student. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStudents = useMemo(
    () =>
      students.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
      ),
    [students, searchTerm]
  );

  const { pagedItems: pagedStudents, currentPage, totalPages, setPage } = usePagination(filteredStudents, PAGE_SIZE);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const selectedPurchases = selectedStudent ? (purchasesByUid[selectedStudent.id] || []) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Students</h1>
          <p className="text-slate-500 mt-1">
            {isLoading ? 'Loading student records…' : `${students.length} registered ${students.length === 1 ? 'student' : 'students'}.`}
          </p>
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

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-game-teal" />
            <p className="text-sm font-medium">Loading students…</p>
          </div>
        ) : loadError ? (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 max-w-sm">{loadError}</p>
          </div>
        ) : (
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
                {pagedStudents.map((student) => (
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
                        <button onClick={() => handleDelete(student.id)} disabled={deletingId === student.id} className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40">
                          {deletingId === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p>{students.length === 0 ? 'No students have registered yet.' : 'No students found matching your search.'}</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !loadError && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />}
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
                  {selectedPurchases.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPurchases.map((p, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-2xl border border-slate-100 hover:border-game-teal/30 hover:bg-game-teal/5 transition-all group">
                          <div className="w-10 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-game-teal group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{p.pdfTitle || 'PDF'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {p.date ? `Purchased on ${formatDate(p.date)}` : 'Purchased'}{typeof p.amount === 'number' ? ` · ₹${p.amount}` : ''}
                            </p>
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

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => handleDelete(selectedStudent.id)}
                  disabled={deletingId === selectedStudent.id}
                  className="btn-secondary text-red-500 hover:bg-red-50 hover:border-red-100 w-full justify-center disabled:opacity-50"
                >
                  {deletingId === selectedStudent.id ? 'Deleting…' : 'Delete Student'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

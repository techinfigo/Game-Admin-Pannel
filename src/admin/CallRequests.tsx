/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, Phone, RefreshCw, GraduationCap } from 'lucide-react';
import { getAll } from '../services/firestoreService';

interface CallbackRequest {
  id: string;
  name?: string;
  phone?: string;
  exam?: string;
  message?: string;
  status?: string;
  source?: string;
  createdAt?: string;
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CallRequests() {
  const [rows, setRows] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const load = () => {
    setLoading(true);
    getAll<CallbackRequest>('callbackRequests')
      .then((list) => {
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setRows(list);
        setError('');
      })
      .catch((e) => setError(e?.message || 'Could not load requests.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) => [r.name, r.phone, r.exam].some((v) => (v || '').toLowerCase().includes(t)));
  }, [rows, q]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Call Requests</h1>
          <p className="text-slate-500 text-sm font-medium">People who asked to be called back from the website.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Requests</div>
          <div className="text-2xl font-black mt-1 text-[#075d63]">{rows.length}</div>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, exam…" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-slate-400 outline-none" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" /> Loading…</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-bold">{error}</div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium">No call requests yet.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-black">Name</th>
                <th className="px-4 py-3 font-black">Phone</th>
                <th className="px-4 py-3 font-black">Exam / Branch</th>
                <th className="px-4 py-3 font-black">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-bold text-slate-900">{r.name || '—'}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-[#075d63] font-bold hover:underline"><Phone size={13} /> {r.phone || '—'}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.exam ? <span className="inline-flex items-center gap-1"><GraduationCap size={13} /> {r.exam}</span> : '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

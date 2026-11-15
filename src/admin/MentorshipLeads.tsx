/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, Clock, IndianRupee, Mail, Phone, RefreshCw } from 'lucide-react';
import { getAll } from '../services/firestoreService';

interface MentorshipLead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  branch?: string;
  message?: string;
  amount?: number;
  status?: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  failReason?: string;
  emailSent?: boolean;
  createdAt?: string;
  paidAt?: string;
}

const STATUS = {
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  failed: { label: 'Failed / Abandoned', cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
} as const;

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MentorshipLeads() {
  const [leads, setLeads] = useState<MentorshipLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'failed' | 'pending'>('all');

  const load = () => {
    setLoading(true);
    getAll<MentorshipLead>('mentorshipLeads')
      .then((rows) => {
        rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setLeads(rows);
        setError('');
      })
      .catch((e) => setError(e?.message || 'Could not load leads.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const stats = useMemo(() => ({
    total: leads.length,
    paid: leads.filter((l) => l.status === 'paid').length,
    failed: leads.filter((l) => l.status === 'failed').length,
    pending: leads.filter((l) => l.status === 'pending').length,
    revenue: leads.filter((l) => l.status === 'paid').reduce((s, l) => s + (Number(l.amount) || 0), 0),
  }), [leads]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter !== 'all' && (l.status || 'pending') !== filter) return false;
      if (!t) return true;
      return [l.name, l.email, l.phone, l.branch].some((v) => (v || '').toLowerCase().includes(t));
    });
  }, [leads, q, filter]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">1:1 Mentorship Leads</h1>
          <p className="text-slate-500 text-sm font-medium">Every booking enquiry — paid, failed and pending.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Tile label="Total" value={stats.total} />
        <Tile label="Paid" value={stats.paid} tone="emerald" />
        <Tile label="Failed" value={stats.failed} tone="red" />
        <Tile label="Pending" value={stats.pending} tone="amber" />
        <Tile label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} tone="teal" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-slate-400 outline-none" />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'paid', 'failed', 'pending'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize ${filter === f ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" /> Loading…</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-bold">{error}</div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium">No leads yet.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-black">Student</th>
                <th className="px-4 py-3 font-black">Contact</th>
                <th className="px-4 py-3 font-black">Exam/Branch</th>
                <th className="px-4 py-3 font-black">Amount</th>
                <th className="px-4 py-3 font-black">Status</th>
                <th className="px-4 py-3 font-black">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((l) => {
                const st = STATUS[(l.status || 'pending') as keyof typeof STATUS] || STATUS.pending;
                return (
                  <tr key={l.id} className="hover:bg-slate-50/60 align-top">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{l.name || '—'}</div>
                      {l.message && <div className="text-xs text-slate-400 max-w-[200px] truncate" title={l.message}>{l.message}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1 text-xs"><Mail size={12} /> {l.email || '—'}</div>
                      <div className="flex items-center gap-1 text-xs mt-1"><Phone size={12} /> {l.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.branch || '—'}</td>
                    <td className="px-4 py-3 font-bold text-slate-900"><span className="inline-flex items-center"><IndianRupee size={13} />{(Number(l.amount) || 0).toLocaleString('en-IN')}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-black ${st.cls}`}>
                        <st.Icon size={12} /> {st.label}
                      </span>
                      {l.status === 'failed' && l.failReason && <div className="text-[10px] text-red-400 mt-1 max-w-[160px] truncate" title={l.failReason}>{l.failReason}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'emerald' | 'red' | 'amber' | 'teal' }) {
  const toneCls = tone === 'emerald' ? 'text-emerald-600' : tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : tone === 'teal' ? 'text-[#075d63]' : 'text-slate-900';
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`text-2xl font-black mt-1 ${toneCls}`}>{value}</div>
    </div>
  );
}

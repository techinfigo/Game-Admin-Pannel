/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Download,
  IndianRupee,
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from '../types';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { getAll } from '../services/firestoreService';

const PAGE_SIZE = 10;

interface PurchaseDoc {
  uid?: string;
  pdfId?: string;
  pdfTitle?: string;
  amount?: number;
  paymentId?: string;
  orderId?: string;
  status?: string;
  date?: string;
  createdAt?: unknown;
  couponCode?: string;
}

interface UserDoc {
  uid?: string;
  displayName?: string;
  name?: string;
  phoneNumber?: string | null;
  phone?: string;
}

function toISO(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const anyVal = value as any;
  if (typeof anyVal?.toDate === 'function') return anyVal.toDate().toISOString();
  if (typeof anyVal?.seconds === 'number') return new Date(anyVal.seconds * 1000).toISOString();
  return '';
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [purchases, users] = await Promise.all([
          getAll<PurchaseDoc>('purchases'),
          getAll<UserDoc>('users').catch(() => [] as (UserDoc & { id: string })[]),
        ]);

        const userById: Record<string, UserDoc> = {};
        users.forEach((u) => {
          const key = u.uid || (u as any).id;
          if (key) userById[key] = u;
        });

        const mapped: Transaction[] = purchases
          .map((p) => {
            const u = p.uid ? userById[p.uid] : undefined;
            return {
              id: (p as any).id,
              studentName: u?.displayName || u?.name || 'Student',
              studentPhone: u?.phoneNumber || u?.phone || '—',
              pdfTitle: p.pdfTitle || 'PDF',
              amount: Number(p.amount) || 0,
              paymentId: p.paymentId || '—',
              status: (p.status || 'success').toLowerCase() as Transaction['status'],
              createdAt: p.date || toISO(p.createdAt),
              couponCode: p.couponCode || '',
            };
          })
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        if (isMounted) {
          setTransactions(mapped);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load transactions:', err);
        if (isMounted) {
          setLoadError(
            err?.code === 'permission-denied'
              ? 'You do not have permission to view transactions. Make sure you are signed in as an admin.'
              : 'Could not load transactions. Please try again.'
          );
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesSearch =
          t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.pdfTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.paymentId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

        let matchesDate = true;
        if (dateRange.start) matchesDate = new Date(t.createdAt) >= new Date(dateRange.start);
        if (dateRange.end && matchesDate) matchesDate = new Date(t.createdAt) <= new Date(dateRange.end + 'T23:59:59');

        return matchesSearch && matchesStatus && matchesDate;
      }),
    [transactions, searchTerm, statusFilter, dateRange]
  );

  const { pagedItems: pagedTransactions, currentPage, totalPages, setPage } = usePagination(filteredTransactions, PAGE_SIZE);

  // Real stats computed from successful purchases.
  const stats = useMemo(() => {
    const success = transactions.filter((t) => t.status === 'success');
    const totalRevenue = success.reduce((sum, t) => sum + t.amount, 0);
    const now = new Date();
    const thisMonth = success
      .filter((t) => {
        const d = new Date(t.createdAt);
        return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);
    const uniqueBuyers = new Set(success.map((t) => t.studentPhone + t.studentName)).size;
    const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
    return [
      { label: 'Total Revenue', value: inr(totalRevenue), icon: IndianRupee, color: 'bg-green-500' },
      { label: 'This Month', value: inr(thisMonth), icon: TrendingUp, color: 'bg-game-teal' },
      { label: 'Total Sales', value: String(transactions.length), icon: CreditCard, color: 'bg-blue-500' },
      { label: 'Unique Buyers', value: String(uniqueBuyers), icon: Users, color: 'bg-indigo-500' },
    ];
  }, [transactions]);

  const exportToCSV = () => {
    const headers = ['Student', 'Phone', 'Item', 'Amount', 'Coupon', 'Payment ID', 'Status', 'Date'];
    const rows = filteredTransactions.map((t) => [
      t.studentName, t.studentPhone, t.pdfTitle, t.amount, t.couponCode || '', t.paymentId, t.status, t.createdAt,
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Transactions_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-600 border-green-200';
      case 'failed': return 'bg-red-100 text-red-600 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle2;
      case 'failed': return AlertCircle;
      case 'pending': return Clock;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-slate-500 mt-1">
            {isLoading ? 'Loading sales…' : `${transactions.length} recorded ${transactions.length === 1 ? 'sale' : 'sales'}.`}
          </p>
        </div>
        <button onClick={exportToCSV} disabled={isLoading || !!loadError} className="btn-secondary disabled:opacity-50">
          <Download className="w-5 h-5" />
          Export to CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="admin-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{isLoading ? '—' : stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="admin-card">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by student, item or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
              {(['all', 'success', 'failed', 'pending'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    statusFilter === s ? 'bg-white text-game-teal shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="input-field py-1.5 text-xs w-36"
              />
              <span className="text-slate-300">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="input-field py-1.5 text-xs w-36"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-game-teal" />
            <p className="text-sm font-medium">Loading transactions…</p>
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
                  <th className="pb-4 font-semibold">Transaction Info</th>
                  <th className="pb-4 font-semibold">Student Details</th>
                  <th className="pb-4 font-semibold">Amount</th>
                  <th className="pb-4 font-semibold">Coupon</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedTransactions.map((t) => {
                  const StatusIcon = getStatusIcon(t.status);
                  return (
                    <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 line-clamp-1">{t.pdfTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tighter uppercase">{t.paymentId}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{t.studentName}</span>
                          <span className="text-[11px] text-slate-400">{t.studentPhone}</span>
                        </div>
                      </td>
                      <td className="py-4 font-black text-slate-900">₹{t.amount}</td>
                      <td className="py-4">
                        {t.couponCode ? (
                          <span className="inline-block px-2 py-1 rounded-lg bg-game-teal/10 text-game-teal text-[10px] font-black uppercase tracking-wider">{t.couponCode}</span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyles(t.status)}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {t.status}
                        </div>
                      </td>
                      <td className="py-4 text-xs text-slate-500 font-medium">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p>{transactions.length === 0 ? 'No sales yet.' : 'No transactions match your filters.'}</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !loadError && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />}
      </div>
    </div>
  );
}

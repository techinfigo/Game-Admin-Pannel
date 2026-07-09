/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter,
  Download,
  Calendar,
  IndianRupee,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from '../types';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    studentName: 'Aniket Sharma',
    studentPhone: '+91 98765 43210',
    pdfTitle: 'Complete Fluid Mechanics Sheet',
    amount: 199,
    paymentId: 'pay_Nsh29kSj20',
    status: 'success',
    createdAt: '2024-07-08T10:30:00Z'
  },
  {
    id: '2',
    studentName: 'Priya Verma',
    studentPhone: '+91 87654 32109',
    pdfTitle: 'Thermodynamics PYQ Bank',
    amount: 199,
    paymentId: 'pay_Msh12kSj20',
    status: 'failed',
    createdAt: '2024-07-08T09:15:00Z'
  },
  {
    id: '3',
    studentName: 'Rahul Gupta',
    studentPhone: '+91 76543 21098',
    pdfTitle: 'Machine Design Short Notes',
    amount: 99,
    paymentId: 'pay_Osh99kSj20',
    status: 'pending',
    createdAt: '2024-07-07T16:45:00Z'
  },
  {
    id: '4',
    studentName: 'Suresh Kumar',
    studentPhone: '+91 65432 10987',
    pdfTitle: 'Industrial Eng Formulas',
    amount: 149,
    paymentId: 'pay_Psh88kSj20',
    status: 'success',
    createdAt: '2024-07-07T14:20:00Z'
  }
];

export default function Transactions() {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.pdfTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    // Simple date filter logic
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = new Date(t.createdAt) >= new Date(dateRange.start);
    }
    if (dateRange.end && matchesDate) {
      matchesDate = new Date(t.createdAt) <= new Date(dateRange.end);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = [
    { label: 'Total Revenue', value: '₹14,250', icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Sales This Month', value: '₹4,890', icon: TrendingUp, color: 'bg-game-teal' },
    { label: 'Total Transactions', value: '124', icon: CreditCard, color: 'bg-blue-500' },
    { label: 'Failed Payments', value: '8', icon: AlertCircle, color: 'bg-red-500' },
  ];

  const exportToCSV = () => {
    const headers = ['ID', 'Student', 'Phone', 'Item', 'Amount', 'Payment ID', 'Status', 'Date'];
    const rows = filteredTransactions.map(t => [
      t.id, t.studentName, t.studentPhone, t.pdfTitle, t.amount, t.paymentId, t.status, t.createdAt
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Transactions_${new Date().toLocaleDateString()}.csv`);
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
          <p className="text-slate-500 mt-1">Review and audit all sales transactions and payments.</p>
        </div>
        <button onClick={exportToCSV} className="btn-secondary">
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
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 text-slate-500 text-sm">
                <th className="pb-4 font-semibold">Transaction Info</th>
                <th className="pb-4 font-semibold">Student Details</th>
                <th className="pb-4 font-semibold">Amount</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => {
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
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyles(t.status)}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {t.status}
                      </div>
                    </td>
                    <td className="py-4 text-xs text-slate-500 font-medium">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p>No transactions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

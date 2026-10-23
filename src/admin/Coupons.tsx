/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, Plus, Trash2, Pencil, X, Loader2, AlertCircle, Search, Power } from 'lucide-react';
import { Coupon } from '../types';
import { getAll, addItem, updateItem, deleteItem } from '../services/firestoreService';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const COLLECTION = 'coupons';
const PAGE_SIZE = 10;

type FormState = {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minAmount: number;
  maxUses: number;
  expiresAt: string;
  active: boolean;
};

const emptyForm: FormState = {
  code: '',
  type: 'percent',
  value: 10,
  minAmount: 0,
  maxUses: 0,
  expiresAt: '',
  active: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getAll<Coupon>(COLLECTION);
      setCoupons(data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load coupons:', err);
      setLoadError(
        err?.code === 'permission-denied'
          ? 'You do not have permission to view coupons. Make sure you are signed in as an admin.'
          : 'Could not load coupons. Please try again.'
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minAmount: c.minAmount || 0,
      maxUses: c.maxUses || 0,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      active: c.active,
    });
    setFormError('');
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const code = form.code.trim().toUpperCase();
    if (!code) return setFormError('Please enter a coupon code.');
    if (!form.value || form.value <= 0) return setFormError('Discount value must be greater than 0.');
    if (form.type === 'percent' && form.value > 100) return setFormError('Percentage cannot be more than 100.');

    // Prevent duplicate codes (ignore the one being edited).
    if (coupons.some((c) => c.code.toUpperCase() === code && c.id !== editing?.id)) {
      return setFormError('A coupon with this code already exists.');
    }

    const payload: Partial<Coupon> = {
      code,
      type: form.type,
      value: Number(form.value),
      minAmount: Number(form.minAmount) || 0,
      maxUses: Number(form.maxUses) || 0,
      active: form.active,
      expiresAt: form.expiresAt ? new Date(form.expiresAt + 'T23:59:59').toISOString() : '',
    };

    setSaving(true);
    try {
      if (editing) {
        await updateItem<Coupon>(COLLECTION, editing.id, payload);
      } else {
        await addItem<Coupon>(COLLECTION, { ...payload, usedCount: 0, createdAt: new Date().toISOString() } as any);
      }
      setShowForm(false);
      setIsLoading(true);
      await load();
    } catch (err) {
      console.error('Failed to save coupon:', err);
      setFormError('Could not save the coupon. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    try {
      await updateItem<Coupon>(COLLECTION, c.id, { active: !c.active });
    } catch {
      setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: c.active } : x))); // revert
    }
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return;
    try {
      await deleteItem(COLLECTION, c.id);
      setCoupons((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      alert('Could not delete this coupon.');
    }
  };

  const filtered = useMemo(
    () => coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase())),
    [coupons, search]
  );
  const { pagedItems, currentPage, totalPages, setPage } = usePagination(filtered, PAGE_SIZE);

  const fmtDate = (d?: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const isExpired = (d?: string) => !!d && new Date(d).getTime() < Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Coupons</h1>
          <p className="text-slate-500 mt-1">Discount codes students can apply when buying PDFs.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-5 h-5" /> New Coupon
        </button>
      </div>

      <div className="admin-card">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search coupons by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-game-teal" />
            <p className="text-sm font-medium">Loading coupons…</p>
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
                  <th className="pb-4 font-semibold">Code</th>
                  <th className="pb-4 font-semibold">Discount</th>
                  <th className="pb-4 font-semibold">Usage</th>
                  <th className="pb-4 font-semibold">Expires</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedItems.map((c) => (
                  <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-game-teal/10 flex items-center justify-center text-game-teal">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <span className="font-black text-slate-800 tracking-wider">{c.code}</span>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-700">
                      {c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}
                      {c.minAmount ? <span className="block text-[10px] text-slate-400 font-medium">min ₹{c.minAmount}</span> : null}
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      {c.usedCount || 0}
                      {c.maxUses ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="py-4 text-sm">
                      <span className={isExpired(c.expiresAt) ? 'text-red-500 font-bold' : 'text-slate-600'}>
                        {fmtDate(c.expiresAt)}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                          c.active && !isExpired(c.expiresAt)
                            ? 'bg-green-100 text-green-600 border-green-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {isExpired(c.expiresAt) ? 'Expired' : c.active ? 'Active' : 'Off'}
                      </button>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-game-teal transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(c)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p>{coupons.length === 0 ? 'No coupons yet. Create your first one.' : 'No coupons match your search.'}</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !loadError && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-5">
              <div>
                <label className="label-text">Coupon Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="input-field font-black tracking-wider uppercase"
                  placeholder="e.g. GATE20"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Students type this at checkout. Not case-sensitive.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Discount Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'percent' | 'flat' })}
                    className="input-field"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">{form.type === 'percent' ? 'Percent off' : 'Amount off (₹)'}</label>
                  <input
                    type="number"
                    value={form.value === 0 ? '' : form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="input-field"
                    min={1}
                    max={form.type === 'percent' ? 100 : undefined}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Min order (₹) <span className="text-slate-400 font-normal">optional</span></label>
                  <input
                    type="number"
                    value={form.minAmount === 0 ? '' : form.minAmount}
                    onChange={(e) => setForm({ ...form, minAmount: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="input-field"
                    min={0}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label-text">Max uses <span className="text-slate-400 font-normal">0 = unlimited</span></label>
                  <input
                    type="number"
                    value={form.maxUses === 0 ? '' : form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="input-field"
                    min={0}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Expiry date <span className="text-slate-400 font-normal">optional</span></label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="input-field"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded text-game-teal border-slate-300 focus:ring-game-teal"
                />
                <span className="text-sm font-semibold text-slate-700">Active (students can use it)</span>
              </label>

              {formError && <p className="text-sm text-red-500 font-bold">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Search,
  FileText,
  Edit2,
  Trash2,
  X,
  Upload,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PdfItem } from '../types';
import { getAll, addItem, updateItem, deleteItem } from '../services/firestoreService';
import { uploadPdf } from '../services/uploadService';
import ImageUploadField from '../components/ImageUploadField';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const PAGE_SIZE = 10;

const COLLECTION = 'pdfs';

const emptyForm: Partial<PdfItem> = {
  title: '',
  description: '',
  thumbnailUrl: '',
  examTag: '',
  category: '',
  fileUrl: '',
  fileName: '',
  isFree: true,
  price: 0,
  pageCount: 0,
  previewPages: 0,
  published: true
};

export default function PdfStore() {
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<PdfItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<PdfItem>>(emptyForm);

  const loadPdfs = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAll<PdfItem>(COLLECTION);
      setPdfs(data);
    } catch (error) {
      console.error('Failed to load PDFs', error);
      setErrorMessage('Failed to load PDFs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPdfs();
  }, []);

  const handleOpenModal = (pdf?: PdfItem) => {
    setPdfUploadError(null);
    if (pdf) {
      setEditingPdf(pdf);
      setFormData(pdf);
    } else {
      setEditingPdf(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPdf(null);
    setPdfUploadError(null);
  };

  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPdfUploadError(null);
    setIsUploadingPdf(true);
    try {
      const { fileUrl, fileName, pageCount } = await uploadPdf(file);
      setFormData(prev => ({
        ...prev,
        fileUrl,
        fileName,
        ...(pageCount ? { pageCount } : {})
      }));
    } catch (error) {
      console.error('Failed to upload PDF', error);
      setPdfUploadError(error instanceof Error ? error.message : 'Failed to upload PDF. Please try again.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const isFree = !!formData.isFree;
    if (!isFree && (!formData.price || formData.price <= 0)) {
      setErrorMessage('Please set a price greater than 0, or mark this PDF as free.');
      return;
    }

    const payload: Partial<PdfItem> = {
      ...formData,
      price: isFree ? 0 : formData.price
    };

    try {
      if (editingPdf) {
        await updateItem<PdfItem>(COLLECTION, editingPdf.id, payload);
      } else {
        await addItem<PdfItem>(COLLECTION, {
          ...payload,
          createdAt: new Date().toISOString()
        } as PdfItem);
      }
      await loadPdfs();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save PDF item', error);
      setErrorMessage('Failed to save PDF item.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this PDF?')) {
      setErrorMessage(null);
      try {
        await deleteItem(COLLECTION, id);
        await loadPdfs();
      } catch (error) {
        console.error('Failed to delete PDF', error);
        setErrorMessage('Failed to delete PDF.');
      }
    }
  };

  const filteredPdfs = pdfs.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.examTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { pagedItems: pagedPdfs, currentPage, totalPages, setPage } = usePagination(filteredPdfs, PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PDF Store</h1>
            <p className="text-slate-500 mt-1">Manage study materials and question banks for students.</p>
          </div>
        </div>
        <div className="admin-card flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-game-teal rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PDF Store</h1>
          <p className="text-slate-500 mt-1">Manage study materials and question banks for students.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add PDF Item
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {errorMessage}
        </div>
      )}

      <div className="admin-card">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by title, category or exam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {filteredPdfs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No PDF items found.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 text-slate-500 text-sm">
                <th className="pb-4 font-semibold">PDF Info</th>
                <th className="pb-4 font-semibold">Category</th>
                <th className="pb-4 font-semibold">Pricing</th>
                <th className="pb-4 font-semibold">Stats</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedPdfs.map((pdf) => (
                <tr key={pdf.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        {pdf.thumbnailUrl ? (
                          <img src={pdf.thumbnailUrl} alt={pdf.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{pdf.title}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">{pdf.examTag}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-600 font-medium">{pdf.category}</td>
                  <td className="py-4">
                    {pdf.isFree ? (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-lg uppercase">Free</span>
                    ) : (
                      <span className="px-2 py-1 bg-game-teal/10 text-game-teal text-[10px] font-bold rounded-lg uppercase">₹{pdf.price}</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col text-[11px] text-slate-500">
                      <span className="font-medium">{pdf.pageCount} Pages</span>
                      <span>{pdf.previewPages} Preview</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1.5">
                      {pdf.published ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Draft</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(pdf)} className="p-2 text-slate-400 hover:text-game-teal transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(pdf.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 bg-white z-20">
                <h2 className="text-xl font-bold text-slate-900">{editingPdf ? 'Edit PDF Item' : 'Add New PDF Item'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="label-text">Title</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field font-bold" placeholder="e.g. Thermodynamics PYQ Bank" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-[80px]" placeholder="Summary of the content..." required />
                  </div>
                  <div>
                    <label className="label-text">Exam Category</label>
                    <input type="text" value={formData.examTag} onChange={(e) => setFormData({ ...formData, examTag: e.target.value })} className="input-field" placeholder="e.g. GATE" required />
                  </div>
                  <div>
                    <label className="label-text">Content Category</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" placeholder="e.g. Question Bank" required />
                  </div>
                  
                  <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isFree} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? 0 : formData.price })} className="w-4 h-4 rounded text-game-teal border-slate-300 focus:ring-game-teal" />
                        <span className="text-sm font-bold text-slate-700">This is a Free PDF</span>
                      </label>
                    </div>
                    {!formData.isFree && (
                      <div>
                        <label className="label-text">Price (₹)</label>
                        <div className="relative">
                          <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="input-field pl-10" placeholder="0" min="1" required />
                          <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <label className="label-text">PDF File Upload</label>
                    <label className={`border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group ${isUploadingPdf ? 'opacity-60 cursor-not-allowed' : 'hover:border-game-teal/50 hover:bg-game-teal/5 cursor-pointer'}`}>
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-game-teal group-hover:text-white transition-all mb-3">
                        {isUploadingPdf ? (
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-game-teal rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <p className="font-bold text-slate-700">{isUploadingPdf ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
                      <p className="text-xs text-slate-400 mt-1">PDF files only</p>
                      <input
                        ref={pdfFileInputRef}
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                        disabled={isUploadingPdf}
                        onChange={handlePdfFileSelect}
                      />
                    </label>
                    {pdfUploadError && <p className="text-xs text-red-500 font-bold">{pdfUploadError}</p>}
                    {formData.fileName && (
                      <div className="flex items-center justify-between p-3 bg-game-teal/5 rounded-xl border border-game-teal/20">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-game-teal" />
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[300px]">{formData.fileName}</span>
                        </div>
                        <button type="button" onClick={() => setFormData({ ...formData, fileName: '', fileUrl: '' })} className="p-1 hover:bg-white rounded-lg transition-colors text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Thumbnail Image"
                      value={formData.thumbnailUrl}
                      onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                      folder="pdfs"
                      hint="Recommended: 600 × 800 px (cover)"
                    />
                  </div>

                  <div>
                    <label className="label-text">Total Pages</label>
                    <input type="number" value={formData.pageCount} onChange={(e) => setFormData({ ...formData, pageCount: Number(e.target.value) })} className="input-field" placeholder="0" min="1" required />
                  </div>
                  <div>
                    <label className="label-text">Preview Pages</label>
                    <input type="number" value={formData.previewPages} onChange={(e) => setFormData({ ...formData, previewPages: Number(e.target.value) })} className="input-field" placeholder="0" min="0" required />
                  </div>

                  <div className="md:col-span-2 pt-4 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="w-4 h-4 rounded text-game-teal border-slate-300 focus:ring-game-teal" />
                      <span className="text-sm font-bold text-slate-700">Published (Visible on store)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {editingPdf ? 'Save Changes' : 'Add to Store'}
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

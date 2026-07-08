/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Edit2, 
  Trash2, 
  X, 
  User,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlogPost } from '../types';

const initialPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Crack GATE in 6 Months',
    slug: 'how-to-crack-gate-in-6-months',
    category: 'Strategy',
    coverImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60',
    excerpt: 'A comprehensive guide for engineering students to prepare for GATE 2025 with a 6-month roadmap.',
    content: 'Long content would go here...',
    author: 'Admin',
    authorRole: 'Founder & Mentor',
    readTime: '8 min read',
    publishedDate: '2026-07-01',
    tags: ['GATE', 'Preparation', 'Roadmap'],
    published: true,
    featured: true
  },
  {
    id: '2',
    title: 'Top 10 PSU Recruitments through SSC-JE',
    slug: 'top-10-psu-ssc-je',
    category: 'Career',
    coverImageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60',
    excerpt: 'Explore the best Public Sector Undertakings you can join after qualifying SSC-JE exam.',
    content: 'Long content would go here...',
    author: 'GAME Faculty',
    authorRole: 'Senior Faculty',
    readTime: '5 min read',
    publishedDate: '2026-06-25',
    tags: ['SSC-JE', 'Jobs', 'PSU'],
    published: false,
    featured: false
  }
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    category: 'Strategy',
    coverImageUrl: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    authorRole: 'Founder & Mentor',
    readTime: '5 min read',
    publishedDate: new Date().toISOString().split('T')[0],
    tags: [],
    published: true,
    featured: false
  });

  const [tagInput, setTagInput] = useState('');

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData(post);
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        category: 'Strategy',
        coverImageUrl: '',
        excerpt: '',
        content: '',
        author: 'Admin',
        authorRole: 'Founder & Mentor',
        readTime: '5 min read',
        publishedDate: new Date().toISOString().split('T')[0],
        tags: [],
        published: true,
        featured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      // TODO: connect to Firestore
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...formData } as BlogPost : p));
    } else {
      // TODO: connect to Firestore
      const newPost = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        slug: formData.title?.toLowerCase().replace(/ /g, '-') || ''
      } as BlogPost;
      setPosts(prev => [newPost, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      // TODO: connect to Firestore
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const togglePublish = (id: string) => {
    // TODO: connect to Firestore
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: !p.published } : p));
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blog Posts</h1>
          <p className="text-slate-500 mt-1">Manage articles, news, and updates published on the GAME Academy blog.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          New Article
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search articles by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <motion.div 
              key={post.id}
              layout
              className="group border border-slate-100 rounded-3xl overflow-hidden hover:border-game-teal transition-all duration-300 flex flex-col sm:flex-row"
            >
              <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative overflow-hidden">
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm ${
                    post.published ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {post.published ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {post.published ? 'Live' : 'Draft'}
                  </span>
                  {post.featured && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-game-gold text-white shadow-sm flex items-center gap-1">
                      <Plus className="w-3 h-3 rotate-45" /> Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-game-teal bg-game-teal/10 px-2 py-0.5 rounded uppercase">{post.category}</span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-game-teal transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {post.publishedDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePublish(post.id)}
                      className={`p-2 rounded-xl transition-all ${post.published ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(post)}
                      className="p-2 text-slate-400 hover:text-game-teal hover:bg-game-teal/5 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingPost ? 'Edit Article' : 'New Article'}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="label-text">Article Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field" placeholder="Catchy title for the blog post" required 
                    />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="label-text">Category</label>
                      <input 
                        type="text" 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input-field" placeholder="e.g. Strategy" required 
                      />
                    </div>
                    <div>
                      <label className="label-text">Read Time</label>
                      <input 
                        type="text" 
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        className="input-field" placeholder="e.g. 5 min read" required 
                      />
                    </div>
                    <div>
                      <label className="label-text">Publish Date</label>
                      <input 
                        type="date" 
                        value={formData.publishedDate}
                        onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                        className="input-field" required 
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Short Excerpt</label>
                    <textarea 
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="input-field min-h-[80px]" placeholder="A brief summary for cards and search results..." required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Cover Image URL</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={formData.coverImageUrl}
                        onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                        className="input-field pl-10" placeholder="https://images.unsplash.com/..." required 
                      />
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Full Content (Markdown/HTML supported)</label>
                    <textarea 
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="input-field min-h-[200px] font-mono text-sm" placeholder="Write your full article content here..." required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Author Name</label>
                    <input 
                      type="text" 
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="input-field" required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Author Role</label>
                    <input 
                      type="text" 
                      value={formData.authorRole}
                      onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                      className="input-field" placeholder="e.g. Founder & Mentor" required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Tags (Press Enter)</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="input-field" placeholder="Add relevant tags e.g. Exam Tips"
                      />
                      <div className="flex flex-wrap gap-2">
                        {formData.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-game-teal/10 text-game-teal text-xs font-bold rounded-lg flex items-center gap-2">
                            #{tag}
                            <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col sm:flex-row gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={formData.published}
                          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                          className="sr-only" 
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${formData.published ? 'bg-game-teal' : 'bg-slate-200'}`}></div>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.published ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="font-bold text-slate-700">Publish Immediately</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="sr-only" 
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${formData.featured ? 'bg-game-gold' : 'bg-slate-200'}`}></div>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.featured ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="font-bold text-slate-700">Featured Article</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {editingPost ? 'Save Changes' : 'Publish Article'}
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

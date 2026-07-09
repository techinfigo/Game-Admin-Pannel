/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Briefcase,
  GraduationCap,
  Tag,
  Trophy,
  Megaphone,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Star,
  BookOpen,
  Users,
  Video,
  MonitorPlay,
  ShoppingBag,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    title: 'Website',
    items: [
      { path: '/admin/hero', icon: MonitorPlay, label: 'Hero Slides' },
      { path: '/admin/courses', icon: GraduationCap, label: 'Courses' },
      { path: '/admin/jobs', icon: Briefcase, label: 'Job Updates' },
      { path: '/admin/offers', icon: Tag, label: 'Offers' },
      { path: '/admin/achievers', icon: Trophy, label: 'Achievers' },
      { path: '/admin/reviews', icon: Star, label: 'Reviews' },
      { path: '/admin/faculty', icon: Users, label: 'Faculty' },
      { path: '/admin/lectures', icon: Video, label: 'Video Lectures' },
      { path: '/admin/resources', icon: FileText, label: 'Free Resources' },
      { path: '/admin/blog', icon: BookOpen, label: 'Blog' },
    ]
  },
  {
    title: 'Student Portal',
    items: [
      { path: '/admin/pdf-store', icon: ShoppingBag, label: 'PDF Store' },
      { path: '/admin/students', icon: UserCheck, label: 'Students' },
      { path: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
      { path: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { path: '/admin/settings', icon: Settings, label: 'Site Settings' },
    ]
  }
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const allItems = navGroups.flatMap(group => group.items);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-[#020617] border-r border-white/5 transition-transform duration-300 transform shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <Link to="/admin" className="flex items-center justify-center flex-1 px-4">
              <img 
                src="/src/assets/images/game_academy_logo_1783498289580.jpg" 
                alt="GAME Academy Logo" 
                className="max-h-16 w-auto object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </Link>
            <button 
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {navGroups.map((group, groupIdx) => (
              <div key={group.title} className="space-y-2">
                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 opacity-80">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive 
                            ? 'bg-game-teal text-white shadow-lg shadow-game-teal/20' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                {groupIdx < navGroups.length - 1 && (
                  <div className="mx-4 h-px bg-white/5 my-6" />
                )}
              </div>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-500"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
              {allItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-game-teal hover:bg-slate-50 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-game-gold rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100 mx-1"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user?.email || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Manage All Access</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
                <User className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

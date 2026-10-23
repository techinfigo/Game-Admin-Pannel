/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Briefcase,
  GraduationCap,
  Tag,
  Trophy,
  Megaphone,
  ArrowUpRight,
  Plus,
  ShoppingBag,
  UserCheck,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { getAll } from '../services/firestoreService';

interface Counts {
  resources: number;
  jobs: number;
  courses: number;
  offers: number;
  achievers: number;
  announcements: number;
  pdfs: number;
  students: number;
  revenue: number;
}

interface AnnouncementRow { id: string; title?: string; date?: string; }
interface JobRow { id: string; notification?: string; endDate?: string; status?: string; createdAt?: string; startDate?: string; }

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<AnnouncementRow[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    let isMounted = true;
    const safe = <T,>(c: string) => getAll<T>(c).catch(() => [] as (T & { id: string })[]);

    (async () => {
      const [resources, jobs, courses, offers, achievers, announcements, pdfs, users, purchases] = await Promise.all([
        safe<any>('resources'),
        safe<JobRow>('jobUpdates'),
        safe<any>('courses'),
        safe<any>('offers'),
        safe<any>('achievers'),
        safe<AnnouncementRow>('announcements'),
        safe<{ isFree?: boolean }>('pdfs'),
        safe<{ role?: string }>('users'),
        safe<{ amount?: number; status?: string }>('purchases'),
      ]);

      if (!isMounted) return;

      const revenue = purchases
        .filter((p) => (p.status || 'success').toLowerCase() === 'success')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      setCounts({
        resources: resources.length,
        jobs: jobs.length,
        courses: courses.length,
        offers: offers.length,
        achievers: achievers.length,
        announcements: announcements.length,
        pdfs: pdfs.filter((p) => p.isFree !== true).length,
        students: users.filter((u) => (u.role ?? 'student') !== 'admin').length,
        revenue,
      });

      setRecentAnnouncements(
        [...announcements].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3)
      );
      setRecentJobs(
        [...jobs]
          .sort((a, b) => (b.createdAt || b.startDate || '').localeCompare(a.createdAt || a.startDate || ''))
          .slice(0, 3)
      );
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
  const show = (n?: number) => (counts ? String(n) : '—');

  const stats = [
    { label: 'Free Resources', value: show(counts?.resources), icon: FileText, color: 'bg-blue-500', path: '/admin/resources' },
    { label: 'Job Updates', value: show(counts?.jobs), icon: Briefcase, color: 'bg-purple-500', path: '/admin/jobs' },
    { label: 'Active Courses', value: show(counts?.courses), icon: GraduationCap, color: 'bg-game-teal', path: '/admin/courses' },
    { label: 'Live Offers', value: show(counts?.offers), icon: Tag, color: 'bg-orange-500', path: '/admin/offers' },
    { label: 'Achievers', value: show(counts?.achievers), icon: Trophy, color: 'bg-game-gold', path: '/admin/achievers' },
    { label: 'Announcements', value: show(counts?.announcements), icon: Megaphone, color: 'bg-red-500', path: '/admin/announcements' },
    { label: 'Premium PDFs', value: show(counts?.pdfs), icon: ShoppingBag, color: 'bg-indigo-500', path: '/admin/pdf-store' },
    { label: 'Total Students', value: show(counts?.students), icon: UserCheck, color: 'bg-emerald-500', path: '/admin/students' },
    { label: 'Total Revenue', value: counts ? inr(counts.revenue) : '—', icon: IndianRupee, color: 'bg-pink-500', path: '/admin/transactions' },
  ];

  const formatDate = (d?: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Admin!</h1>
          <p className="text-slate-500 mt-1">Here's what's happening at GAME Academy today.</p>
        </div>
        <Link to="/admin/announcements" className="btn-primary">
          <Plus className="w-5 h-5" />
          Quick Announcement
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="admin-card group hover:border-game-teal transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Link
                to={stat.path}
                className="p-2 text-slate-300 group-hover:text-game-teal group-hover:bg-game-teal/5 rounded-lg transition-all"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-slate-500 font-medium mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="admin-card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Announcements</h3>
          <div className="space-y-4">
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((a) => (
                <div key={a.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 line-clamp-1">{a.title || 'Announcement'}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{formatDate(a.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">{counts ? 'No announcements yet.' : 'Loading…'}</p>
            )}
          </div>
          <Link to="/admin/announcements" className="block w-full mt-6 py-2 text-sm font-bold text-center text-game-teal hover:bg-game-teal/5 rounded-xl transition-colors">
            View All Announcements
          </Link>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Latest Job Updates</h3>
          <div className="space-y-4">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 line-clamp-1">{job.notification || 'Job Update'}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{job.endDate ? `Closes ${formatDate(job.endDate)}` : 'Open'}</p>
                    </div>
                  </div>
                  {job.status && (
                    <span className="px-3 py-1 bg-game-gold/10 text-game-gold text-xs font-bold rounded-lg shrink-0 capitalize">{job.status}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">{counts ? 'No job updates yet.' : 'Loading…'}</p>
            )}
          </div>
          <Link to="/admin/jobs" className="block w-full mt-6 py-2 text-sm font-bold text-center text-game-teal hover:bg-game-teal/5 rounded-xl transition-colors">
            Manage Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}

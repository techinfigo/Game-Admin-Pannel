/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  IndianRupee
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Free Resources', value: 124, icon: FileText, color: 'bg-blue-500', path: '/admin/resources' },
  { label: 'Job Updates', value: 42, icon: Briefcase, color: 'bg-purple-500', path: '/admin/jobs' },
  { label: 'Active Courses', value: 18, icon: GraduationCap, color: 'bg-game-teal', path: '/admin/courses' },
  { label: 'Live Offers', value: 5, icon: Tag, color: 'bg-orange-500', path: '/admin/offers' },
  { label: 'Achievers', value: 250, icon: Trophy, color: 'bg-game-gold', path: '/admin/achievers' },
  { label: 'Announcements', value: 12, icon: Megaphone, color: 'bg-red-500', path: '/admin/announcements' },
  { label: 'Premium PDFs', value: 45, icon: ShoppingBag, color: 'bg-indigo-500', path: '/admin/pdf-store' },
  { label: 'Total Students', value: '1.2k', icon: UserCheck, color: 'bg-emerald-500', path: '/admin/students' },
  { label: 'Total Revenue', value: '₹4.2L', icon: IndianRupee, color: 'bg-pink-500', path: '/admin/transactions' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Admin!</h1>
          <p className="text-slate-500 mt-1">Here's what's happening at GAME Academy today.</p>
        </div>
        <Link 
          to="/admin/announcements" 
          className="btn-primary"
        >
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
            transition={{ delay: index * 0.1 }}
            className="admin-card group hover:border-game-teal transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
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
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-game-teal">
              <span className="px-2 py-1 bg-game-teal/10 rounded-lg">+12% from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="admin-card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Announcements</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">New GATE 2027 Course Launch</p>
                  <p className="text-sm text-slate-500 mt-0.5">Posted by Admin • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-game-teal hover:bg-game-teal/5 rounded-xl transition-colors">
            View All Announcements
          </button>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Pending Job Updates</h3>
          <div className="space-y-4">
            {['SSC-JE Recruitment', 'ISRO Scientist-C', 'BHEL Trainee'].map((job, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{job}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Expires in 3 days</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-game-gold/10 text-game-gold text-xs font-bold rounded-lg">Urgent</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-game-teal hover:bg-game-teal/5 rounded-xl transition-colors">
            Manage Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

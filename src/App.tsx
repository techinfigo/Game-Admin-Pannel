/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./admin/Dashboard'));
const SiteSettings = React.lazy(() => import('./admin/SiteSettings'));
const FreeResources = React.lazy(() => import('./admin/FreeResources'));
const JobUpdates = React.lazy(() => import('./admin/JobUpdates'));
const Courses = React.lazy(() => import('./admin/Courses'));
const Offers = React.lazy(() => import('./admin/Offers'));
const Achievers = React.lazy(() => import('./admin/Achievers'));
const Announcements = React.lazy(() => import('./admin/Announcements'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-4 border-game-teal border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={
            <React.Suspense fallback={<Loading />}>
              <Dashboard />
            </React.Suspense>
          } />
          <Route path="settings" element={
            <React.Suspense fallback={<Loading />}>
              <SiteSettings />
            </React.Suspense>
          } />
          <Route path="resources" element={
            <React.Suspense fallback={<Loading />}>
              <FreeResources />
            </React.Suspense>
          } />
          <Route path="jobs" element={
            <React.Suspense fallback={<Loading />}>
              <JobUpdates />
            </React.Suspense>
          } />
          <Route path="courses" element={
            <React.Suspense fallback={<Loading />}>
              <CoursePage />
            </React.Suspense>
          } />
          <Route path="offers" element={
            <React.Suspense fallback={<Loading />}>
              <Offers />
            </React.Suspense>
          } />
          <Route path="achievers" element={
            <React.Suspense fallback={<Loading />}>
              <Achievers />
            </React.Suspense>
          } />
          <Route path="announcements" element={
            <React.Suspense fallback={<Loading />}>
              <Announcements />
            </React.Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Quick fix for Courses import name clash
const CoursePage = Courses;

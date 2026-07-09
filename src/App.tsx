/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const Login = React.lazy(() => import('./pages/Login'));

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./admin/Dashboard'));
const SiteSettings = React.lazy(() => import('./admin/SiteSettings'));
const FreeResources = React.lazy(() => import('./admin/FreeResources'));
const JobUpdates = React.lazy(() => import('./admin/JobUpdates'));
const Courses = React.lazy(() => import('./admin/Courses'));
const Offers = React.lazy(() => import('./admin/Offers'));
const Achievers = React.lazy(() => import('./admin/Achievers'));
const Announcements = React.lazy(() => import('./admin/Announcements'));
const Reviews = React.lazy(() => import('./admin/Reviews'));
const Blog = React.lazy(() => import('./admin/Blog'));
const Faculty = React.lazy(() => import('./admin/Faculty'));
const VideoLectures = React.lazy(() => import('./admin/VideoLectures'));
const HeroSlides = React.lazy(() => import('./admin/HeroSlides'));
const PdfStore = React.lazy(() => import('./admin/PdfStore'));
const Students = React.lazy(() => import('./admin/Students'));
const Transactions = React.lazy(() => import('./admin/Transactions'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-4 border-game-teal border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route
            path="/login"
            element={
              <React.Suspense fallback={<Loading />}>
                <Login />
              </React.Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
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
            <Route path="reviews" element={
              <React.Suspense fallback={<Loading />}>
                <Reviews />
              </React.Suspense>
            } />
            <Route path="blog" element={
              <React.Suspense fallback={<Loading />}>
                <Blog />
              </React.Suspense>
            } />
            <Route path="faculty" element={
              <React.Suspense fallback={<Loading />}>
                <Faculty />
              </React.Suspense>
            } />
            <Route path="lectures" element={
              <React.Suspense fallback={<Loading />}>
                <VideoLectures />
              </React.Suspense>
            } />
            <Route path="hero" element={
              <React.Suspense fallback={<Loading />}>
                <HeroSlides />
              </React.Suspense>
            } />
            <Route path="pdf-store" element={
              <React.Suspense fallback={<Loading />}>
                <PdfStore />
              </React.Suspense>
            } />
            <Route path="students" element={
              <React.Suspense fallback={<Loading />}>
                <Students />
              </React.Suspense>
            } />
            <Route path="transactions" element={
              <React.Suspense fallback={<Loading />}>
                <Transactions />
              </React.Suspense>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Quick fix for Courses import name clash
const CoursePage = Courses;

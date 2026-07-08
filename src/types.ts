/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SiteSettings {
  phone: string;
  whatsappNumber: string;
  email: string;
  classplusPortalLink: string;
  instagram: string;
  youtube: string;
  telegram: string;
  facebook: string;
  address: string;
}

export type ResourceType = 'pdf' | 'video' | 'note' | 'link';

export interface FreeResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  fileOrLink: string;
  examTag: string;
}

export type JobStatus = 'Open' | 'Closed' | 'Yet to start';

export interface JobUpdate {
  id: string;
  notification: string;
  eligibility: string;
  branches: string[];
  startDate: string;
  endDate: string;
  status: JobStatus;
  pdfLink: string;
  usefulLinks: string;
  recommendedCourse: string;
}

export interface Course {
  id: string;
  title: string;
  examTag: string;
  description: string;
  imageUrl: string;
  price?: string;
  purchaseLink: string;
  features: string[];
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  expiryDate: string;
}

export interface Achiever {
  id: string;
  name: string;
  exam: string;
  achievement: string;
  photoUrl: string;
  quote: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  active: boolean;
}

export interface Review {
  id: string;
  studentName: string;
  exam: string;
  rating: number;
  reviewText: string;
  photoUrl?: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  excerpt: string;
  content: string;
  author: string;
  publishedDate: string;
  tags: string[];
  published: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  photoUrl: string;
  bio: string;
  experienceYears: number;
}

export interface VideoLecture {
  id: string;
  title: string;
  examTag: string;
  youtubeUrl: string;
  description: string;
  thumbnailUrl?: string;
}

export interface HeroSlide {
  id: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  active: boolean;
}

export interface DashboardStats {
  resources: number;
  jobs: number;
  courses: number;
  offers: number;
  achievers: number;
  announcements: number;
}

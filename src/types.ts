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
  linkedin: string;
  whatsappChannel: string;
  androidAppLink: string;
  iosAppLink: string;
  address: string;
}

export type ResourceType = 'pdf' | 'video' | 'note' | 'link';

export interface FreeResource {
  id: string;
  resourceKind: string;   // "free" or "paid"
  category: string;        // e.g. "Video Series", "PDF Notes", "PYQ Bank", "Strategy", "Full Course", "Test Series"
  title: string;
  description: string;
  fileOrLink: string;      // URL to watch/download/buy
  image: string;           // thumbnail URL
  action: string;          // button text for free items, e.g. "Watch Now" / "Download"
  price: string;           // for paid items, e.g. "Rs. 24,999"
  tag: string;             // for paid items, e.g. "Best Seller"
  examTag: string;
  type: string;            // content type: pdf / video / note / link
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
  tagline: string;
  imageUrl: string;
  tag: string;           // badge text, e.g. "BASIC BATCH"
  category: string;      // e.g. "GATE / ESE"
  exam: string;          // e.g. "GATE / ESE / PSUs / ISRO / BARC"
  branch: string;        // e.g. "Mechanical"
  duration: string;      // e.g. "12 Months"
  eligibility: string;
  language: string;      // e.g. "Hinglish"
  mentorship: string;    // "Yes" or "No"
  price: string;         // e.g. "Rs. 6,999"
  originalPrice: string; // e.g. "Rs. 13,999"
  discount: string;      // e.g. "50% OFF"
  rating: number;        // e.g. 4.8
  enrolledCount: string; // e.g. "11.2k"
  liveCount: string;     // e.g. "350"
  features: string[];
  enrollLink: string;    // e.g. https://courses.gameacademy.in/wlp/...
}

export interface Offer {
  id: string;
  badge: string;
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
  type: string;        // one of: "Video Short", "GATE Topper", "Ranker", "Job Selection"
  name: string;
  achievement: string; // holds the rank or job title, e.g. "AIR 13" or "Junior Engineer (Civil)"
  exam: string;        // e.g. "GATE ME" or "CPWD · 2023"
  college: string;     // optional
  year: string;        // optional
  youtubeUrl: string;  // optional
  photoUrl: string;    // optional
  quote: string;       // optional
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
  rank: string;        // e.g. "AIR-1 (GATE ME)" or "SSC-JE Selected"
  exam: string;        // optional
  course: string;      // e.g. "Lakshya | 1 Yr GATE Course"
  branch: string;      // e.g. "Mechanical"
  rating: number;
  reviewText: string;
  photoUrl?: string;
  date: string;        // optional
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;       // e.g. "Strategy", "Technical", "Career"
  author: string;
  authorRole: string;     // e.g. "Founder & Mentor", "Senior Faculty"
  readTime: string;       // e.g. "8 min read"
  coverImageUrl: string;
  excerpt: string;
  content: string;
  publishedDate: string;
  tags: string[];
  published: boolean;
  featured: boolean;      // highlight this post at the top
}

export interface Faculty {
  id: string;
  name: string;
  role: string;           // e.g. "Founder & Chief Mentor", "Thermal Science Expert"
  expLabel: string;       // short badge, e.g. "14+ YRS EXP."
  experience: string;     // full text, e.g. "10+ Years of Teaching Experience"
  photoUrl: string;
  stats: string[];        // achievement points, e.g. ["Mentored 50,000+ students", "ESE AIR 63"]
  isChiefMentor: boolean;
  subject?: string;
  qualification?: string;
  bio?: string;
}

export interface VideoLecture {
  id: string;
  title: string;
  subtitle: string;       // e.g. "Proven Strategy by Gaurav Babu Sir"
  tag: string;            // topic label, e.g. "GATE Strategy", "Basic Mechanics"
  duration: string;       // e.g. "14:15"
  views: string;          // e.g. "245k"
  youtubeUrl: string;
  thumbnailUrl?: string;  // optional
  examTag?: string;       // optional
  description?: string;   // optional
}

export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;        // primary button text
  ctaLink: string;        // primary button link
  ctaText2: string;       // secondary button text
  ctaLink2: string;       // secondary button link
  stats: { value: string; label: string }[];   // e.g. [{value:"100k+", label:"Aspirants"}]
  imageUrl?: string;      // optional
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
  pdfs: number;
  students: number;
  revenue: number;
}

export interface PdfItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  examTag: string;
  category: string;
  fileUrl: string;
  fileName: string;
  isFree: boolean;
  price: number;
  pageCount: number;
  previewPages: number;
  published: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedAt: string;
  purchasedCount: number;
}

export interface Transaction {
  id: string;
  studentName: string;
  studentPhone: string;
  pdfTitle: string;
  amount: number;
  paymentId: string;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
}

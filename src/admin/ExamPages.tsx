/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ImageIcon,
  MonitorPlay,
  Calendar,
  HelpCircle,
  Sparkles,
  Trophy,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { getSingle, setSingle } from '../services/firestoreService';
import ImageUploadField from '../components/ImageUploadField';

const COLLECTION = 'examPageContent';

// ---- Types (mirror the website's lib/examContentTypes.ts) ----
interface HeroSlide { badge?: string; title?: string; buttonText?: string; imageUrl?: string; bgColor?: string; link?: string; }
interface DateRow { event?: string; date?: string; }
interface Faq { q?: string; a?: string; }
interface Benefit { title?: string; desc?: string; points?: string[]; }
interface Advantage { title?: string; desc?: string; image?: string; }
interface Ranker { name?: string; rank?: string; image?: string; videoId?: string; }

interface ExamContent {
  hero: HeroSlide[];
  importantDates: DateRow[];
  faqs: Faq[];
  courseBenefits: Benefit[];
  advantages: Advantage[];
  rankers: Ranker[];
}

// ---- Which exam pages can be edited here ----
// `id` is the Firestore document id (must match the website route's
// getExamContent('<id>')). `hasExtras` marks the GATE page, which is the only
// page whose Advantages / Benefits / Dates / Toppers / FAQs are also wired to
// this content; every page's Hero Banner Slides are editable.
interface ExamDef { id: string; label: string; hasExtras?: boolean; }
const EXAMS: ExamDef[] = [
  { id: 'gate', label: 'GATE', hasExtras: true },
  { id: 'psu', label: 'PSU / Govt R&D' },
  { id: 'rrb', label: 'RRB-JE' },
  { id: 'ssc', label: 'SSC-JE' },
  { id: 'ese', label: 'ESE' },
  { id: 'state', label: 'State AE/JE' },
];

const emptyExtras = { importantDates: [] as DateRow[], faqs: [] as Faq[], courseBenefits: [] as Benefit[], advantages: [] as Advantage[], rankers: [] as Ranker[] };

// ---- Seeds = the content currently hard-coded on each exam page. ----
// Loaded when the Firestore document does not exist yet, so the editor is never
// empty and the client edits the real page content (and a plain Save keeps the
// page looking exactly the same).
const GATE_SEED: ExamContent = {
  hero: [
    { title: 'Prepare for GATE 2027 with Real Mentorship', imageUrl: '/gate/hero-registration.webp', link: '#gate-courses' },
    { title: 'GATE 2027 Preparation Has To Start Now', imageUrl: '/gate/hero-mocktest.webp', link: '#gate-courses' },
    { title: 'Test Your GATE 2027 Level', imageUrl: '/gate/hero-psujobs.webp', link: '#gate-courses' },
    { title: 'Book Free Counselling — Unlock 7-Day Extra Discount', imageUrl: '/gate/hero-iitmtech.webp', link: '#gate-courses' },
  ],
  importantDates: [
    { event: 'GATE Online Application Processing System (GOAPS) opens', date: 'August 28, 2025' },
    { event: 'Closing date of regular online registration/applications', date: 'September 28, 2025' },
    { event: 'End of extended period for online registration/application (with late fee)', date: 'October 09, 2025' },
    { event: 'Last date for change of Category, Paper and Examination City. Adding a new test paper, and change of personal details (additional fee applicable per change)', date: 'November 06, 2025' },
    { event: 'Admit Cards available for download', date: 'January 02, 2026' },
    { event: 'GATE 2026 Examination Dates (Forenoon 9:30 AM–12:30 PM, Afternoon 2:30 PM–5:30 PM)', date: 'February 07, 08, 14 & 15, 2026' },
    { event: 'Announcement of results in the GATE Online Application Processing System (GOAPS)', date: 'March 19, 2026' },
    { event: 'Score Cards available for free download', date: 'March 27, 2026 to May 31, 2026' },
    { event: 'Score Cards available for download by paying a fee of Rs. 500 per test paper', date: 'June 01, 2026 to December 31, 2026' },
  ],
  faqs: [
    { q: "Q.1 Is GAME's online coaching enough to crack GATE?", a: 'Ans. Yes, with expert faculty, live classes, comprehensive study materials, and practice tests, GAME Academy provides all the tools to succeed.' },
    { q: "Q.2 What disciplines are covered in GAME's GATE coaching?", a: 'Ans. GAME offers courses for CE, ME, & XE as of now, ensuring syllabus coverage for all major disciplines.' },
    { q: "Q.3 Are GAME's courses affordable?", a: 'Ans. Absolutely. GAME offers competitive pricing, making quality education accessible to all students.' },
    { q: "Q.4 How do I enroll in GAME's GATE courses?", a: 'Ans. Visit our website, explore the courses, and follow the simple enrollment process to start your GATE journey.' },
    { q: 'Q.5 Can I access free GATE coaching from GAME?', a: 'Ans. Yes, GAME offers free online coaching through its YouTube channel to support students who may not afford paid programs.' },
  ],
  courseBenefits: [
    { title: 'Quality Content & Visualisation', desc: 'Master complex theories through visualized learning. We simplify high-level engineering concepts into intuitive stories and hacks.', points: ['Concept from Scratch', 'Visualization Hacks', 'Exam-Oriented Depth'] },
    { title: 'The Ultimate Practice Shield', desc: 'Crack any pattern with our exhaustive repository of PYQs, DPPs, and Mock Tests designed to simulate the actual GATE environment.', points: ['Full-Length Mock Tests', 'Topic-wise DPPs', 'Previous Year Analysis'] },
    { title: 'Personalized Support Ecosystem', desc: 'You are never alone. Get direct access to Gaurav Babu Sir and a dedicated team of experts to clear your doubts within minutes.', points: ['1:1 Mentorship', '24/7 Doubt Support', 'Strategy & Mindset Coaching'] },
    { title: 'Modern Learning Analytics', desc: 'Track your progress with our advanced dashboard. Identify your weak areas and work on them before they become obstacles.', points: ['Real-time Performance', 'Weakness Mapping', 'Growth Tracking'] },
  ],
  advantages: [
    { title: 'Higher Education Opportunities', desc: 'Admission to IITs, NITs, IIITs, and other top institutes for M.Tech/M.E. programs. Receive a monthly stipend of Rs. 12,400 during postgraduate studies.', image: '/advantage-1.webp' },
    { title: 'PSU Recruitment', desc: 'Direct recruitment into top Public Sector Undertakings (PSUs) like ONGC, BHEL, GAIL, NTPC, etc., with attractive salary packages and job security.', image: '/advantage-2.webp' },
    { title: 'Opportunities Abroad', desc: 'Admission to international universities such as the National University of Singapore (NUS) and the Technical University of Munich (TUM).', image: '/advantage-3.webp' },
    { title: 'Research Opportunities', desc: 'Openings for R&D roles in reputed research organisations like ISRO, DRDO, and BARC etc.', image: '/advantage-4.webp' },
    { title: 'Scholarships and Fellowships', desc: 'Eligibility for AICTE/UGC scholarships and Junior Research Fellow (JRF) positions.', image: '/advantage-5.webp' },
    { title: 'Teaching Careers', desc: 'Eligibility for teaching positions in engineering colleges and universities.', image: '/advantage-6.webp' },
    { title: 'Career Growth in Industry', desc: 'Access to better roles and higher salaries in private companies that require advanced technical expertise.', image: '/advantage-7.webp' },
    { title: 'Flexibility in Career', desc: 'Strong foundational preparation for other competitive exams like ESE, SSC-JE, RRB-JE, and State-level AE & JE exams.', image: '/advantage-8.webp' },
    { title: 'Prestige and Recognition', desc: 'A GATE qualification adds significant credibility to your technical and academic profile.', image: '/advantage-9.webp' },
  ],
  rankers: [
    { name: 'Abhishek Singh', rank: 'AIR 1 - GATE ME', image: '/images/rankers/ranker-rk-1.png', videoId: 'D6HOo41x2Ls' },
    { name: 'Ananya Ray', rank: 'AIR 1 - GATE ME', image: '/images/rankers/ranker-rk-2.png', videoId: 'gvK9V0trlaw' },
    { name: 'Siddharth S.', rank: 'AIR 45 - ESE ME', image: '/images/rankers/ranker-rk-3.png', videoId: 'Ta7gKIxxya0' },
    { name: 'Megha Gupta', rank: 'AIR 4 - ESE ME', image: '/images/rankers/ranker-rk-4.png', videoId: 'D6HOo41x2Ls' },
  ],
};

// Hero-only seeds for the other exam pages (mirror each page's built-in banners).
const HERO_SEEDS: Record<string, HeroSlide[]> = {
  psu: [
    { title: 'PSU / GATE registration banner', imageUrl: '/psu/hero-1.webp', link: '/jobs' },
    { title: 'Free mock test banner', imageUrl: '/psu/hero-2.webp', link: 'https://courses.gameacademy.in/wlp/vijeta-test-series-gate-me-new' },
    { title: 'Top PSU recruitment banner', imageUrl: '/psu/hero-3.webp', link: '/rankers' },
    { title: 'IIT M.Tech admission banner', imageUrl: '/psu/hero-4.webp', link: 'https://wpsvp.courses.store/courses/848557?filterId=1&sortId=7' },
  ],
  rrb: [
    { title: 'RRB JE course banner', imageUrl: '/rrb/hero-1.webp', link: '#rrb-courses' },
    { title: 'Free CBT-1 mock test banner', imageUrl: '/rrb/hero-2.webp', link: '#rrb-courses' },
    { title: 'Zone-wise vacancies banner', imageUrl: '/rrb/hero-3.webp', link: '/jobs' },
    { title: 'RRB JE Excellence Course banner', imageUrl: '/rrb/hero-4.webp', link: 'https://courses.gameacademy.in/wlp/excellence-ae-je-mechanical' },
  ],
  ssc: [
    { title: 'SSC JE 2026 notification banner', imageUrl: '/ssc/hero-notification.webp', link: 'https://whatsapp.com/channel/0029VaWNuqVJpe8gdAkinR1T' },
    { title: 'Free SSC-JE mock test banner', imageUrl: '/ssc/hero-mocktest.webp', link: 'https://wpsvp.courses.store/courses/706159?filterId=33&sortId=7' },
    { title: 'Pay scale & perks banner', imageUrl: '/ssc/hero-payscale.webp', link: '/jobs' },
    { title: 'JE career banner', imageUrl: '/ssc/hero-career.webp', link: '#courses' },
  ],
  ese: [
    { title: 'ESE 2026 notification banner', imageUrl: 'https://picsum.photos/seed/ese-notification/1200/800', link: '#ese-courses', buttonText: 'View Details' },
    { title: 'Free ESE prelims mock test banner', imageUrl: 'https://picsum.photos/seed/ese-mock/1200/800', link: '#ese-courses', buttonText: 'Start Test' },
    { title: 'ESE prelims date banner', imageUrl: 'https://picsum.photos/seed/ese-prelims/1200/800', link: '#ese-courses', buttonText: 'Know More' },
    { title: 'IES officers banner', imageUrl: 'https://picsum.photos/seed/ese-officers/1200/800', link: '#ese-courses', buttonText: 'Explore Path' },
  ],
  state: [
    { title: 'State AE/JE 2026 notifications banner', imageUrl: '/state/hero-1.jpg', link: '#state-courses', buttonText: 'Explore Courses' },
    { title: 'Free State AE/JE mock test banner', imageUrl: '/state/hero-2.jpg', link: '#state-courses', buttonText: 'Explore Courses' },
    { title: 'PWD / Irrigation posts banner', imageUrl: '/state/hero-3.jpg', link: '#state-courses', buttonText: 'Explore Courses' },
    { title: 'Career close to home banner', imageUrl: '/state/hero-4.jpg', link: '#state-courses', buttonText: 'Explore Courses' },
  ],
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function seedFor(examId: string): ExamContent {
  if (examId === 'gate') return clone(GATE_SEED);
  return { hero: clone(HERO_SEEDS[examId] || []), ...clone(emptyExtras) };
}

// Merge a loaded doc onto the seed so any newly added section is never missing.
function mergeWithSeed(examId: string, loaded: Partial<ExamContent> | null): ExamContent {
  const base = seedFor(examId);
  if (!loaded) return base;
  return {
    hero: loaded.hero?.length ? loaded.hero : base.hero,
    importantDates: loaded.importantDates?.length ? loaded.importantDates : base.importantDates,
    faqs: loaded.faqs?.length ? loaded.faqs : base.faqs,
    courseBenefits: loaded.courseBenefits?.length ? loaded.courseBenefits : base.courseBenefits,
    advantages: loaded.advantages?.length ? loaded.advantages : base.advantages,
    rankers: loaded.rankers?.length ? loaded.rankers : base.rankers,
  };
}

// ---- Small presentational helpers ----
function SectionCard({ icon: Icon, title, subtitle, children }: { icon: React.ElementType; title: string; subtitle: string; children: React.ReactNode; }) {
  return (
    <div className="admin-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-game-teal/10 flex items-center justify-center text-game-teal shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function ItemShell({ index, onRemove, children }: { index: number; onRemove: () => void; children: React.ReactNode; }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 relative">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Item #{index + 1}</span>
        <button type="button" onClick={onRemove} title="Remove" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void; }) {
  return (
    <button type="button" onClick={onClick} className="btn-secondary w-full justify-center py-3 border-dashed">
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

export default function ExamPages() {
  const [examId, setExamId] = useState<string>('gate');
  const [data, setData] = useState<ExamContent>(() => clone(GATE_SEED));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const exam = EXAMS.find(e => e.id === examId) || EXAMS[0];
  const storageFolder = `exam-pages/${examId}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const loaded = await getSingle<Partial<ExamContent>>(COLLECTION, examId);
        if (!cancelled) setData(mergeWithSeed(examId, loaded));
      } catch {
        if (!cancelled) {
          setData(seedFor(examId));
          setMessage({ type: 'err', text: 'Could not load saved content — showing current page content. You can still edit and save.' });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [examId]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await setSingle(COLLECTION, examId, data);
      setMessage({ type: 'ok', text: `Saved! Changes appear on the live ${exam.label} page within ~5 minutes.` });
    } catch {
      setMessage({ type: 'err', text: 'Failed to save. Please try again.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  // Generic array helpers
  function updateItem<K extends keyof ExamContent>(section: K, index: number, patch: Partial<ExamContent[K][number]>) {
    setData(prev => {
      const arr = [...(prev[section] as any[])];
      arr[index] = { ...arr[index], ...patch };
      return { ...prev, [section]: arr };
    });
  }
  function addItem<K extends keyof ExamContent>(section: K, blank: ExamContent[K][number]) {
    setData(prev => ({ ...prev, [section]: [...(prev[section] as any[]), clone(blank)] }));
  }
  function removeItem<K extends keyof ExamContent>(section: K, index: number) {
    setData(prev => ({ ...prev, [section]: (prev[section] as any[]).filter((_, i) => i !== index) }));
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exam Pages</h1>
          <p className="text-slate-500 mt-1">Edit the hero banners (and, for GATE, more content) shown on each exam page. Design and layout stay the same.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving || isLoading} className="btn-primary disabled:opacity-50">
          {isSaving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </div>

      {/* EXAM SELECTOR */}
      <div className="admin-card">
        <label className="label-text">Choose the exam page to edit</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {EXAMS.map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => setExamId(e.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                examId === e.id
                  ? 'bg-game-teal text-white border-game-teal shadow'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-game-teal/50'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'ok' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
          {message.type === 'ok' && <CheckCircle2 className="w-4 h-4" />} {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="admin-card flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-game-teal rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* HERO SLIDES — editable for every exam page */}
          <SectionCard icon={MonitorPlay} title="Hero Banner Slides" subtitle="These banners are full designed images (the text and buttons are part of the picture). To change the wording or design, upload a new banner image. Set where clicking the banner should take the visitor.">
            {data.hero.map((s, i) => (
              <ItemShell key={i} index={i} onRemove={() => removeItem('hero', i)}>
                <ImageUploadField label="Banner Image" value={s.imageUrl} onChange={url => updateItem('hero', i, { imageUrl: url })} folder={storageFolder} hint="The full banner graphic. Recommended: 900 × 700 px (landscape)." previewClassName="w-28 h-20" />
                <div>
                  <label className="label-text">Link — where clicking this banner goes</label>
                  <input className="input-field" value={s.link || ''} onChange={e => updateItem('hero', i, { link: e.target.value })} placeholder="e.g. #courses  ·  /courses  ·  https://courses.gameacademy.in/..." />
                  <p className="text-xs text-slate-400 mt-1">Use a <b>#section</b> to scroll on this page, a path like <b>/jobs</b> for another page on your site, or a full <b>https://</b> link to open elsewhere.</p>
                </div>
                <div>
                  <label className="label-text">Image description (for SEO / accessibility — not shown on the page)</label>
                  <input className="input-field" value={s.title || ''} onChange={e => updateItem('hero', i, { title: e.target.value })} placeholder="e.g. GATE 2027 registration banner" />
                </div>
              </ItemShell>
            ))}
            <AddButton label="Add Banner" onClick={() => addItem('hero', { title: '', imageUrl: '', link: '#courses' })} />
          </SectionCard>

          {/* The sections below are wired only for the GATE page. */}
          {exam.hasExtras && (
            <>
              {/* GATE ADVANTAGES (roadmap) */}
              <SectionCard icon={ShieldCheck} title="GATE Advantages (Roadmap)" subtitle="The alternating photo + text roadmap cards. Icons stay as designed.">
                {data.advantages.map((a, i) => (
                  <ItemShell key={i} index={i} onRemove={() => removeItem('advantages', i)}>
                    <div>
                      <label className="label-text">Title</label>
                      <input className="input-field" value={a.title || ''} onChange={e => updateItem('advantages', i, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-text">Description</label>
                      <textarea className="input-field min-h-[80px]" value={a.desc || ''} onChange={e => updateItem('advantages', i, { desc: e.target.value })} />
                    </div>
                    <ImageUploadField label="Photo" value={a.image} onChange={url => updateItem('advantages', i, { image: url })} folder={storageFolder} hint="Recommended: 800 × 600 px (landscape)" previewClassName="w-24 h-16" />
                  </ItemShell>
                ))}
                <AddButton label="Add Advantage" onClick={() => addItem('advantages', { title: '', desc: '', image: '' })} />
              </SectionCard>

              {/* WHY GAME / COURSE BENEFITS */}
              <SectionCard icon={Sparkles} title="Why GAME — Benefit Cards" subtitle="The four benefit cards. Icons stay as designed.">
                {data.courseBenefits.map((b, i) => (
                  <ItemShell key={i} index={i} onRemove={() => removeItem('courseBenefits', i)}>
                    <div>
                      <label className="label-text">Title</label>
                      <input className="input-field" value={b.title || ''} onChange={e => updateItem('courseBenefits', i, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-text">Description</label>
                      <textarea className="input-field min-h-[70px]" value={b.desc || ''} onChange={e => updateItem('courseBenefits', i, { desc: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-text">Bullet Points (one per line)</label>
                      <textarea className="input-field min-h-[70px]" value={(b.points || []).join('\n')} onChange={e => updateItem('courseBenefits', i, { points: e.target.value.split('\n').map(p => p.trim()).filter(Boolean) })} placeholder={'Point one\nPoint two\nPoint three'} />
                    </div>
                  </ItemShell>
                ))}
                <AddButton label="Add Benefit Card" onClick={() => addItem('courseBenefits', { title: '', desc: '', points: [] })} />
              </SectionCard>

              {/* IMPORTANT DATES */}
              <SectionCard icon={Calendar} title="Important Dates" subtitle="The GATE schedule table. Type the event and its date.">
                {data.importantDates.map((d, i) => (
                  <ItemShell key={i} index={i} onRemove={() => removeItem('importantDates', i)}>
                    <div>
                      <label className="label-text">Event / Milestone</label>
                      <textarea className="input-field min-h-[60px]" value={d.event || ''} onChange={e => updateItem('importantDates', i, { event: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-text">Date(s)</label>
                      <input className="input-field" value={d.date || ''} onChange={e => updateItem('importantDates', i, { date: e.target.value })} placeholder="e.g. February 07, 2026" />
                    </div>
                  </ItemShell>
                ))}
                <AddButton label="Add Date Row" onClick={() => addItem('importantDates', { event: '', date: '' })} />
              </SectionCard>

              {/* HALL OF FAME / RANKERS */}
              <SectionCard icon={Trophy} title="Hall of Fame (Toppers)" subtitle="Topper video cards. YouTube Video ID is the part after v= in the URL.">
                {data.rankers.map((r, i) => (
                  <ItemShell key={i} index={i} onRemove={() => removeItem('rankers', i)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label-text">Name</label>
                        <input className="input-field" value={r.name || ''} onChange={e => updateItem('rankers', i, { name: e.target.value })} />
                      </div>
                      <div>
                        <label className="label-text">Rank / Achievement</label>
                        <input className="input-field" value={r.rank || ''} onChange={e => updateItem('rankers', i, { rank: e.target.value })} placeholder="e.g. AIR 1 - GATE ME" />
                      </div>
                    </div>
                    <div>
                      <label className="label-text">YouTube Video ID</label>
                      <input className="input-field" value={r.videoId || ''} onChange={e => updateItem('rankers', i, { videoId: e.target.value })} placeholder="e.g. D6HOo41x2Ls" />
                    </div>
                    <ImageUploadField label="Photo" value={r.image} onChange={url => updateItem('rankers', i, { image: url })} folder={storageFolder} hint="Recommended: square 400 × 400 px" previewClassName="w-16 h-16" />
                  </ItemShell>
                ))}
                <AddButton label="Add Topper" onClick={() => addItem('rankers', { name: '', rank: '', image: '', videoId: '' })} />
              </SectionCard>

              {/* EDITABLE FAQs */}
              <SectionCard icon={HelpCircle} title="FAQs (Plain Q&A)" subtitle="The plain question/answer FAQs. Detailed table FAQs stay fixed and appear after these.">
                {data.faqs.map((f, i) => (
                  <ItemShell key={i} index={i} onRemove={() => removeItem('faqs', i)}>
                    <div>
                      <label className="label-text">Question</label>
                      <input className="input-field" value={f.q || ''} onChange={e => updateItem('faqs', i, { q: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-text">Answer</label>
                      <textarea className="input-field min-h-[80px]" value={f.a || ''} onChange={e => updateItem('faqs', i, { a: e.target.value })} />
                    </div>
                  </ItemShell>
                ))}
                <AddButton label="Add FAQ" onClick={() => addItem('faqs', { q: '', a: '' })} />
              </SectionCard>
            </>
          )}

          {!exam.hasExtras && (
            <div className="admin-card text-sm text-slate-500">
              For the <b className="text-game-teal">{exam.label}</b> page, the hero banners above are admin-editable. The rest of this page's content stays as designed — tell the developer if you want more of it opened up here.
            </div>
          )}
        </>
      )}

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/90 backdrop-blur border-t border-slate-200 px-6 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ImageIcon className="w-4 h-4" /> Editing <b className="text-slate-700">{exam.label}</b> page content
        </div>
        <button onClick={handleSave} disabled={isSaving || isLoading} className="btn-primary disabled:opacity-50">
          {isSaving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

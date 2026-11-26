/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Loader2, Save, Plus, Trash2, FileText, GraduationCap, CheckCircle2 } from 'lucide-react';
import { getSingle, setSingle } from '../services/firestoreService';
import ImageUploadField from '../components/ImageUploadField';

// Field shapes must match the website (components/NonTechHubPage + NextChapterPage).
interface HeroSlide { imageUrl: string; link: string; title: string; }
interface ExamCard { route: string; eligibility: string; status: string; tone: string; title: string; desc: string; meta: string; href: string; }
interface Faq { q: string; a: string; }
interface NonTechDoc { hero: HeroSlide[]; examCards: ExamCard[]; faqs: Faq[]; }
interface SchoolDoc { faqs: Faq[]; guideSchool?: string; guideJee?: string; guideNeet?: string; physicsPlaylist?: string; }
interface IitUpdate { exam: string; update: string; status: string; tone: string; }
interface IitDoc { lastChecked: string; deadlineNote: string; updates: IitUpdate[]; faqs: Faq[]; }

const TONES = ['open', 'waiting', 'upcoming', 'closed'];
const ROUTES = ['recruitment', 'engineering'];
const IIT_TONES = ['announced', 'reported', 'awaited', 'notconfirmed'];

// Current live defaults — the editor pre-fills with these so the client edits
// the real content rather than a blank form. Keep in sync with the website.
const DEFAULT_NONTECH: NonTechDoc = {
  hero: [],
  examCards: [
    { route: 'recruitment', eligibility: 'Graduate', status: 'Tier I done', tone: 'waiting', title: 'SSC CGL', desc: 'Non-tech: entire exam. Reasoning, GA, Quant, English. Any graduate, any branch.', meta: '12,256 posts. Tier I held 30 Sep–30 Oct 2026. Tier II tentatively Dec.', href: 'https://courses.gameacademy.in' },
    { route: 'recruitment', eligibility: 'Graduate · UG', status: 'Applications closed', tone: 'closed', title: 'RRB NTPC', desc: 'Non-tech: entire exam. Graduate (CEN 06/2026) and 12th pass (CEN 07/2026) posts.', meta: '3,548 graduate + 1,688 UG posts. Graduate CBT-1 expected Dec.', href: 'https://courses.gameacademy.in' },
    { route: 'recruitment', eligibility: '12th · 10th', status: 'Dec 2026', tone: 'upcoming', title: 'SSC CHSL / MTS', desc: 'Non-tech: entire exam. CHSL needs 12th pass, MTS needs 10th pass. A diploma or degree is not a separate route.', meta: 'CHSL Tier I proposed 30 Nov–31 Dec 2026. Confirm on ssc.gov.in.', href: 'https://courses.gameacademy.in' },
    { route: 'recruitment', eligibility: 'Graduate', status: 'Varies', tone: 'closed', title: 'Banking & State', desc: 'Non-tech: entire exam. IBPS, SBI and state recruitments. General Studies is only one part of the mix.', meta: 'Dates differ for every bank and state. Check the official notice.', href: 'https://courses.gameacademy.in' },
    { route: 'engineering', eligibility: 'Diploma · Degree', status: 'Paper-I done', tone: 'waiting', title: 'SSC JE', desc: 'Non-tech: Reasoning + General Awareness, 100 of 200 marks in Paper-I.', meta: 'About 1,748 posts notified (some sources say 1,699). Paper-II expected Dec 2026.', href: '/ssc' },
    { route: 'engineering', eligibility: 'Diploma · Degree', status: 'Result awaited', tone: 'waiting', title: 'RRB JE', desc: 'Non-tech: all of CBT-1. Maths, Reasoning, General Awareness, General Science.', meta: 'CEN 04/2026 · 4,029 posts (one source reports 4,487). CBT-1 result expected Dec.', href: '/rrb' },
    { route: 'engineering', eligibility: 'Degree', status: '31 Jan 2027', tone: 'upcoming', title: 'UPSC ESE (IES)', desc: 'Non-tech: Paper 1, 200 of 500 marks in prelims. General Studies and Engineering Aptitude.', meta: 'Prelims 31 Jan 2027. Paper 1 is 9:30–11:30 am.', href: '/ese' },
    { route: 'engineering', eligibility: 'Diploma · Degree', status: 'Varies by state', tone: 'closed', title: 'State AE / JE', desc: 'Non-tech: a General Studies paper or section in most state engineering services.', meta: 'Pattern and dates differ for every state. Track them on Job Updates.', href: '/state' },
  ],
  faqs: [
    { q: 'Is non-tech really that important in engineering exams?', a: 'In SSC JE Paper-I it is half the marks, in RRB JE CBT-1 it is all the marks, and in ESE prelims Paper 1 it is 200 of 500. A strong technical paper can still lose to a weak non-tech one.' },
    { q: 'I am a diploma holder. Which of these can I sit?', a: 'It depends on each post. SSC JE, RRB JE and most State AE/JE posts accept a diploma; SSC CGL, RRB NTPC (graduate posts) and UPSC ESE need a degree. Always confirm the qualification in the official notice for the specific post.' },
    { q: 'Can a B.Tech student apply for SSC CGL and RRB NTPC?', a: 'Yes. Both are open to any graduate of any discipline, engineering included. They test reasoning, general awareness, quantitative aptitude and English — not your engineering subject.' },
    { q: 'How long should I give to non-tech each day?', a: 'A steady fixed block each day works better than occasional long sessions. Fit it around your technical study so neither side is neglected — consistency matters more than hours.' },
    { q: 'Does your GS course cover Reasoning and Maths?', a: 'No. It covers General Studies subjects only. Reasoning and Maths are practised separately.' },
  ],
};

const DEFAULT_SCHOOL: SchoolDoc = {
  guideSchool: '',
  guideJee: '',
  guideNeet: '',
  physicsPlaylist: '',
  faqs: [
    { q: 'Does GAME currently offer courses for Classes 9-12?', a: 'No. GAME does not currently offer Classes 9-12 courses. This page brings together Gaurav Babu Sir’s available Physics lessons on YouTube, introductory study guides and a form to share your learning interests.' },
    { q: 'Can I watch Gaurav Sir’s Physics lessons without joining a course?', a: 'Yes. Use the Physics playlist link on this page to watch the lessons available on YouTube. You do not need to enrol in a GAME school course.' },
    { q: 'Do I need to choose JEE or NEET now?', a: 'No. You can begin with your current school subjects and use the guides to understand your options. You can also select Not sure yet in the interest form.' },
    { q: 'What happens when I submit my learning interests?', a: 'Your response helps GAME understand your class, subject interests and learning needs. Submission is not admission, a course booking or a guarantee of personalised counselling.' },
    { q: 'Will GAME launch Classes 9-12 courses?', a: 'GAME intends to develop its school-learning offering, but no launch date or course availability is confirmed on this page. Any future announcement will explain what is available and how to access it.' },
    { q: 'Are the guides complete preparation material?', a: 'No. They are short orientation guides. Use your current school or board syllabus, prescribed learning material and the relevant official examination syllabus for detailed preparation.' },
    { q: 'Where should I confirm JEE or NEET eligibility and dates?', a: 'Use the official JEE Main, JEE Advanced and NEET UG websites. Their current notices and information bulletins take precedence over guidance PDFs or social-media posts.' },
  ],
};

const DEFAULT_IIT: IitDoc = {
  lastChecked: '24 Nov 2026',
  deadlineNote: 'JEE Main Session 1: the late-fee window ends on 26 November 2026. Confirm on jeemain.nta.nic.in.',
  updates: [
    { exam: 'JEE Main 2027 · Session 1 · Application', update: 'Regular window closed on 22 Nov 2026. A late-fee window (₹500 plus the application fee) is reported for 23–28 Nov. Corrections 27–29 Nov.', status: 'Reported', tone: 'reported' },
    { exam: 'JEE Main 2027 · Session 1 · Exam', update: '20, 21, 22, 23, 24 and 28 January 2027, in two shifts (9 am–12 pm and 3 pm–6 pm). Admit card not yet released.', status: 'Dates announced', tone: 'announced' },
    { exam: 'JEE Main 2027 · Session 2', update: 'Applications 5 Jan–3 Feb 2027, exam 2–7 April 2027, as per the reported NTA calendar.', status: 'Reported', tone: 'reported' },
    { exam: 'JEE Advanced 2027', update: 'Exam on 23 May 2027, conducted by IIT Delhi. A basic on-screen calculator is allowed. Registration dates are not announced yet.', status: 'Date announced', tone: 'announced' },
    { exam: 'NEET UG 2027 · Dates', update: 'NTA has not published the notification, application window or exam date. Some media expect an early-May exam, but this is unofficial.', status: 'Awaited', tone: 'awaited' },
    { exam: 'NEET UG 2027 · Mode', update: 'The Education Minister said in May 2026 that NEET will be computer-based from 2027. A 4 Nov 2026 report says the mode is not finalised and the exam-reform task force has been given time till January 2027.', status: 'Not confirmed', tone: 'notconfirmed' },
  ],
  faqs: [
    { q: 'When is JEE Main 2027?', a: 'Session 1 is on 20, 21, 22, 23, 24 and 28 January 2027. Session 2 is reported for 2–7 April 2027. Confirm on jeemain.nta.nic.in.' },
    { q: 'Can I still apply for JEE Main Session 1?', a: 'The regular window closed on 22 Nov 2026. A late-fee window is reported until 26–28 Nov. Check the official site for the exact closing date and fee.' },
    { q: 'When is JEE Advanced 2027?', a: 'Reported for 23 May 2027, conducted by IIT Delhi. Registration dates are not announced yet.' },
    { q: 'How many attempts do I get?', a: 'JEE Main: up to three consecutive years. JEE Advanced: a maximum of two attempts in two consecutive years. NEET UG: no cap on attempts in recent notices.' },
    { q: 'When is NEET UG 2027?', a: 'NTA has not published the notification or exam date yet. Some media expect an early-May exam, but this is unofficial until the bulletin is out.' },
    { q: 'Will NEET UG 2027 be computer-based?', a: 'Not confirmed. A CBT shift from 2027 was announced in 2026, but a later report says it is not finalised. Wait for NTA’s bulletin.' },
    { q: 'Can I take both JEE and NEET?', a: 'Yes, if you meet each exam’s eligibility and the dates don’t clash. JEE leads to engineering; NEET leads to medical, dental and AYUSH.' },
    { q: 'Is this an official notice?', a: 'No. This page is a general guide. Exam dates and rules are set by NTA, IIT Delhi, JoSAA and MCC, and can change.' },
  ],
};

// ---- small UI helpers ----
const label = 'block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1';
const input = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-game-teal outline-none';

function Field({ title, value, onChange, textarea }: { title: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className={label}>{title}</label>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={input} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className={input} />}
    </div>
  );
}

function Select({ title, value, onChange, options }: { title: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className={label}>{title}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={input}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function CardShell({ children, onRemove, index }: React.PropsWithChildren<{ onRemove: () => void; index: number }>) {
  return (
    <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-4">
      <button onClick={onRemove} className="absolute top-3 right-3 text-slate-400 hover:text-red-500" title="Remove"><Trash2 size={15} /></button>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-3">#{index + 1}</div>
      {children}
    </div>
  );
}

export default function PageContent() {
  const [tab, setTab] = useState<'nontech' | 'school' | 'iit'>('nontech');
  const [nt, setNt] = useState<NonTechDoc>(DEFAULT_NONTECH);
  const [school, setSchool] = useState<SchoolDoc>(DEFAULT_SCHOOL);
  const [iit, setIit] = useState<IitDoc>(DEFAULT_IIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getSingle<NonTechDoc>('pageContent', 'nontech'),
      getSingle<SchoolDoc>('pageContent', 'school'),
      getSingle<IitDoc>('pageContent', 'iit'),
    ]).then(([n, s, i]) => {
      if (n && Array.isArray(n.examCards)) setNt({ ...DEFAULT_NONTECH, ...n });
      if (s) setSchool({ ...DEFAULT_SCHOOL, ...s, faqs: (Array.isArray(s.faqs) && s.faqs.length) ? s.faqs : DEFAULT_SCHOOL.faqs });
      if (i && Array.isArray(i.updates)) setIit({ ...DEFAULT_IIT, ...i });
    }).catch(() => { /* keep defaults */ }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setError(''); setSaved('');
    try {
      if (tab === 'nontech') await setSingle('pageContent', 'nontech', nt);
      else if (tab === 'iit') await setSingle('pageContent', 'iit', iit);
      else await setSingle('pageContent', 'school', school);
      setSaved('Saved. The live page updates within a minute.');
      setTimeout(() => setSaved(''), 4000);
    } catch (e: any) {
      setError(e?.message || 'Could not save. Please try again.');
    } finally { setSaving(false); }
  };

  // mutation helpers
  const setNtList = <K extends keyof NonTechDoc>(key: K, val: NonTechDoc[K]) => setNt((p) => ({ ...p, [key]: val }));

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="animate-spin mr-2" /> Loading…</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Exam Page Content</h1>
          <p className="text-slate-500 text-sm font-medium">Edit the parts of the Non-Tech and School pages that change over time. Everything else is fixed in the design.</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-game-teal text-white font-black px-5 py-2.5 rounded-xl hover:bg-[#054a4f] disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save {tab === 'nontech' ? 'Non-Tech' : tab === 'iit' ? 'IIT / NEET' : 'School'}
        </button>
      </div>

      {saved && <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-bold"><CheckCircle2 size={16} /> {saved}</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([['nontech', 'Non-Tech page', FileText], ['iit', 'IIT / NEET page', GraduationCap], ['school', 'School page', GraduationCap]] as const).map(([val, lbl, Icon]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border ${tab === val ? 'bg-game-teal text-white border-game-teal' : 'bg-white text-slate-600 border-slate-200'}`}>
            <Icon size={15} /> {lbl}
          </button>
        ))}
      </div>

      {tab === 'nontech' ? (
        <div className="space-y-8">
          {/* Hero slider */}
          <section>
            <SectionHeader title="Hero slider images" sub="The image slider at the top of the page. Add banners and the link each one opens when clicked."
              onAdd={() => setNtList('hero', [...nt.hero, { imageUrl: '', link: '', title: '' }])} />
            <div className="space-y-3">
              {nt.hero.map((s, i) => (
                <CardShell key={i} index={i} onRemove={() => setNtList('hero', nt.hero.filter((_, j) => j !== i))}>
                  <ImageUploadField
                    label="Banner image"
                    value={s.imageUrl}
                    onChange={(url) => setNtList('hero', nt.hero.map((x, j) => j === i ? { ...x, imageUrl: url } : x))}
                    folder="nontech"
                    hint="Wide banner, around 1200 × 820 px"
                    previewClassName="w-28 h-20"
                  />
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <Field title="Link when clicked (/jobs, #exams, or a full https:// URL)" value={s.link} onChange={(v) => setNtList('hero', nt.hero.map((x, j) => j === i ? { ...x, link: v } : x))} />
                    <Field title="Short title (for accessibility)" value={s.title} onChange={(v) => setNtList('hero', nt.hero.map((x, j) => j === i ? { ...x, title: v } : x))} />
                  </div>
                </CardShell>
              ))}
            </div>
            {nt.hero.length === 0 && <p className="text-xs text-slate-400 mt-2">No banners added yet — the page shows placeholder images until you add some.</p>}
          </section>

          {/* Exam cards */}
          <section>
            <SectionHeader title="Exam cards" sub="The 8 cards under “Which opportunity are you exploring?”."
              onAdd={() => setNtList('examCards', [...nt.examCards, { route: 'recruitment', eligibility: '', status: '', tone: 'upcoming', title: '', desc: '', meta: '', href: '' }])} />
            <div className="space-y-3">
              {nt.examCards.map((c, i) => (
                <CardShell key={i} index={i} onRemove={() => setNtList('examCards', nt.examCards.filter((_, j) => j !== i))}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field title="Title" value={c.title} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, title: v } : x))} />
                    <Select title="Route" value={c.route} options={ROUTES} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, route: v } : x))} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <Field title="Eligibility" value={c.eligibility} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, eligibility: v } : x))} />
                    <Field title="Status label" value={c.status} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, status: v } : x))} />
                    <Select title="Colour" value={c.tone} options={TONES} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, tone: v } : x))} />
                  </div>
                  <div className="mt-3"><Field title="Description" textarea value={c.desc} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, desc: v } : x))} /></div>
                  <div className="mt-3"><Field title="Posts / dates line" textarea value={c.meta} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, meta: v } : x))} /></div>
                  <div className="mt-3"><Field title="Link (e.g. /ssc or a full https:// URL)" value={c.href} onChange={(v) => setNtList('examCards', nt.examCards.map((x, j) => j === i ? { ...x, href: v } : x))} /></div>
                </CardShell>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <FaqEditor faqs={nt.faqs} onChange={(f) => setNtList('faqs', f)} />
        </div>
      ) : tab === 'iit' ? (
        <div className="space-y-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 grid sm:grid-cols-2 gap-4">
            <Field title="“Last checked” date" value={iit.lastChecked} onChange={(v) => setIit({ ...iit, lastChecked: v })} />
            <Field title="Deadline banner (leave empty to hide it, e.g. after the date passes)" value={iit.deadlineNote} onChange={(v) => setIit({ ...iit, deadlineNote: v })} />
          </section>

          <section>
            <SectionHeader title="Latest updates" sub="The JEE/NEET updates table. Keep dates current."
              onAdd={() => setIit({ ...iit, updates: [...iit.updates, { exam: '', update: '', status: '', tone: 'reported' }] })} />
            <div className="space-y-3">
              {iit.updates.map((u, i) => (
                <CardShell key={i} index={i} onRemove={() => setIit({ ...iit, updates: iit.updates.filter((_, j) => j !== i) })}>
                  <Field title="Exam" value={u.exam} onChange={(v) => setIit({ ...iit, updates: iit.updates.map((x, j) => j === i ? { ...x, exam: v } : x) })} />
                  <div className="mt-3"><Field title="Update" textarea value={u.update} onChange={(v) => setIit({ ...iit, updates: iit.updates.map((x, j) => j === i ? { ...x, update: v } : x) })} /></div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <Field title="Status label" value={u.status} onChange={(v) => setIit({ ...iit, updates: iit.updates.map((x, j) => j === i ? { ...x, status: v } : x) })} />
                    <Select title="Colour" value={u.tone} options={IIT_TONES} onChange={(v) => setIit({ ...iit, updates: iit.updates.map((x, j) => j === i ? { ...x, tone: v } : x) })} />
                  </div>
                </CardShell>
              ))}
            </div>
          </section>

          <FaqEditor faqs={iit.faqs} onChange={(f) => setIit({ ...iit, faqs: f })} />
        </div>
      ) : (
        <div className="space-y-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Guide links &amp; Physics playlist</h2>
              <p className="text-xs text-slate-400 font-medium">Paste the link each button opens. Leave blank to use the built-in defaults.</p>
            </div>
            <Field title="Starter / School &amp; Boards guide (hero button + School card)" value={school.guideSchool || ''} onChange={(v) => setSchool({ ...school, guideSchool: v })} />
            <Field title="JEE guide" value={school.guideJee || ''} onChange={(v) => setSchool({ ...school, guideJee: v })} />
            <Field title="NEET guide" value={school.guideNeet || ''} onChange={(v) => setSchool({ ...school, guideNeet: v })} />
            <Field title="Physics playlist (YouTube) — hero button + Physics card" value={school.physicsPlaylist || ''} onChange={(v) => setSchool({ ...school, physicsPlaylist: v })} />
          </section>

          <FaqEditor faqs={school.faqs} onChange={(f) => setSchool({ ...school, faqs: f })} />
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, sub, onAdd }: { title: string; sub: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <p className="text-xs text-slate-400 font-medium">{sub}</p>
      </div>
      <button onClick={onAdd} className="inline-flex items-center gap-1.5 text-sm font-bold text-game-teal border border-game-teal/30 rounded-lg px-3 py-1.5 hover:bg-game-teal/5"><Plus size={15} /> Add</button>
    </div>
  );
}

function FaqEditor({ faqs, onChange }: { faqs: Faq[]; onChange: (f: Faq[]) => void }) {
  return (
    <section>
      <SectionHeader title="FAQs" sub="Questions students ask, shown at the bottom of the page."
        onAdd={() => onChange([...faqs, { q: '', a: '' }])} />
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <CardShell key={i} index={i} onRemove={() => onChange(faqs.filter((_, j) => j !== i))}>
            <Field title="Question" value={f.q} onChange={(v) => onChange(faqs.map((x, j) => j === i ? { ...x, q: v } : x))} />
            <div className="mt-3"><Field title="Answer" textarea value={f.a} onChange={(v) => onChange(faqs.map((x, j) => j === i ? { ...x, a: v } : x))} /></div>
          </CardShell>
        ))}
      </div>
    </section>
  );
}

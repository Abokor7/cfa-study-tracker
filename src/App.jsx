import React, { useEffect, useMemo, useRef, useState } from 'react'; import { CalendarDays, Clock3, Target, BookOpen, Trophy, CheckCircle2, AlertTriangle, Download, Flame, Save, Upload, Smartphone, ListChecks, TrendingUp, } from 'lucide-react'; import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, } from 'recharts';

const TOPICS = [ 'Ethics', 'Fixed Income', 'Equity', 'Corporate Issuers', 'Portfolio Management', 'Derivatives', 'Alternative Investments', 'Quant', 'FRA', 'Economics', 'Mixed Practice', 'Mock Exam', 'Light Review', 'Formula Review', 'Review / Practice', 'Confidence', 'Error Log', 'Review', ];

const STATUS_OPTIONS = ['Planned', 'Done', 'Missed']; const MOCK_OPTIONS = ['No', 'Yes']; const WEEKLY_GOAL_DEFAULT = { hours: 28, questions: 250, accuracy: 75, mocks: 1, };

const initialCompletedLogs = [ { date: '2026-03-27', morningHours: 2.5, afternoonHours: 2, topic: 'Fixed Income', secondTopic: 'Ethics', questions: 25, accuracy: 64, status: 'Done', mock: 'No', mockScore: '', mockResult: 'N/A', notes: 'FI basics + Ethics start', morningChecklist: { startMorningSession: true, mainTopicLearning: true, firstQuestionBlock: true, formulasReview: false, }, afternoonChecklist: { startAfternoonSession: true, ethicsOrSecondTopic: true, secondQuestionBlock: true, recapAndErrorLog: false, }, }, { date: '2026-03-28', morningHours: 2.5, afternoonHours: 2, topic: 'Fixed Income', secondTopic: 'Quant', questions: 30, accuracy: 68, status: 'Done', mock: 'No', mockScore: '', mockResult: 'N/A', notes: 'Bond pricing and maintenance review', morningChecklist: { startMorningSession: true, mainTopicLearning: true, firstQuestionBlock: true, formulasReview: true, }, afternoonChecklist: { startAfternoonSession: true, ethicsOrSecondTopic: true, secondQuestionBlock: true, recapAndErrorLog: true, }, }, ];

const studyPlanSeed = { '2026-03-27': ['Fixed Income', 'Ethics', 'FI basics + Ethics start'], '2026-03-28': ['Fixed Income', 'Quant', 'Bond pricing + Quant maintenance'], '2026-03-29': ['Fixed Income', 'Ethics', 'Yield measures + Ethics'], '2026-03-30': ['Fixed Income', 'Economics', 'FI risk + Econ maintenance'], '2026-03-31': ['Fixed Income', 'Ethics', 'Duration and convexity + Ethics questions'], '2026-04-01': ['Fixed Income', 'FRA', 'FI mixed timed set + FRA maintenance'], '2026-04-02': ['Fixed Income', 'Formula Review', 'Light FI review + formulas'], '2026-04-03': ['Fixed Income', 'Ethics', 'Term structure + Ethics'], '2026-04-04': ['Fixed Income', 'Quant', 'Securitized products + Quant maintenance'], '2026-04-05': ['Fixed Income', 'Error Log', 'FI mixed review'], '2026-04-10': ['Equity', 'Ethics', 'Equity market organization + Ethics'], '2026-04-11': ['Equity', 'Quant', 'Market efficiency + Quant maintenance'], '2026-04-18': ['Corporate Issuers', 'Quant', 'Governance basics + Quant maintenance'], '2026-04-24': ['Portfolio Management', 'Ethics', 'Risk and return basics'], '2026-05-01': ['Derivatives', 'Ethics', 'Forwards and futures foundation'], '2026-05-05': ['Alternative Investments', 'Ethics', 'Alternatives overview'], '2026-06-15': ['Mixed Practice', 'Ethics', 'Half-mock style practice'], '2026-07-20': ['Mock Exam', 'Review', 'Timed mock + deep review'], '2026-08-15': ['Ethics', 'Formula Review', 'Final ethics and formula sharpening'], '2026-08-23': ['Light Review', 'Confidence', 'Final light review before exam'], '2026-08-24': ['Mock Exam', 'Confidence', 'Exam day'], };

function defaultMorningChecklist() { return { startMorningSession: false, mainTopicLearning: false, firstQuestionBlock: false, formulasReview: false, }; }

function defaultAfternoonChecklist() { return { startAfternoonSession: false, ethicsOrSecondTopic: false, secondQuestionBlock: false, recapAndErrorLog: false, }; }

function buildDateRange(start, end) { const dates = []; const current = new Date(${start}T00:00:00); const last = new Date(${end}T00:00:00); while (current <= last) { const y = current.getFullYear(); const m = String(current.getMonth() + 1).padStart(2, '0'); const d = String(current.getDate()).padStart(2, '0'); dates.push(${y}-${m}-${d}); current.setDate(current.getDate() + 1); } return dates; }

function buildCalendarLogs() { return buildDateRange('2026-03-27', '2026-08-24').map((date) => { const seeded = studyPlanSeed[date]; return { date, morningHours: 2.5, afternoonHours: 2, topic: seeded?.[0] || 'Review / Practice', secondTopic: seeded?.[1] || 'Ethics', questions: 0, accuracy: 0, status: 'Planned', mock: seeded?.[0] === 'Mock Exam' ? 'Yes' : 'No', mockScore: '', mockResult: seeded?.[0] === 'Mock Exam' ? 'Pending' : 'N/A', notes: seeded?.[2] || 'Planned study day', morningChecklist: defaultMorningChecklist(), afternoonChecklist: defaultAfternoonChecklist(), }; }); }

function getDaysToExam() { const today = new Date(); const exam = new Date('2026-08-24T00:00:00'); const diff = exam.getTime() - today.getTime(); return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))); }

function downloadJson(filename, data) { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }

function cardClass(extra = '') { return rounded-3xl border border-slate-200 bg-white shadow-sm ${extra}.trim(); }

function StatCard({ title, value, icon: Icon, subtitle }) { return ( <div className={cardClass()}> <div className="p-4 sm:p-5"> <div className="flex items-start justify-between gap-3"> <div> <p className="text-xs sm:text-sm text-slate-500">{title}</p> <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{value}</p> {subtitle ? <p className="mt-2 text-xs text-slate-500">{subtitle}</p> : null} </div> <div className="rounded-2xl bg-slate-100 p-3"> <Icon className="h-5 w-5 text-slate-700" /> </div> </div> </div> </div> ); }

function TabButton({ active, onClick, children }) { return ( <button onClick={onClick} className={rounded-2xl px-3 py-2 text-xs sm:text-sm font-medium transition ${ active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100' }} > {children} </button> ); }

function SimpleBadge({ children, dark = false, outline = false, danger = false, success = false, warning = false }) { const className = danger ? 'border border-red-200 bg-red-50 text-red-700' : success ? 'border border-green-200 bg-green-50 text-green-700' : warning ? 'border border-amber-200 bg-amber-50 text-amber-700' : dark ? 'bg-slate-900 text-white' : outline ? 'border border-slate-300 bg-white text-slate-700' : 'bg-slate-100 text-slate-700'; return <span className={inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}}>{children}</span>; }

function Field({ label, children }) { return ( <label className="block space-y-1.5"> <span className="text-sm font-medium text-slate-700">{label}</span> {children} </label> ); }

function InputBase(props) { return ( <input {...props} className={w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${props.className || ''}} /> ); }

function SelectBase({ value, onChange, options }) { return ( <select
value={value}
onChange={onChange}
className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
> {options.map((option) => ( <option key={option} value={option}> {option} </option> ))} </select> ); }

function ButtonBase({ children, variant = 'primary', className = '', ...props }) { const styles = variant === 'outline' ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50' : variant === 'ghost' ? 'bg-transparent text-slate-700 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'; return ( <button {...props} className={inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${styles} ${className}} > {children} </button> ); }

function weekStartString(dateStr) { const d = new Date(${dateStr}T00:00:00); const day = d.getDay(); const diff = (day + 6) % 7; d.setDate(d.getDate() - diff); const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const dayStr = String(d.getDate()).padStart(2, '0'); return ${y}-${m}-${dayStr}; }

function checklistProgress(list) { const values = Object.values(list || {}); if (!values.length) return 0; return Math.round((values.filter(Boolean).length / values.length) * 100); }

function mockBadge(result) { if (result === 'Pass') return <SimpleBadge success>Pass</SimpleBadge>; if (result === 'Fail') return <SimpleBadge danger>Fail</SimpleBadge>; if (result === 'Pending') return <SimpleBadge warning>Pending</SimpleBadge>; return <SimpleBadge outline>N/A</SimpleBadge>; }

export default function CFAStudyTrackerApp() { const importRef = useRef(null); const [activeTab, setActiveTab] = useState('dashboard'); const [weeklyGoals, setWeeklyGoals] = useState(() => { if (typeof window !== 'undefined') { const saved = window.localStorage.getItem('cfa-study-tracker-weekly-goals'); if (saved) return JSON.parse(saved); } return WEEKLY_GOAL_DEFAULT; });

const [logs, setLogs] = useState(() => { if (typeof window !== 'undefined') { const saved = window.localStorage.getItem('cfa-study-tracker-logs'); if (saved) return JSON.parse(saved); } const planned = buildCalendarLogs(); const completedMap = Object.fromEntries(initialCompletedLogs.map((x) => [x.date, x])); return planned.map((row) => completedMap[row.date] || row); });

const [form, setForm] = useState({ date: '2026-03-30', morningHours: 2.5, afternoonHours: 2, topic: 'Fixed Income', secondTopic: 'Ethics', questions: 25, accuracy: 70, status: 'Planned', mock: 'No', mockScore: '', mockResult: 'N/A', notes: '', morningChecklist: defaultMorningChecklist(), afternoonChecklist: defaultAfternoonChecklist(), });

useEffect(() => { if (typeof window !== 'undefined') { window.localStorage.setItem('cfa-study-tracker-logs', JSON.stringify(logs)); } }, [logs]);

useEffect(() => { if (typeof window !== 'undefined') { window.localStorage.setItem('cfa-study-tracker-weekly-goals', JSON.stringify(weeklyGoals)); } }, [weeklyGoals]);

const totalTargetHours = 4 * 151;

const metrics = useMemo(() => { const completed = logs.filter((l) => l.status === 'Done'); const totalHours = completed.reduce((sum, l) => sum + Number(l.morningHours || 0) + Number(l.afternoonHours || 0), 0); const totalQuestions = completed.reduce((sum, l) => sum + Number(l.questions || 0), 0); const avgAccuracy = completed.length ? Math.round(completed.reduce((sum, l) => sum + Number(l.accuracy || 0), 0) / completed.length) : 0; const mockDone = completed.filter((l) => l.mock === 'Yes'); const mockCount = mockDone.length; const passedMocks = mockDone.filter((l) => l.mockResult === 'Pass').length; const failedMocks = mockDone.filter((l) => l.mockResult === 'Fail').length;

const topicMap = {};
TOPICS.forEach((topic) => {
  topicMap[topic] = { topic, hours: 0, questions: 0, entries: 0, accuracyTotal: 0 };
});

completed.forEach((l) => {
  const hours = Number(l.morningHours || 0) + Number(l.afternoonHours || 0);
  if (topicMap[l.topic]) {
    topicMap[l.topic].hours += hours;
    topicMap[l.topic].questions += Number(l.questions || 0);
    topicMap[l.topic].entries += 1;
    topicMap[l.topic].accuracyTotal += Number(l.accuracy || 0);
  }
  if (topicMap[l.secondTopic]) {
    topicMap[l.secondTopic].hours += 0.5;
  }
});

const topicData = Object.values(topicMap)
  .map((t) => ({
    topic: t.topic,
    hours: Number(t.hours.toFixed(1)),
    questions: t.questions,
    accuracy: t.entries ? Math.round(t.accuracyTotal / t.entries) : 0,
  }))
  .filter((t) => t.hours > 0 || t.questions > 0)
  .sort((a, b) => b.hours - a.hours);

const weakTopics = topicData.filter((t) => t.questions >= 20 && t.accuracy < 70).slice(0, 4);

const statusCounts = STATUS_OPTIONS.map((status) => ({
  name: status,
  value: logs.filter((l) => l.status === status).length,
}));

const weeklyMap = {};
logs.forEach((l) => {
  const weekKey = weekStartString(l.date);
  if (!weeklyMap[weekKey]) {
    weeklyMap[weekKey] = { week: weekKey, hours: 0, questions: 0, mocks: 0 };
  }
  if (l.status === 'Done') {
    weeklyMap[weekKey].hours += Number(l.morningHours || 0) + Number(l.afternoonHours || 0);
    weeklyMap[weekKey].questions += Number(l.questions || 0);
    if (l.mock === 'Yes') weeklyMap[weekKey].mocks += 1;
  }
});

const weeklyData = Object.values(weeklyMap).slice(-12);

const cumulativeData = [];
let running = 0;
logs
  .slice()
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .forEach((l, index) => {
    if (l.status === 'Done') running += Number(l.morningHours || 0) + Number(l.afternoonHours || 0);
    cumulativeData.push({
      date: l.date.slice(5),
      actual: Number(running.toFixed(1)),
      target: Number(((index + 1) * 4).toFixed(1)),
    });
  });

const doneDates = completed.map((l) => l.date).sort();
let streak = 0;
for (let i = doneDates.length - 1; i >= 0; i--) {
  if (i === doneDates.length - 1) streak = 1;
  else {
    const current = new Date(`${doneDates[i + 1]}T00:00:00`);
    const previous = new Date(`${doneDates[i]}T00:00:00`);
    const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak += 1;
    else break;
  }
}

const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, '0');
const d = String(today.getDate()).padStart(2, '0');
const currentWeekKey = weekStartString(`${y}-${m}-${d}`);
const currentWeekActual = weeklyMap[currentWeekKey] || { hours: 0, questions: 0, mocks: 0 };

const mobileCompletion = completed.length
  ? Math.round(
      completed.reduce((sum, l) => sum + checklistProgress(l.morningChecklist) + checklistProgress(l.afternoonChecklist), 0) /
        (completed.length * 2)
    )
  : 0;

return {
  totalHours,
  totalQuestions,
  avgAccuracy,
  mockCount,
  passedMocks,
  failedMocks,
  topicData,
  weakTopics,
  statusCounts,
  weeklyData,
  cumulativeData,
  streak,
  currentWeekActual,
  mobileCompletion,
};

}, [logs]);

const updateChecklist = (section, key, value) => { setForm((prev) => ({ ...prev, [section]: { ...(prev[section] || {}), [key]: value, }, })); };

const handleAddLog = () => { if (!form.date || !form.topic) return; setLogs((prev) => { const normalized = { ...form, mockResult: form.mock === 'Yes' ? form.mockResult || 'Pending' : 'N/A', }; const exists = prev.find((l) => l.date === form.date); if (exists) { return prev.map((l) => (l.date === form.date ? normalized : l)).sort((a, b) => new Date(a.date) - new Date(b.date)); } return [...prev, normalized].sort((a, b) => new Date(a.date) - new Date(b.date)); }); };

const loadDay = (log) => { setForm({ ...log, morningChecklist: log.morningChecklist || defaultMorningChecklist(), afternoonChecklist: log.afternoonChecklist || defaultAfternoonChecklist(), }); setActiveTab('log'); };

const exportData = () => downloadJson('cfa-study-tracker-backup.json', { logs, weeklyGoals });

const handleImport = async (event) => { const file = event.target.files?.[0]; if (!file) return; const text = await file.text(); const parsed = JSON.parse(text); if (parsed.logs) setLogs(parsed.logs); if (parsed.weeklyGoals) setWeeklyGoals(parsed.weeklyGoals); event.target.value = ''; };

const resetPlanner = () => { const planned = buildCalendarLogs(); const completedMap = Object.fromEntries(initialCompletedLogs.map((x) => [x.date, x])); setLogs(planned.map((row) => completedMap[row.date] || row)); };

const markFullDayDone = () => { setForm((prev) => ({ ...prev, morningHours: 2.5, afternoonHours: 2, status: 'Done', morningChecklist: { startMorningSession: true, mainTopicLearning: true, firstQuestionBlock: true, formulasReview: true, }, afternoonChecklist: { startAfternoonSession: true, ethicsOrSecondTopic: true, secondQuestionBlock: true, recapAndErrorLog: true, }, })); };

const COLORS = ['#0f172a', '#334155', '#94a3b8'];

return ( <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-8"> <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6"> <div className={cardClass('p-4 sm:p-6 md:p-8')}> <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between"> <div> <div className="flex items-center gap-2 text-slate-600"> <Smartphone className="h-4 w-4" /> <span className="text-xs sm:text-sm">Mobile-first study tracker</span> </div> <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">CFA Level I Study Tracker</h1> <p className="mt-2 text-sm sm:text-base text-slate-600">Built around your study windows: 4:00 to 6:30 AM and 4:00 to 6:00 PM</p> <div className="mt-4 flex flex-wrap gap-2"> <SimpleBadge dark>Exam Target: Aug 24, 2026</SimpleBadge> <SimpleBadge outline>Daily checklists</SimpleBadge> <SimpleBadge outline>Backup + import</SimpleBadge> </div> </div> <div className="w-full rounded-2xl bg-slate-100 p-4 sm:p-5 lg:w-80"> <div className="mb-3 flex items-center gap-3"> <CalendarDays className="h-5 w-5 text-slate-700" /> <p className="font-semibold text-slate-800">Exam Countdown</p> </div> <p className="text-3xl sm:text-4xl font-bold text-slate-900">{getDaysToExam()}</p> <p className="mt-1 text-sm text-slate-500">days remaining</p> <div className="mt-4 space-y-2"> <div className="flex justify-between text-sm text-slate-600"> <span>Target hour progress</span> <span>{Math.round((metrics.totalHours / totalTargetHours) * 100)}%</span> </div> <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200"> <div className="h-full rounded-full bg-slate-900" style={{ width: ${Math.min(100, (metrics.totalHours / totalTargetHours) * 100)}% }} /> </div> </div> </div> </div> </div>

<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard title="Hours" value={metrics.totalHours.toFixed(1)} icon={Clock3} subtitle={`Target: ${totalTargetHours}`} />
      <StatCard title="Questions" value={metrics.totalQuestions} icon={BookOpen} subtitle="Solved so far" />
      <StatCard title="Accuracy" value={`${metrics.avgAccuracy}%`} icon={Target} subtitle="Average" />
      <StatCard title="Mocks" value={metrics.mockCount} icon={Trophy} subtitle={`${metrics.passedMocks} pass / ${metrics.failedMocks} fail`} />
      <StatCard title="Streak" value={metrics.streak} icon={Flame} subtitle="Done days" />
      <StatCard title="Checklist" value={`${metrics.mobileCompletion}%`} icon={ListChecks} subtitle="Completion quality" />
    </div>

    <div className="rounded-3xl border border-slate-200 bg-slate-100 p-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
        <TabButton active={activeTab === 'log'} onClick={() => setActiveTab('log')}>Daily Log</TabButton>
        <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>Calendar</TabButton>
        <TabButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')}>Weekly Goals</TabButton>
        <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')}>Study Plan</TabButton>
      </div>
    </div>

    {activeTab === 'dashboard' && (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className={cardClass('xl:col-span-2')}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Cumulative Target vs Actual Hours</h3>
              <div className="mt-4 h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide={window.innerWidth < 500} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#0f172a" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={cardClass('border-amber-200 bg-amber-50')}>
            <div className="p-4 sm:p-6">
              <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-900"><AlertTriangle className="h-5 w-5" />Weak Topic Alerts</h3>
              <div className="mt-4 space-y-3">
                {metrics.weakTopics.length ? metrics.weakTopics.map((item) => (
                  <div key={item.topic} className="rounded-2xl border border-amber-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{item.topic}</p>
                      <SimpleBadge outline>{item.accuracy}%</SimpleBadge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.questions} questions solved</p>
                    <p className="mt-2 text-xs text-amber-700">Review this topic this week.</p>
                  </div>
                )) : <p className="text-sm text-slate-600">No weak-topic alert yet.</p>}
              </div>
            </div>
          </div>

          <div className={cardClass()}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">This Week vs Goal</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <div className="flex justify-between"><span>Hours</span><span>{metrics.currentWeekActual.hours.toFixed(1)} / {weeklyGoals.hours}</span></div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3">
                  <div className="flex justify-between"><span>Questions</span><span>{metrics.currentWeekActual.questions} / {weeklyGoals.questions}</span></div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3">
                  <div className="flex justify-between"><span>Mocks</span><span>{metrics.currentWeekActual.mocks} / {weeklyGoals.mocks}</span></div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3">
                  <div className="flex justify-between"><span>Accuracy Goal</span><span>{weeklyGoals.accuracy}%</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass()}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Weekly Study Hours</h3>
              <div className="mt-4 h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" hide={window.innerWidth < 500} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={cardClass()}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Hours by Topic</h3>
              <div className="mt-4 h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topicData.slice(0, 8)} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="topic" width={100} />
                    <Tooltip />
                    <Bar dataKey="hours" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={cardClass()}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Study Day Status</h3>
              <div className="mt-4 h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={metrics.statusCounts} dataKey="value" nameKey="name" outerRadius={100} label>
                      {metrics.statusCounts.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'log' && (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={cardClass('xl:col-span-1')}>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Daily Log</h3>
              <ButtonBase variant="outline" className="px-3 py-2" onClick={markFullDayDone}>Full Day</ButtonBase>
            </div>

            <Field label="Date">
              <InputBase type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold"><Clock3 className="h-4 w-4" /> Morning Block 4:00–6:30 AM</div>
              <div className="mt-3 space-y-2 text-sm">
                {[
                  ['startMorningSession', 'Start morning session'],
                  ['mainTopicLearning', 'Main topic learning'],
                  ['firstQuestionBlock', 'First question block'],
                  ['formulasReview', 'Formula review'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={!!form.morningChecklist?.[key]} onChange={(e) => updateChecklist('morningChecklist', key, e.target.checked)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-500">Checklist progress: {checklistProgress(form.morningChecklist)}%</div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold"><Clock3 className="h-4 w-4" /> Afternoon Block 4:00–6:00 PM</div>
              <div className="mt-3 space-y-2 text-sm">
                {[
                  ['startAfternoonSession', 'Start afternoon session'],
                  ['ethicsOrSecondTopic', 'Ethics or second topic'],
                  ['secondQuestionBlock', 'Second question block'],
                  ['recapAndErrorLog', 'Recap and error log'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={!!form.afternoonChecklist?.[key]} onChange={(e) => updateChecklist('afternoonChecklist', key, e.target.checked)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-500">Checklist progress: {checklistProgress(form.afternoonChecklist)}%</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Morning Hours">
                <InputBase type="number" step="0.5" value={form.morningHours} onChange={(e) => setForm({ ...form, morningHours: Number(e.target.value) })} />
              </Field>
              <Field label="Afternoon Hours">
                <InputBase type="number" step="0.5" value={form.afternoonHours} onChange={(e) => setForm({ ...form, afternoonHours: Number(e.target.value) })} />
              </Field>
            </div>

            <Field label="Main Topic">
              <SelectBase value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} options={TOPICS} />
            </Field>

            <Field label="Second Topic">
              <SelectBase value={form.secondTopic} onChange={(e) => setForm({ ...form, secondTopic: e.target.value })} options={TOPICS} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Questions">
                <InputBase type="number" value={form.questions} onChange={(e) => setForm({ ...form, questions: Number(e.target.value) })} />
              </Field>
              <Field label="Accuracy %">
                <InputBase type="number" value={form.accuracy} onChange={(e) => setForm({ ...form, accuracy: Number(e.target.value) })} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <SelectBase value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
              </Field>
              <Field label="Mock?">
                <SelectBase value={form.mock} onChange={(e) => setForm({ ...form, mock: e.target.value, mockResult: e.target.value === 'Yes' ? 'Pending' : 'N/A' })} options={MOCK_OPTIONS} />
              </Field>
            </div>

            {form.mock === 'Yes' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mock Score %">
                  <InputBase type="number" value={form.mockScore} onChange={(e) => setForm({ ...form, mockScore: e.target.value })} />
                </Field>
                <Field label="Mock Result">
                  <SelectBase value={form.mockResult} onChange={(e) => setForm({ ...form, mockResult: e.target.value })} options={['Pending', 'Pass', 'Fail']} />
                </Field>
              </div>
            )}

            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="What did you study today?"
                className="min-h-[100px] w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <ButtonBase className="w-full" onClick={handleAddLog}><Save className="h-4 w-4" />Save Day</ButtonBase>
              <ButtonBase variant="outline" className="w-full" onClick={exportData}><Download className="h-4 w-4" />Backup</ButtonBase>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ButtonBase variant="outline" className="w-full" onClick={() => importRef.current?.click()}><Upload className="h-4 w-4" />Import</ButtonBase>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
              <ButtonBase variant="outline" className="w-full" onClick={resetPlanner}>Reset Plan</ButtonBase>
            </div>
          </div>
        </div>

        <div className={cardClass('xl:col-span-2')}>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Saved Days</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3">Date</th>
                    <th className="py-3">Hours</th>
                    <th className="py-3">Topic</th>
                    <th className="py-3">Mock</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map((log) => (
                    <tr key={log.date} className="border-b last:border-0">
                      <td className="py-3">{log.date}</td>
                      <td className="py-3">{Number(log.morningHours) + Number(log.afternoonHours)}</td>
                      <td className="py-3">{log.topic}</td>
                      <td className="py-3">{log.mock === 'Yes' ? mockBadge(log.mockResult) : <SimpleBadge outline>No</SimpleBadge>}</td>
                      <td className="py-3">{log.status === 'Done' ? <SimpleBadge dark>Done</SimpleBadge> : log.status === 'Missed' ? <SimpleBadge danger>Missed</SimpleBadge> : <SimpleBadge outline>Planned</SimpleBadge>}</td>
                      <td className="py-3"><ButtonBase variant="ghost" className="px-2 py-1" onClick={() => loadDay(log)}>Load</ButtonBase></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'calendar' && (
      <div className={cardClass()}>
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">Calendar View</h3>
          <div className="mt-4 grid max-h-[700px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
            {logs.map((log) => (
              <button key={log.date} onClick={() => loadDay(log)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{log.date}</p>
                  {log.status === 'Done' ? <SimpleBadge dark>Done</SimpleBadge> : log.status === 'Missed' ? <SimpleBadge danger>Missed</SimpleBadge> : <SimpleBadge outline>Planned</SimpleBadge>}
                </div>
                <p className="mt-2 text-sm text-slate-700">{log.topic}</p>
                <p className="mt-1 text-xs text-slate-500">Morning checklist: {checklistProgress(log.morningChecklist)}%</p>
                <p className="mt-1 text-xs text-slate-500">Afternoon checklist: {checklistProgress(log.afternoonChecklist)}%</p>
                <div className="mt-2">{log.mock === 'Yes' ? mockBadge(log.mockResult) : <SimpleBadge outline>No Mock</SimpleBadge>}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

    {activeTab === 'goals' && (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={cardClass()}>
          <div className="p-4 sm:p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-900"><TrendingUp className="h-5 w-5" /> Weekly Score Goals</h3>
            <Field label="Hours Goal">
              <InputBase type="number" value={weeklyGoals.hours} onChange={(e) => setWeeklyGoals({ ...weeklyGoals, hours: Number(e.target.value) })} />
            </Field>
            <Field label="Questions Goal">
              <InputBase type="number" value={weeklyGoals.questions} onChange={(e) => setWeeklyGoals({ ...weeklyGoals, questions: Number(e.target.value) })} />
            </Field>
            <Field label="Accuracy Goal %">
              <InputBase type="number" value={weeklyGoals.accuracy} onChange={(e) => setWeeklyGoals({ ...weeklyGoals, accuracy: Number(e.target.value) })} />
            </Field>
            <Field label="Mocks Goal">
              <InputBase type="number" value={weeklyGoals.mocks} onChange={(e) => setWeeklyGoals({ ...weeklyGoals, mocks: Number(e.target.value) })} />
            </Field>
          </div>
        </div>

        <div className={cardClass()}>
          <div className="p-4 sm:p-6 space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Current Week Progress</h3>
            <div className="rounded-2xl bg-slate-100 p-4 text-sm flex items-center justify-between"><span>Hours</span><span>{metrics.currentWeekActual.hours.toFixed(1)} / {weeklyGoals.hours}</span></div>
            <div className="rounded-2xl bg-slate-100 p-4 text-sm flex items-center justify-between"><span>Questions</span><span>{metrics.currentWeekActual.questions} / {weeklyGoals.questions}</span></div>
            <div className="rounded-2xl bg-slate-100 p-4 text-sm flex items-center justify-between"><span>Mocks</span><span>{metrics.currentWeekActual.mocks} / {weeklyGoals.mocks}</span></div>
            <div className="rounded-2xl bg-slate-100 p-4 text-sm flex items-center justify-between"><span>Accuracy Target</span><span>{weeklyGoals.accuracy}%</span></div>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'plan' && (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={cardClass()}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Daily Study Windows</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4">
                  <Clock3 className="h-5 w-5 text-slate-700" />
                  <div>
                    <p className="font-semibold">Morning Session</p>
                    <p className="text-sm text-slate-600">4:00 AM to 6:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4">
                  <Clock3 className="h-5 w-5 text-slate-700" />
                  <div>
                    <p className="font-semibold">Afternoon Session</p>
                    <p className="text-sm text-slate-600">4:00 PM to 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass()}>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Priority Topic Order</h3>
              <div className="mt-4 space-y-3">
                {['Fixed Income', 'Equity', 'Corporate Issuers', 'Portfolio Management', 'Derivatives', 'Alternative Investments', 'Ethics throughout'].map((item, i) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{i + 1}</div>
                    <p className="font-medium text-slate-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={cardClass()}>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Recommended Weekly Flow</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-7">
              {[
                ['Sat', 'Full 4 to 4.5 hours', 'Main topic + questions'],
                ['Sun', 'Full 4 to 4.5 hours', 'Main topic + ethics'],
                ['Mon', 'Full 4 to 4.5 hours', 'Questions + weak area'],
                ['Tue', 'Full 4 to 4.5 hours', 'Mixed questions'],
                ['Wed', 'Full 4 to 4.5 hours', 'Topic repair + maintenance'],
                ['Thu', 'Light', '2 to 2.5 hours'],
                ['Fri', 'Lighter review', '3 hours or recovery'],
              ].map(([day, type, detail]) => (
                <div key={day} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-slate-900">{day}</p>
                  <p className="mt-1 text-sm text-slate-600">{type}</p>
                  <p className="mt-2 text-xs text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="flex items-center justify-center gap-2 pb-4 text-center text-xs sm:text-sm text-slate-500">
      <CheckCircle2 className="h-4 w-4" />
      Mobile-friendly, backup-safe, and built for real daily execution.
    </div>
  </div>
</div>

); }

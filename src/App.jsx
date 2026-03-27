import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock3, Target, BookOpen, Trophy, CheckCircle2, AlertTriangle, Download, Flame, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const TOPICS = [
  'Ethics',
  'Fixed Income',
  'Equity',
  'Corporate Issuers',
  'Portfolio Management',
  'Derivatives',
  'Alternative Investments',
  'Quant',
  'FRA',
  'Economics',
  'Mixed Practice',
  'Mock Exam',
  'Light Review',
  'Formula Review',
  'Review / Practice',
  'Confidence',
  'Error Log',
  'Review',
];

const initialCompletedLogs = [
  {
    date: '2026-03-27',
    morningHours: 2.5,
    afternoonHours: 2,
    topic: 'Fixed Income',
    secondTopic: 'Ethics',
    questions: 25,
    accuracy: 64,
    status: 'Done',
    mock: 'No',
    notes: 'FI basics + Ethics start',
  },
  {
    date: '2026-03-28',
    morningHours: 2.5,
    afternoonHours: 2,
    topic: 'Fixed Income',
    secondTopic: 'Quant',
    questions: 30,
    accuracy: 68,
    status: 'Done',
    mock: 'No',
    notes: 'Bond pricing and maintenance review',
  },
];

const studyPlanSeed = {
  '2026-03-27': ['Fixed Income', 'Ethics', 'FI basics + Ethics start'],
  '2026-03-28': ['Fixed Income', 'Quant', 'Bond pricing + Quant maintenance'],
  '2026-03-29': ['Fixed Income', 'Ethics', 'Yield measures + Ethics'],
  '2026-03-30': ['Fixed Income', 'Economics', 'FI risk + Econ maintenance'],
  '2026-03-31': ['Fixed Income', 'Ethics', 'Duration and convexity + Ethics questions'],
  '2026-04-01': ['Fixed Income', 'FRA', 'FI mixed timed set + FRA maintenance'],
  '2026-04-02': ['Fixed Income', 'Formula Review', 'Light FI review + formulas'],
  '2026-04-03': ['Fixed Income', 'Ethics', 'Term structure + Ethics'],
  '2026-04-04': ['Fixed Income', 'Quant', 'Securitized products + Quant maintenance'],
  '2026-04-05': ['Fixed Income', 'Error Log', 'FI mixed review'],
  '2026-04-10': ['Equity', 'Ethics', 'Equity market organization + Ethics'],
  '2026-04-11': ['Equity', 'Quant', 'Market efficiency + Quant maintenance'],
  '2026-04-18': ['Corporate Issuers', 'Quant', 'Governance basics + Quant maintenance'],
  '2026-04-24': ['Portfolio Management', 'Ethics', 'Risk and return basics'],
  '2026-05-01': ['Derivatives', 'Ethics', 'Forwards and futures foundation'],
  '2026-05-05': ['Alternative Investments', 'Ethics', 'Alternatives overview'],
  '2026-06-15': ['Mixed Practice', 'Ethics', 'Half-mock style practice'],
  '2026-07-20': ['Mock Exam', 'Review', 'Timed mock + deep review'],
  '2026-08-15': ['Ethics', 'Formula Review', 'Final ethics and formula sharpening'],
  '2026-08-23': ['Light Review', 'Confidence', 'Final light review before exam'],
  '2026-08-24': ['Mock Exam', 'Confidence', 'Exam day'],
};

function buildDateRange(start, end) {
  const dates = [];
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (current <= last) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function buildCalendarLogs() {
  return buildDateRange('2026-03-27', '2026-08-24').map((date) => {
    const seeded = studyPlanSeed[date];
    return {
      date,
      morningHours: 2.5,
      afternoonHours: 2,
      topic: seeded?.[0] || 'Review / Practice',
      secondTopic: seeded?.[1] || 'Ethics',
      questions: 0,
      accuracy: 0,
      status: 'Planned',
      mock: seeded?.[0] === 'Mock Exam' ? 'Yes' : 'No',
      notes: seeded?.[2] || 'Planned study day',
    };
  });
}

function getDaysToExam() {
  const today = new Date();
  const exam = new Date('2026-08-24T00:00:00');
  const diff = exam.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <Card className="rounded-2xl shadow-sm border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {subtitle ? <p className="text-xs text-slate-500 mt-2">{subtitle}</p> : null}
          </div>
          <div className="p-3 rounded-2xl bg-slate-100">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CFAStudyTrackerApp() {
  const [logs, setLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('cfa-study-tracker-logs');
      if (saved) return JSON.parse(saved);
    }
    const planned = buildCalendarLogs();
    const completedMap = Object.fromEntries(initialCompletedLogs.map((x) => [x.date, x]));
    return planned.map((row) => completedMap[row.date] || row);
  });

  const [form, setForm] = useState({
    date: '2026-03-30',
    morningHours: 2.5,
    afternoonHours: 2,
    topic: 'Fixed Income',
    secondTopic: 'Ethics',
    questions: 25,
    accuracy: 70,
    status: 'Planned',
    mock: 'No',
    notes: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cfa-study-tracker-logs', JSON.stringify(logs));
    }
  }, [logs]);

  const totalTargetHours = 4 * 151;

  const metrics = useMemo(() => {
    const completed = logs.filter((l) => l.status === 'Done');
    const totalHours = completed.reduce((sum, l) => sum + Number(l.morningHours || 0) + Number(l.afternoonHours || 0), 0);
    const totalQuestions = completed.reduce((sum, l) => sum + Number(l.questions || 0), 0);
    const avgAccuracy = completed.length
      ? Math.round(completed.reduce((sum, l) => sum + Number(l.accuracy || 0), 0) / completed.length)
      : 0;
    const mockCount = completed.filter((l) => l.mock === 'Yes').length;

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

    const weakTopics = topicData
      .filter((t) => t.questions >= 20 && t.accuracy < 70)
      .slice(0, 4);

    const statusCounts = ['Done', 'Planned', 'Missed'].map((status) => ({
      name: status,
      value: logs.filter((l) => l.status === status).length,
    }));

    const weeklyMap = {};
    logs.forEach((l) => {
      const d = new Date(`${l.date}T00:00:00`);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const dayOffset = Math.floor((d - startOfYear) / (1000 * 60 * 60 * 24));
      const week = Math.floor(dayOffset / 7) + 1;
      const weekKey = `W${week}`;
      if (!weeklyMap[weekKey]) weeklyMap[weekKey] = { week: weekKey, hours: 0, questions: 0 };
      if (l.status === 'Done') {
        weeklyMap[weekKey].hours += Number(l.morningHours || 0) + Number(l.afternoonHours || 0);
        weeklyMap[weekKey].questions += Number(l.questions || 0);
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
      if (i === doneDates.length - 1) {
        streak = 1;
      } else {
        const current = new Date(`${doneDates[i + 1]}T00:00:00`);
        const previous = new Date(`${doneDates[i]}T00:00:00`);
        const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak += 1;
        else break;
      }
    }

    return { totalHours, totalQuestions, avgAccuracy, mockCount, topicData, weakTopics, statusCounts, weeklyData, cumulativeData, streak };
  }, [logs]);

  const handleAddLog = () => {
    if (!form.date || !form.topic) return;
    setLogs((prev) => {
      const exists = prev.find((l) => l.date === form.date);
      if (exists) {
        return prev.map((l) => (l.date === form.date ? { ...form } : l)).sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      return [...prev, { ...form }].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  };

  const loadDay = (log) => setForm({ ...log });
  const exportData = () => downloadJson('cfa-study-tracker-data.json', logs);
  const resetPlanner = () => {
    const planned = buildCalendarLogs();
    const completedMap = Object.fromEntries(initialCompletedLogs.map((x) => [x.date, x]));
    setLogs(planned.map((row) => completedMap[row.date] || row));
  };

  const COLORS = ['#0f172a', '#334155', '#94a3b8'];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">CFA Level I Study Tracker</h1>
              <p className="text-slate-600 mt-2">Built around your study windows: 4:00 to 6:30 AM and 4:00 to 6:00 PM</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="rounded-full px-3 py-1 bg-slate-900">Exam Target: Aug 24, 2026</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">Flexible 4-hour routine</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">Autosaves locally</Badge>
              </div>
            </div>
            <div className="w-full lg:w-80 bg-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="h-5 w-5 text-slate-700" />
                <p className="font-semibold text-slate-800">Exam Countdown</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{getDaysToExam()}</p>
              <p className="text-sm text-slate-500 mt-1">days remaining</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Target hour progress</span>
                  <span>{Math.round((metrics.totalHours / totalTargetHours) * 100)}%</span>
                </div>
                <Progress value={(metrics.totalHours / totalTargetHours) * 100} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Hours Completed" value={metrics.totalHours.toFixed(1)} icon={Clock3} subtitle={`Target: ${totalTargetHours} hrs`} />
          <StatCard title="Questions Solved" value={metrics.totalQuestions} icon={BookOpen} subtitle="From completed study days" />
          <StatCard title="Average Accuracy" value={`${metrics.avgAccuracy}%`} icon={Target} subtitle="Track this upward over time" />
          <StatCard title="Mock Sessions" value={metrics.mockCount} icon={Trophy} subtitle="Count of completed mock days" />
          <StatCard title="Current Streak" value={metrics.streak} icon={Flame} subtitle="Consecutive done days" />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full md:w-[560px] rounded-2xl">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="log">Daily Log</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="plan">Study Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="rounded-2xl xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Cumulative Target vs Actual Hours</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.cumulativeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="actual" stroke="#0f172a" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Weak Topic Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.weakTopics.length ? metrics.weakTopics.map((item) => (
                    <div key={item.topic} className="p-3 rounded-2xl bg-white border border-amber-200">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{item.topic}</p>
                        <Badge variant="outline">{item.accuracy}%</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{item.questions} questions solved</p>
                      <p className="text-xs text-amber-700 mt-2">Review this topic this week.</p>
                    </div>
                  )) : <p className="text-sm text-slate-600">No weak-topic alert yet. Keep solving questions and this panel will update.</p>}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Study Hours</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Hours by Topic</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.topicData.slice(0, 8)} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="topic" width={120} />
                      <Tooltip />
                      <Bar dataKey="hours" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Study Day Status Mix</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.statusCounts} dataKey="value" nameKey="name" outerRadius={100} label>
                        {metrics.statusCounts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Topic Performance Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-3">Topic</th>
                        <th className="py-3">Hours</th>
                        <th className="py-3">Questions</th>
                        <th className="py-3">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topicData.map((row) => (
                        <tr key={row.topic} className="border-b last:border-0">
                          <td className="py-3 font-medium">{row.topic}</td>
                          <td className="py-3">{row.hours}</td>
                          <td className="py-3">{row.questions}</td>
                          <td className="py-3">{row.accuracy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="rounded-2xl xl:col-span-1">
                <CardHeader>
                  <CardTitle>Add or Update Study Day</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Morning Hours</Label>
                      <Input type="number" step="0.5" value={form.morningHours} onChange={(e) => setForm({ ...form, morningHours: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Afternoon Hours</Label>
                      <Input type="number" step="0.5" value={form.afternoonHours} onChange={(e) => setForm({ ...form, afternoonHours: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <Label>Main Topic</Label>
                    <Select value={form.topic} onValueChange={(value) => setForm({ ...form, topic: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Second Topic</Label>
                    <Select value={form.secondTopic} onValueChange={(value) => setForm({ ...form, secondTopic: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Questions</Label>
                      <Input type="number" value={form.questions} onChange={(e) => setForm({ ...form, questions: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Accuracy %</Label>
                      <Input type="number" value={form.accuracy} onChange={(e) => setForm({ ...form, accuracy: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planned">Planned</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                          <SelectItem value="Missed">Missed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Mock?</Label>
                      <Select value={form.mock} onValueChange={(value) => setForm({ ...form, mock: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What did you study today?" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="w-full rounded-2xl" onClick={handleAddLog}><Save className="h-4 w-4 mr-2" />Save Day</Button>
                    <Button variant="outline" className="w-full rounded-2xl" onClick={exportData}><Download className="h-4 w-4 mr-2" />Export</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl xl:col-span-2">
                <CardHeader>
                  <CardTitle>Study Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="text-left border-b">
                          <th className="py-3">Date</th>
                          <th className="py-3">Hours</th>
                          <th className="py-3">Main Topic</th>
                          <th className="py-3">2nd Topic</th>
                          <th className="py-3">Questions</th>
                          <th className="py-3">Accuracy</th>
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
                            <td className="py-3">{log.secondTopic}</td>
                            <td className="py-3">{log.questions}</td>
                            <td className="py-3">{log.accuracy}%</td>
                            <td className="py-3">
                              <Badge variant={log.status === 'Done' ? 'default' : log.status === 'Missed' ? 'destructive' : 'outline'}>{log.status}</Badge>
                            </td>
                            <td className="py-3"><Button variant="ghost" size="sm" onClick={() => loadDay(log)}>Load</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <CardTitle>Calendar View: Mar 27 to Aug 24</CardTitle>
                  <Button variant="outline" className="rounded-2xl" onClick={resetPlanner}>Reset to Original Plan</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[700px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <button key={log.date} onClick={() => loadDay(log)} className="text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 transition">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{log.date}</p>
                        <Badge variant={log.status === 'Done' ? 'default' : log.status === 'Missed' ? 'destructive' : 'outline'}>{log.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mt-2">{log.topic}</p>
                      <p className="text-xs text-slate-500 mt-1">Second: {log.secondTopic}</p>
                      <p className="text-xs text-slate-500 mt-2">{log.notes}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Daily Study Windows</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-100">
                    <Clock3 className="h-5 w-5 text-slate-700" />
                    <div>
                      <p className="font-semibold">Morning Session</p>
                      <p className="text-sm text-slate-600">4:00 AM to 6:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-100">
                    <Clock3 className="h-5 w-5 text-slate-700" />
                    <div>
                      <p className="font-semibold">Afternoon Session</p>
                      <p className="text-sm text-slate-600">4:00 PM to 6:00 PM</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-slate-700">
                    <p><span className="font-semibold">Morning:</span> main topic learning + first question block</p>
                    <p><span className="font-semibold">Afternoon:</span> ethics, second topic, maintenance, and recap</p>
                    <p><span className="font-semibold">Best use:</span> untouched topics first, then mixed practice and mocks later</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Priority Topic Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['Fixed Income', 'Equity', 'Corporate Issuers', 'Portfolio Management', 'Derivatives', 'Alternative Investments', 'Ethics throughout'].map((item, i) => (
                    <div key={item} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200">
                      <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">{i + 1}</div>
                      <p className="font-medium text-slate-800">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Recommended Weekly Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
                  {[
                    ['Sat', 'Full 4 hours', 'Main topic + questions'],
                    ['Sun', 'Full 4 hours', 'Main topic + ethics'],
                    ['Mon', 'Full 4 hours', 'Questions + weak area'],
                    ['Tue', 'Full 4 hours', 'Mixed questions'],
                    ['Wed', 'Full 4 hours', 'Topic repair + maintenance'],
                    ['Thu', 'Light', '2 to 2.5 hours'],
                    ['Fri', 'Lighter review', '3 hours or recovery'],
                  ].map(([day, type, detail]) => (
                    <div key={day} className="p-4 rounded-2xl border border-slate-200 bg-white">
                      <p className="font-semibold text-slate-900">{day}</p>
                      <p className="text-sm text-slate-600 mt-1">{type}</p>
                      <p className="text-xs text-slate-500 mt-2">{detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-slate-500 pb-4 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Track consistently, repair weak areas early, and keep Ethics alive every week.
        </div>
      </div>
    </div>
  );
  }

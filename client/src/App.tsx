import { useEffect, useMemo, useState } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { StatsCards } from '@/components/dashboard/StatsCards';
import type { DashboardStats, WorkEvent } from '@/types';
import { format } from 'date-fns';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const initialEvents: WorkEvent[] = [
  {
    id: 'evt-1',
    title: 'Client Delivery',
    projectName: 'Alpha Launch',
    client: 'Northwind',
    start: '09:00',
    end: '17:00',
    breakTime: 30,
    totalHours: 7.5,
    location: 'Remote',
    description: 'Product delivery sprint',
    colorLabel: '#7c3aed',
    startDateTime: '2026-08-03T09:00',
    endDateTime: '2026-08-03T17:00',
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const [events, setEvents] = useState<WorkEvent[]>(initialEvents);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const stats = useMemo<DashboardStats>(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const startOfWeek = new Date();
    const weekHours = events.filter((event) => event.startDateTime >= `${format(startOfWeek, 'yyyy-MM-dd')}T00:00`).reduce((sum, event) => sum + event.totalHours, 0);
    const monthHours = events.filter((event) => event.startDateTime.startsWith(format(new Date(), 'yyyy-MM'))).reduce((sum, event) => sum + event.totalHours, 0);
    const todayHours = events.filter((event) => event.startDateTime.startsWith(today)).reduce((sum, event) => sum + event.totalHours, 0);
    const activityData = events.slice(0, 4).map((event) => ({ id: event.id, title: event.projectName, time: event.start }));
    const hoursByDay = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dayKey = format(date, 'yyyy-MM-dd');
      const hours = events.filter((event) => event.startDateTime.startsWith(dayKey)).reduce((sum, event) => sum + event.totalHours, 0);
      return { day: format(date, 'EEE'), hours };
    });
    return {
      todayHours,
      weekHours,
      monthHours,
      projectCount: new Set(events.map((event) => event.projectName)).size,
      recentActivities: activityData,
      hoursByDay,
    };
  }, [events]);

  const createEvent = (payload: Omit<WorkEvent, 'id' | 'createdAt' | 'googleEventId'> & { id?: string }) => {
    const newEvent: WorkEvent = {
      id: payload.id ?? crypto.randomUUID(),
      title: payload.title,
      projectName: payload.projectName,
      client: payload.client,
      start: payload.start,
      end: payload.end,
      breakTime: payload.breakTime,
      totalHours: payload.totalHours,
      location: payload.location,
      description: payload.description,
      colorLabel: payload.colorLabel,
      startDateTime: payload.startDateTime,
      endDateTime: payload.endDateTime,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const updateEvent = (payload: WorkEvent) => {
    setEvents((prev) => prev.map((event) => (event.id === payload.id ? payload : event)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const exportData = (format: 'csv' | 'excel' | 'pdf') => {
    if (format === 'csv') {
      const rows = [['Project', 'Client', 'Start', 'End', 'Hours', 'Location']];
      events.forEach((event) => rows.push([event.projectName, event.client, event.startDateTime, event.endDateTime, event.totalHours.toString(), event.location]));
      const csv = rows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'work-calendar.csv';
      link.click();
      URL.revokeObjectURL(url);
    }
    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(events.map((event) => ({ project: event.projectName, client: event.client, start: event.startDateTime, end: event.endDateTime, hours: event.totalHours, location: event.location })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Calendar');
      XLSX.writeFile(workbook, 'work-calendar.xlsx');
    }
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Work Calendar Export', 14, 16);
      events.forEach((event, index) => {
        doc.text(`${index + 1}. ${event.projectName} - ${event.totalHours}h`, 14, 24 + index * 8);
      });
      doc.save('work-calendar.pdf');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`border-b ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-violet-500">Work Calendar Suite</p>
            <h1 className="text-xl font-semibold">Modern work planning and tracking</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode((prev) => !prev)} className={`rounded-full p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {darkMode ? <span>☀️</span> : <span>🌙</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <StatsCards stats={stats} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Hours worked this week</h2>
              <p className="text-sm text-slate-500">A quick view of your recent workload.</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hoursByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <CalendarView events={events} onCreate={createEvent} onUpdate={updateEvent} onDelete={deleteEvent} onExport={exportData} />
      </main>
    </div>
  );
}

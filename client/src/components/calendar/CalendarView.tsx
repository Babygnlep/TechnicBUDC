import { useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg, EventDragStopArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Filter, PlusCircle, Download, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { WorkEventForm } from '@/components/calendar/WorkEventForm';
import type { WorkEvent } from '@/types';
import { formatHours } from '@/lib/utils';

interface Props {
  events: WorkEvent[];
  onCreate: (event: Omit<WorkEvent, 'id' | 'createdAt' | 'googleEventId'> & { id?: string }) => void;
  onUpdate: (event: WorkEvent) => void;
  onDelete: (id: string) => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
}

export function CalendarView({ events, onCreate, onUpdate, onExport }: Props) {
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WorkEvent | undefined>();
  const calendarRef = useRef<FullCalendar | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = !search || `${event.title} ${event.projectName} ${event.client}`.toLowerCase().includes(search.toLowerCase());
      const matchesProject = projectFilter === 'all' || event.projectName === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [events, search, projectFilter]);

  const projects = useMemo(() => Array.from(new Set(events.map((event) => event.projectName))), [events]);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  const handleEventClick = (info: { event: { id: string; title: string; start: Date | null; end: Date | null } }) => {
    const event = events.find((item) => item.id === info.event.id);
    if (event) {
      setEditingEvent(event);
      setDialogOpen(true);
    }
  };

  const handleEventDrop = (info: EventDragStopArg) => {
    const event = events.find((item) => item.id === info.event.id);
    if (!event) return;
    const nextEvent: WorkEvent = {
      ...event,
      startDateTime: info.event.start?.toISOString() ?? event.startDateTime,
      endDateTime: info.event.end?.toISOString() ?? event.endDateTime,
    };
    onUpdate(nextEvent);
  };

  const handleEventResize = (info: EventResizeDoneArg) => {
    const event = events.find((item) => item.id === info.event.id);
    if (!event) return;
    const nextEvent: WorkEvent = {
      ...event,
      endDateTime: info.event.end?.toISOString() ?? event.endDateTime,
    };
    onUpdate(nextEvent);
  };

  const saveEvent = (payload: Omit<WorkEvent, 'id' | 'createdAt' | 'googleEventId'> & { id?: string }) => {
    if (editingEvent) {
      onUpdate({ ...editingEvent, ...payload, id: editingEvent.id, createdAt: editingEvent.createdAt, googleEventId: editingEvent.googleEventId });
    } else {
      onCreate(payload);
    }
    setDialogOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Work calendar overview</p>
          <h2 className="text-2xl font-semibold text-slate-900">Plan, track, and manage your workday</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setView('dayGridMonth')}>
            Month
          </Button>
          <Button variant="outline" onClick={() => setView('timeGridWeek')}>
            Week
          </Button>
          <Button variant="outline" onClick={() => setView('timeGridDay')}>
            Day
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative flex min-w-[180px] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-full bg-transparent text-sm outline-none">
                <option value="all">All projects</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <FullCalendar
            ref={calendarRef as never}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            editable
            selectable
            selectMirror
            dayMaxEvents
            events={filteredEvents.map((event) => ({
              id: event.id,
              title: `${event.projectName} • ${event.totalHours}h`,
              start: event.startDateTime,
              end: event.endDateTime,
              backgroundColor: event.colorLabel,
              borderColor: event.colorLabel,
              textColor: '#fff',
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick as never}
            eventDrop={handleEventDrop as never}
            eventResize={handleEventResize as never}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            viewDidMount={(arg: any) => setView(arg.view.type as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay')}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Today</p>
                <p className="text-3xl font-semibold">{formatHours(events.filter((event) => event.startDateTime.startsWith(format(new Date(), 'yyyy-MM-dd'))).reduce((sum, event) => sum + event.totalHours * 60, 0))}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-violet-400" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Quick actions</h3>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => onExport('csv')}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => onExport('excel')}>
                <Download className="mr-2 h-4 w-4" /> Export Excel
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => onExport('pdf')}>
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <WorkEventForm initialDate={selectedDate} event={editingEvent} onSubmit={saveEvent} onCancel={() => setDialogOpen(false)} />
        </div>
      </Dialog>
    </motion.div>
  );
}

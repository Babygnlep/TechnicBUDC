import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateDuration } from '@/lib/utils';
import type { WorkEvent } from '@/types';

interface Props {
  initialDate: string;
  event?: WorkEvent;
  onSubmit: (event: Omit<WorkEvent, 'id' | 'createdAt' | 'googleEventId'> & { id?: string }) => void;
  onCancel: () => void;
}

const colorOptions = ['#7c3aed', '#2563eb', '#0f766e', '#ca8a04', '#dc2626', '#be185d'];

export function WorkEventForm({ initialDate, event, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    title: event?.title ?? 'Work Session',
    projectName: event?.projectName ?? '',
    client: event?.client ?? '',
    start: event?.start ?? '09:00',
    end: event?.end ?? '17:00',
    breakTime: event?.breakTime ?? 30,
    totalHours: event?.totalHours ?? 8,
    location: event?.location ?? '',
    description: event?.description ?? '',
    colorLabel: event?.colorLabel ?? colorOptions[0],
    startDateTime: event?.startDateTime ?? `${initialDate}T09:00`,
    endDateTime: event?.endDateTime ?? `${initialDate}T17:00`,
  });

  const duration = useMemo(() => calculateDuration(form.start, form.end, form.breakTime), [form.start, form.end, form.breakTime]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, totalHours: Math.round((duration / 60) * 10) / 10 }));
  }, [duration]);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: event?.id,
      title: form.title,
      projectName: form.projectName,
      client: form.client,
      start: form.start,
      end: form.end,
      breakTime: form.breakTime,
      totalHours: form.totalHours,
      location: form.location,
      description: form.description,
      colorLabel: form.colorLabel,
      startDateTime: `${initialDate}T${form.start}`,
      endDateTime: `${initialDate}T${form.end}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          Project Name
          <Input value={form.projectName} onChange={(e) => handleChange('projectName', e.target.value)} required />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Client
          <Input value={form.client} onChange={(e) => handleChange('client', e.target.value)} required />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Start Time
          <Input type="time" value={form.start} onChange={(e) => handleChange('start', e.target.value)} required />
        </label>
        <label className="space-y-1 text-sm font-medium">
          End Time
          <Input type="time" value={form.end} onChange={(e) => handleChange('end', e.target.value)} required />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Break Time (min)
          <Input type="number" value={form.breakTime} onChange={(e) => handleChange('breakTime', Number(e.target.value))} />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Total Hours
          <Input type="number" step="0.1" value={form.totalHours} onChange={(e) => handleChange('totalHours', Number(e.target.value))} />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Location
          <Input value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Color Label
          <div className="flex gap-2 pt-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`h-7 w-7 rounded-full border-2 ${form.colorLabel === color ? 'border-slate-900' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => handleChange('colorLabel', color)}
              />
            ))}
          </div>
        </label>
      </div>
      <label className="space-y-1 text-sm font-medium">
        Description
        <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <p className="text-sm text-slate-500">Calculated duration: {Math.round((duration / 60) * 10) / 10} hours</p>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Event</Button>
      </div>
    </form>
  );
}

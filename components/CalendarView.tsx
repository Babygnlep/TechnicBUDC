"use client";

import { useEffect, useMemo, useState } from "react";

interface ScheduleEntry {
  id: string;
  topic: string;
  date: string;
  taskDescription: string;
  note: string;
  createdAt?: string;
}

interface CalendarViewProps {
  entries: ScheduleEntry[];
}

const TOPIC_COLORS: Record<string, { badge: string; dot: string; border: string }> = {
  LDC: {
    badge: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    dot: "bg-cyan-400",
    border: "border-cyan-400/30",
  },
  CAMERASTORE: {
    badge: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
    dot: "bg-fuchsia-400",
    border: "border-fuchsia-400/30",
  },
  DEFAULT: {
    badge: "border-reel/30 bg-reel/10 text-reel",
    dot: "bg-reel",
    border: "border-white/10",
  },
};

function getTopicStyle(topic: string) {
  return TOPIC_COLORS[topic] ?? TOPIC_COLORS.DEFAULT;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function getCalendarDays(anchor: Date) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ date: Date; inCurrentMonth: boolean }> = [];

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    cells.push({
      date: new Date(year, month - 1, daysInPreviousMonth - index),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inCurrentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - daysInMonth - firstWeekday + 1;
    cells.push({ date: new Date(year, month + 1, nextDay), inCurrentMonth: false });
  }

  return cells;
}

export default function CalendarView({ entries }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate && entries[0]?.date) {
      setSelectedDate(entries[0].date);
    }
  }, [entries, selectedDate]);

  const monthLabel = useMemo(
    () => currentMonth.toLocaleDateString("th-TH", { month: "long", year: "numeric" }),
    [currentMonth]
  );

  const visibleDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const activeDate = useMemo(() => {
    if (selectedDate) {
      return selectedDate;
    }

    const monthPrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
    const match = entries.find((entry) => entry.date.startsWith(monthPrefix));
    return match?.date ?? entries[0]?.date ?? formatDateValue(new Date());
  }, [currentMonth, entries, selectedDate]);

  const selectedEntries = useMemo(
    () => entries.filter((entry) => entry.date === activeDate).sort((a, b) => a.topic.localeCompare(b.topic)),
    [activeDate, entries]
  );

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div id="calendar" className="rounded-[1.6rem] border border-white/10 bg-[#0a111f]/95 p-4 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">ปฏิทินงาน</p>
          <h3 className="mt-2 text-2xl font-display text-white">ดูวันลงงานในเดือนนี้</h3>
        </div>
        <div className="flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 sm:w-auto sm:justify-start">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100 transition hover:bg-white/20"
          >
            ←
          </button>
          <span className="min-w-0 flex-1 text-center text-sm font-semibold text-slate-100 sm:min-w-[10rem] sm:flex-none">{monthLabel}</span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100 transition hover:bg-white/20"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 sm:gap-2 sm:text-[11px] sm:uppercase sm:tracking-[0.25em]">
        {[
          { short: "อา", full: "Sun" },
          { short: "จ", full: "Mon" },
          { short: "อ", full: "Tue" },
          { short: "พ", full: "Wed" },
          { short: "พฤ", full: "Thu" },
          { short: "ศ", full: "Fri" },
          { short: "ส", full: "Sat" },
        ].map((day) => (
          <div key={day.full}>
            <span className="sm:hidden">{day.short}</span>
            <span className="hidden sm:inline">{day.full}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
        {visibleDays.map(({ date, inCurrentMonth }) => {
          const dateKey = formatDateValue(date);
          const dayEntries = entries.filter((entry) => entry.date === dateKey);
          const isSelected = dateKey === activeDate;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              aria-label={`${formatDateLabel(dateKey)}${dayEntries.length ? ` มี ${dayEntries.length} รายการ` : ""}`}
              className={`flex min-h-[52px] flex-col rounded-xl border p-1.5 text-left transition sm:min-h-[84px] sm:rounded-2xl sm:p-2 ${
                inCurrentMonth ? "border-white/10 bg-[#0f1725] text-slate-100" : "border-white/5 bg-slate-950/70 text-slate-500"
              } ${isSelected ? "ring-2 ring-reel" : "hover:border-reel/50"}`}
            >
              <span className="text-xs font-semibold sm:text-sm">{date.getDate()}</span>
              {dayEntries.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1 sm:mt-2">
                  {dayEntries.slice(0, 3).map((entry) => {
                    const style = getTopicStyle(entry.topic);
                    return (
                      <span
                        key={entry.id}
                        title={entry.topic}
                        className={`inline-flex w-fit items-center gap-1 rounded-full border px-1.5 py-1 text-[10px] font-semibold sm:px-2 sm:tracking-[0.2em] ${style.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        <span className="hidden sm:inline">{entry.topic}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">วันที่เลือก</p>
            <h4 className="mt-1 text-lg font-semibold text-white">{formatDateLabel(activeDate)}</h4>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100">
            {selectedEntries.length} รายการ
          </span>
        </div>

        {selectedEntries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-300">ยังไม่มีงานในวันที่นี้</p>
        ) : (
          <div className="mt-4 space-y-3">
            {selectedEntries.map((entry) => {
              const style = getTopicStyle(entry.topic);
              return (
                <div key={entry.id} className={`rounded-2xl border bg-slate-950/70 p-3 ${style.border}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${style.badge}`}>
                      {entry.topic}
                    </span>
                    <span className="text-sm text-slate-300">{entry.taskDescription}</span>
                  </div>
                  {entry.note ? <p className="mt-2 text-sm text-slate-400">{entry.note}</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

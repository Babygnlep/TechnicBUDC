"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Alert from "./ui/Alert";

interface WorkScheduleFormProps {
  onAdded?: () => void;
}

const TOPIC_OPTIONS = [
  { value: "LDC", label: "LDC" },
  { value: "CAMERASTORE", label: "CAMERASTORE" },
];

function formatGoogleCalendarDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}/${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
}

function buildGoogleCalendarLink(topic: string, task: string, date: string, note: string) {
  const title = `${topic} - ${task}`;
  const details = `หัวข้องาน: ${topic}\nงาน: ${task}${note ? `\nหมายเหตุ: ${note}` : ""}`;
  const dates = formatGoogleCalendarDate(date);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&dates=${dates}`;
}

export default function WorkScheduleForm({ onAdded }: WorkScheduleFormProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSchedule = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedTopic) {
      setFormError("กรุณาเลือกหัวข้องานก่อน");
      return;
    }

    if (!selectedDate) {
      setFormError("กรุณาเลือกวันที่ก่อน");
      return;
    }

    if (!taskDescription.trim()) {
      setFormError("กรุณาระบุว่างานนี้ทำอะไร");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          date: selectedDate,
          taskDescription,
          note,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      setSelectedDate("");
      setSelectedTopic("");
      setTaskDescription("");
      setNote("");
      setFormError("");
      onAdded?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[#0a111f]/95 p-6 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">ระบบงานเทคนิค</p>
          <h3 className="mt-2 text-2xl font-display text-white">ลงวันที่ลงงาน</h3>
        </div>
        <Link href="/schedule/list" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
          <span>ไปหน้ารายการ</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-reel text-xs font-semibold text-[#08141d]">↗</span>
        </Link>
      </div>

      <form onSubmit={handleAddSchedule} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="topic" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            หัวข้องาน <span className="text-reel">*</span>
          </label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
          >
            <option value="" className="text-slate-500">
              เลือกหัวข้องาน
            </option>
            {TOPIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="text-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input label="เลือกวันที่" name="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="taskDescription" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            งานที่ทำ <span className="text-reel">*</span>
          </label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows={3}
            placeholder="เช่น ควบคุมกล้อง หรือ จัดไฟ"
            className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="schedule-note" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            หมายเหตุ
          </label>
          <textarea
            id="schedule-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="เช่น พร้อมตลอดทั้งวัน หรือ มีเวลาคืน"
            className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
          />
        </div>

        {formError ? <Alert message={formError} onDismiss={() => setFormError("")} /> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" variant="primary" size="lg" disabled={isSaving}>
            {isSaving ? "กำลังบันทึก..." : "เพิ่มวันที่ลงงาน"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={!selectedTopic || !selectedDate || !taskDescription.trim()}
            onClick={() => {
              if (!selectedTopic || !selectedDate || !taskDescription.trim()) {
                setFormError("กรุณากรอกหัวข้อ วันที่ และงานก่อนเปิด Google Calendar");
                return;
              }
              window.open(buildGoogleCalendarLink(selectedTopic, taskDescription, selectedDate, note), "_blank");
            }}
          >
            เปิดใน Google Calendar
          </Button>
        </div>
      </form>
    </div>
  );
}

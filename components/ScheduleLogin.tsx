"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Alert from "./ui/Alert";
import Button from "./ui/Button";

interface ScheduleLoginProps {
  onAuthenticated: (role: "admin" | "user") => void;
}

interface SchedulePreviewEntry {
  id: string;
  topic: string;
  date: string;
  taskDescription: string;
  note: string;
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function getDaysUntil(dateValue: string) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const [year, month, day] = dateValue.split("-").map(Number);
  const workDate = new Date(year, month - 1, day).getTime();
  return Math.round((workDate - startOfToday) / 86_400_000);
}

function formatCountdown(dateValue: string) {
  const days = getDaysUntil(dateValue);
  if (days === 0) return "งานวันนี้";
  if (days === 1) return "เหลืออีก 1 วัน";
  if (days > 1) return `เหลืออีก ${days} วัน`;
  return `ผ่านมาแล้ว ${Math.abs(days)} วัน`;
}

export default function ScheduleLogin({ onAuthenticated }: ScheduleLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewEntries, setPreviewEntries] = useState<SchedulePreviewEntry[]>([]);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const response = await fetch("/api/schedule?preview=1", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result?.success) throw new Error(result?.message || "ไม่สามารถโหลดตัวอย่างงานได้");
        setPreviewEntries(result.entries ?? []);
      } catch {
        setPreviewError("ไม่สามารถโหลดตัวอย่างงานได้");
      }
    };

    void loadPreview();
  }, []);

  const upcomingPreviewEntries = useMemo(
    () => previewEntries
      .filter((entry) => getDaysUntil(entry.date) >= 0)
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(0, 5),
    [previewEntries]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/schedule/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "ไม่สามารถเข้าสู่ระบบได้");
      }
      setPassword("");
      onAuthenticated(result.role === "admin" ? "admin" : "user");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "ไม่สามารถเข้าสู่ระบบได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#09111e]/95 shadow-[0_35px_120px_-42px_rgba(0,0,0,0.9)]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-reel/10 blur-3xl" />
      <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-reel/30 bg-reel/10 text-lg text-reel">✦</span>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Technic BUDC</p>
          </div>
          <h2 className="mt-8 text-4xl font-display leading-none text-white sm:text-5xl">ตารางงาน<br /><span className="text-reel">ที่กำลังจะมาถึง</span></h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">เช็กวันงานและเตรียมตัวก่อนเข้าสู่ระบบจัดการตารางของทีม</p>

          <div className="mt-8 rounded-[1.35rem] border border-white/10 bg-[#050b14]/75 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Upcoming work</p>
              <span className="rounded-full border border-reel/20 bg-reel/10 px-3 py-1 text-xs font-semibold text-reel">{upcomingPreviewEntries.length} งาน</span>
            </div>
            {previewError ? (
              <p className="mt-4 text-sm text-slate-400">{previewError}</p>
            ) : upcomingPreviewEntries.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">ยังไม่มีงานที่ลงไว้</p>
            ) : (
              <div className="mt-2 divide-y divide-white/10">
                {upcomingPreviewEntries.map((entry) => (
                  <div key={entry.id} className="group flex items-center gap-3 py-3.5">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 text-center">
                      <span className="text-sm font-semibold leading-none text-white">{entry.date.slice(8, 10)}</span>
                      <span className="mt-1 text-[9px] uppercase tracking-wider text-slate-500">{entry.date.slice(5, 7)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{entry.taskDescription}</p>
                      <p className="mt-0.5 text-xs tracking-wide text-slate-400">{entry.topic} · {formatDateLabel(entry.date)}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-reel">{formatCountdown(entry.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-reel">Member access</p>
          <h3 className="mt-3 text-3xl font-display text-white">เข้าสู่ระบบ</h3>
          <p className="mt-2 text-sm text-slate-400">ใช้รหัสผ่านของทีมเพื่อจัดการหรือเลือกตำแหน่งงาน</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="schedule-password">
          รหัสผ่าน
          <input
            id="schedule-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="กรอกรหัสผ่านของคุณ"
            className="w-full rounded-xl border border-white/10 bg-[#050b14] px-4 py-3.5 text-base normal-case tracking-normal text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
          />
        </label>
        {error ? <Alert message={error} onDismiss={() => setError("")} /> : null}
        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
          เข้าสู่ระบบเพื่อดูตาราง
        </Button>
      </form>
          <p className="mt-5 text-center text-xs text-slate-500">เฉพาะสมาชิกทีม TECHNIC BUDC</p>
        </div>
      </div>
    </div>
  );
}

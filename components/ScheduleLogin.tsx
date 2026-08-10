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
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a111f]/95 p-5 shadow-[0_30px_120px_-45px_rgba(0,0,0,0.65)] sm:p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">ระบบงานเทคนิค</p>
      <h2 className="mt-2 text-3xl font-display text-white">เข้าสู่ระบบลงงาน</h2>
      <p className="mt-3 text-sm text-slate-300">กรอกรหัสผ่านของทีมเพื่อดูและบันทึกวันลงงาน</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#081222]/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">ตัวอย่างงานที่กำลังจะมาถึง</p>
          <span className="rounded-full bg-reel/10 px-3 py-1 text-xs text-reel">{upcomingPreviewEntries.length} งาน</span>
        </div>
        {previewError ? (
          <p className="mt-3 text-sm text-slate-400">{previewError}</p>
        ) : upcomingPreviewEntries.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">ยังไม่มีงานที่ลงไว้</p>
        ) : (
          <div className="mt-3 space-y-2">
            {upcomingPreviewEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatDateLabel(entry.date)} · {entry.topic}</p>
                    <p className="mt-1 text-sm text-slate-300">{entry.taskDescription}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-reel">{formatCountdown(entry.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="schedule-password">
          รหัสผ่าน
          <input
            id="schedule-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3.5 text-base normal-case tracking-normal text-white focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
          />
        </label>
        {error ? <Alert message={error} onDismiss={() => setError("")} /> : null}
        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
          เข้าสู่ระบบ
        </Button>
      </form>
    </div>
  );
}

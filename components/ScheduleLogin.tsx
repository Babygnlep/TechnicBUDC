"use client";

import { FormEvent, useState } from "react";
import Alert from "./ui/Alert";
import Button from "./ui/Button";

interface ScheduleLoginProps {
  onAuthenticated: (role: "admin" | "user") => void;
}

export default function ScheduleLogin({ onAuthenticated }: ScheduleLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

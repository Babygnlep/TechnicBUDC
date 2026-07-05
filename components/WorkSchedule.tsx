"use client";

import { FormEvent, useEffect, useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Alert from "./ui/Alert";
import WorkScheduleForm from "./WorkScheduleForm";
import WorkScheduleList from "./WorkScheduleList";

interface ScheduleEntry {
  id: string;
  topic: string;
  date: string;
  taskDescription: string;
  note: string;
  signers?: Array<{ name: string; role: string; signedAt: string }>;
  createdAt: string;
}

const TOPIC_OPTIONS = [
  { value: "LDC", label: "LDC" },
  { value: "CAMERASTORE", label: "CAMERASTORE" },
];

const ROLE_OPTIONS = [
  { value: "VIDEO", label: "VIDEO" },
  { value: "PHOTO", label: "PHOTO" },
  { value: "POSTVIDEO", label: "POSTVIDEO" },
  { value: "POSTPHOTO", label: "POSTPHOTO" },
  { value: "LIGHTING", label: "LIGHTING" },
  { value: "BEHIDE", label: "BEHIDE" },
  { value: "OTHER", label: "อื่นๆ" },
];

const DEMO_USERNAME = "technic";
const DEMO_PASSWORD = "budc2026";

function formatDateLabel(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function WorkSchedule() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [note, setNote] = useState("");
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [pendingSigners, setPendingSigners] = useState<Record<string, { name: string; role: string; roleOther?: string }>>({});

  useEffect(() => {
    const savedAuth = window.localStorage.getItem("work-schedule-auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }

    void fetchScheduleEntries();
  }, []);

  const fetchScheduleEntries = async () => {
    try {
      const response = await fetch("/api/schedule");
      const result = await response.json();
      if (result?.success) {
        setScheduleEntries(result.entries ?? []);
      }
    } catch {
      setScheduleEntries([]);
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
      window.localStorage.setItem("work-schedule-auth", "true");
    } else {
      setLoginError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setLoginError("");
    window.localStorage.removeItem("work-schedule-auth");
  };

  const handleAddSchedule = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedTopic) {
      setLoginError("กรุณาเลือกหัวข้องานก่อน");
      return;
    }

    if (!selectedDate) {
      setLoginError("กรุณาเลือกวันที่ก่อน");
      return;
    }

    if (!taskDescription.trim()) {
      setLoginError("กรุณาระบุว่างานนี้ทำอะไร");
      return;
    }

    try {
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

      await fetchScheduleEntries();
      setSelectedDate("");
      setSelectedTopic("");
      setTaskDescription("");
      setNote("");
      setLoginError("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/schedule?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถลบข้อมูลได้");
      }

      await fetchScheduleEntries();
    } catch {
      setLoginError("ไม่สามารถลบข้อมูลได้");
    }
  };

  return (
    <section id="schedule" className="bg-canvas px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl rounded-[2.2rem] border border-white/10 bg-[#080d18]/95 p-6 shadow-[0_30px_120px_-45px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-10">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-flex items-center justify-center rounded-full border border-reel/25 bg-reel/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#fff8d3]">
            งานเทคนิค
          </p>
          <h2 className="font-display text-4xl uppercase text-white md:text-5xl">
            ลงงานวันที่ในระบบงานเทคนิค
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
            สำหรับทีมที่ต้องการบันทึกวันที่และเวลาลงงานให้เป็นระบบที่แยกจากฟอร์มสมัครงาน
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="mx-auto max-w-xl rounded-[1.6rem] border border-white/10 bg-[#070d1b]/95 p-7 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.5)]">
            <h3 className="text-2xl font-display text-white">เข้าสู่ระบบงานเทคนิค</h3>
            <p className="mt-2 text-sm text-slate-300">
              ใช้ชื่อผู้ใช้และรหัสผ่าน demo ต่อไปนี้เพื่อเข้าสู่ระบบ
            </p>
            <div className="mt-3 rounded-2xl border border-reel/25 bg-white/5 px-4 py-3 text-sm text-reel">
              ชื่อผู้ใช้: <span className="font-semibold">{DEMO_USERNAME}</span> / รหัสผ่าน: <span className="font-semibold">{DEMO_PASSWORD}</span>
            </div>

            <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
              <Input
                label="ชื่อผู้ใช้"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
                autoComplete="username"
              />
              <Input
                label="รหัสผ่าน"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
              />

              {loginError ? <Alert message={loginError} onDismiss={() => setLoginError("")} /> : null}

              <Button type="submit" variant="primary" size="lg">
                เข้าสู่ระบบ
              </Button>
            </form>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-white/10 bg-[#0a111f]/95 p-6 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">ระบบงานเทคนิค</p>
                  <h3 className="mt-2 text-2xl font-display text-white">บันทึกวันที่ที่พร้อมทำงาน</h3>
                </div>
                <Button type="button" variant="outline" size="md" onClick={handleLogout}>
                  ออกจากระบบ
                </Button>
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
                <Input
                  label="เลือกวันที่"
                  name="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
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

                <Button type="submit" variant="primary" size="lg">
                  เพิ่มวันที่ลงงาน
                </Button>
              </form>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#101828] via-[#0b1220] to-[#020617] p-6 text-white shadow-[0_18px_60px_-30px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300">รายการงานเทคนิค</p>
                  <h3 className="mt-2 text-2xl font-display">วันที่ที่ลงไว้</h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100">
                  {scheduleEntries.length} วัน
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {scheduleEntries.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    ยังไม่มีวันที่ลงงานในระบบงานเทคนิคตอนนี้
                  </div>
                ) : (
                  scheduleEntries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">{formatDateLabel(entry.date)}</p>
                            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-100">
                              {entry.topic}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-200">
                            <span className="font-semibold">งานที่ทำ:</span> {entry.taskDescription}
                          </p>
                          {entry.signers && entry.signers.length > 0 ? (
                            <div className="mt-3 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                              <p className="text-sm text-slate-300">
                                <span className="font-semibold text-reel">รายชื่อผู้ลงชื่อ</span>
                              </p>
                              {Object.entries(
                                (entry.signers || []).reduce((groups: Record<string, Array<{ name: string; signedAt: string }>>, signer) => {
                                  groups[signer.role] = groups[signer.role] ?? [];
                                  groups[signer.role].push({ name: signer.name, signedAt: signer.signedAt });
                                  return groups;
                                }, {})
                              ).map(([role, signers]) => (
                                <div key={role} className="rounded-2xl border border-white/10 bg-slate-950/90 p-3">
                                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{role}</p>
                                  <div className="mt-2 space-y-2">
                                    {signers.map((signer) => (
                                      <div key={signer.signedAt} className="flex items-center justify-between gap-3 rounded-xl bg-[#0f1725] px-3 py-2">
                                        <p className="text-sm text-slate-300">{signer.name}</p>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            try {
                                              const response = await fetch("/api/schedule", {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                  id: entry.id,
                                                  action: "removeSigner",
                                                  signedAt: signer.signedAt,
                                                }),
                                              });
                                              const result = await response.json();
                                              if (!response.ok || !result?.success) {
                                                throw new Error(result?.message || "ไม่สามารถลบชื่อได้");
                                              }
                                              await fetchScheduleEntries();
                                            } catch (error) {
                                              setLoginError(error instanceof Error ? error.message : "ไม่สามารถลบชื่อได้");
                                            }
                                          }}
                                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:bg-red-500 hover:text-white"
                                        >
                                          ลบ
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                              <p className="text-sm text-slate-300">
                                <span className="font-semibold text-reel">ยังไม่มีชื่อทีมงานลงทะเบียน</span>
                              </p>
                            </div>
                          )}
                          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                            <p className="text-sm text-slate-300">
                              <span className="font-semibold">เพิ่มชื่อผู้ทำงาน</span>
                            </p>
                            <input
                              type="text"
                              value={pendingSigners[entry.id]?.name ?? ""}
                              onChange={(e) =>
                                setPendingSigners((prev) => ({
                                  ...prev,
                                  [entry.id]: {
                                    ...prev[entry.id],
                                    name: e.target.value,
                                  },
                                }))
                              }
                              placeholder="ชื่อผู้ลงชื่อ เช่น เบน"
                              className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
                            />
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                ตำแหน่ง
                              </label>
                              <select
                                value={pendingSigners[entry.id]?.role ?? ""}
                                onChange={(e) =>
                                  setPendingSigners((prev) => ({
                                    ...prev,
                                    [entry.id]: {
                                      ...prev[entry.id],
                                      role: e.target.value,
                                      roleOther: e.target.value === "OTHER" ? prev[entry.id]?.roleOther : undefined,
                                    },
                                  }))
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
                              >
                                <option value="" className="text-slate-500">
                                  เลือกตำแหน่ง
                                </option>
                                {ROLE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value} className="text-slate-900">
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {pendingSigners[entry.id]?.role === "OTHER" ? (
                              <input
                                type="text"
                                value={pendingSigners[entry.id]?.roleOther ?? ""}
                                onChange={(e) =>
                                  setPendingSigners((prev) => ({
                                    ...prev,
                                    [entry.id]: {
                                      ...prev[entry.id],
                                      roleOther: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="ระบุตำแหน่งอื่นๆ"
                                className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
                              />
                            ) : null}
                            <button
                              type="button"
                              onClick={async () => {
                                const signer = pendingSigners[entry.id];
                                const role = signer?.role === "OTHER" ? signer?.roleOther : signer?.role;
                                if (!signer?.name?.trim()) {
                                  setLoginError("กรุณากรอกชื่อผู้ลงชื่อ");
                                  return;
                                }
                                if (!role?.trim()) {
                                  setLoginError("กรุณาระบุหน้าที่หรือบทบาท");
                                  return;
                                }
                                try {
                                  const response = await fetch("/api/schedule", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      id: entry.id,
                                      name: signer.name,
                                      role,
                                    }),
                                  });
                                  const result = await response.json();
                                  if (!response.ok || !result?.success) {
                                    throw new Error(result?.message || "ไม่สามารถลงชื่อได้");
                                  }
                                  await fetchScheduleEntries();
                                  setPendingSigners((prev) => ({
                                    ...prev,
                                    [entry.id]: { name: "", role: "", roleOther: "", team: "", teamOther: "" },
                                  }));
                                } catch (error) {
                                  setLoginError(error instanceof Error ? error.message : "ไม่สามารถลงชื่อได้");
                                }
                              }}
                              className="rounded-full bg-reel px-4 py-3 text-sm font-semibold text-[#08141d] transition hover:bg-[#fff18a]"
                            >
                              เพิ่มชื่อทีมงาน
                            </button>
                          </div>
                          {entry.note ? (
                            <p className="mt-1 text-sm text-slate-400">{entry.note}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(entry.id)}
                          className="text-sm text-slate-300 transition hover:text-white"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

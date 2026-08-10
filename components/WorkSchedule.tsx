"use client";

import { FormEvent, useEffect, useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Alert from "./ui/Alert";
import WorkScheduleForm from "./WorkScheduleForm";
import WorkScheduleList from "./WorkScheduleList";
import CalendarView from "./CalendarView";
import ScheduleLogin from "./ScheduleLogin";

interface ScheduleEntry {
  id: string;
  topic: string;
  date: string;
  taskDescription: string;
  note: string;
  signers?: Array<{ name: string; role: string; signedAt: string }>;
  createdAt: string;
}

type ScheduleRole = "admin" | "user";

const TOPIC_OPTIONS = [
  { value: "LDC", label: "LDC" },
  { value: "CAMERASTORE", label: "CAMERASTORE" },
];

const ROLE_OPTIONS = [
  "PHOTO",
  "VIDEO",
  "POSTPHOTO",
  "POSTVIDEO",
  "RUNNER",
  "LIGHT",
  "PRODUCER",
  "HEAD PHOTO",
  "HEAD VIDEO",
  "HEAD POSTPHOTO",
  "HEAD POSTVIDEO",
  "HEAD RUNNER",
  "HEAD LIGHT",
  "HEAD PRODUCER",
];

function formatDateLabel(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function WorkSchedule() {
  const [loginError, setLoginError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [note, setNote] = useState("");
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [pendingSigners, setPendingSigners] = useState<Record<string, { name: string; role: string }>>({});
  const [editingSignerRoles, setEditingSignerRoles] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [role, setRole] = useState<ScheduleRole | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch("/api/schedule/auth", { cache: "no-store" });
        const result = await response.json();
        const authenticated = Boolean(response.ok && result?.authenticated);
        setIsAuthenticated(authenticated);
        setRole(result?.role === "admin" ? "admin" : authenticated ? "user" : null);
        if (authenticated) {
          await fetchScheduleEntries();
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    void checkAuthentication();
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

  const handleAuthenticated = async (authenticatedRole: ScheduleRole) => {
    setIsAuthenticated(true);
    setRole(authenticatedRole);
    await fetchScheduleEntries();
  };

  const handleLogout = async () => {
    await fetch("/api/schedule/auth", { method: "DELETE" });
    setScheduleEntries([]);
    setRole(null);
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <section id="schedule" className="bg-canvas px-3 py-20 sm:px-4 sm:py-24 md:px-6 md:py-32">
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a111f]/95 p-8 text-center text-slate-300">
          กำลังตรวจสอบสิทธิ์...
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section id="schedule" className="bg-canvas px-3 py-20 sm:px-4 sm:py-24 md:px-6 md:py-32">
        <ScheduleLogin onAuthenticated={(authenticatedRole) => void handleAuthenticated(authenticatedRole)} />
      </section>
    );
  }

  const isAdmin = role === "admin";
  const knownSignerNames = Array.from(
    new Set(scheduleEntries.flatMap((entry) => (entry.signers ?? []).map((signer) => signer.name.trim())).filter(Boolean))
  );

  return (
    <section id="schedule" className="bg-canvas px-3 py-20 sm:px-4 sm:py-24 md:px-6 md:py-32">
      <div className="mx-auto w-full max-w-5xl rounded-[2.2rem] border border-white/10 bg-[#080d18]/95 p-4 shadow-[0_30px_120px_-45px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-6 lg:p-10">
        <div className="mb-10 text-center">
          <div className="mb-5 flex justify-end">
            <span className="mr-3 rounded-full border border-reel/30 bg-reel/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-reel">
              {role === "admin" ? "Admin" : "User"}
            </span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              ออกจากระบบ
            </button>
          </div>
          <p className="mb-3 inline-flex items-center justify-center rounded-full border border-reel/25 bg-reel/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#fff8d3]">
            งานเทคนิค
          </p>
          <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            ลงงานวันที่ในระบบงานเทคนิค
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
            สำหรับทีมที่ต้องการบันทึกวันที่และเวลาลงงานให้เป็นระบบที่แยกจากฟอร์มสมัครงาน
          </p>
        </div>

        <div className={`grid gap-8 ${isAdmin ? "md:grid-cols-[1.1fr_0.9fr]" : ""}`}>
            {isAdmin ? <div className="rounded-[1.6rem] border border-white/10 bg-[#0a111f]/95 p-4 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">ระบบงานเทคนิค</p>
                  <h3 className="mt-2 text-2xl font-display text-white">บันทึกวันที่ที่พร้อมทำงาน</h3>
                </div>
              </div>

              <form onSubmit={handleAddSchedule} className="mt-6 flex flex-col gap-4">
                {loginError ? <Alert message={loginError} onDismiss={() => setLoginError("")} /> : null}
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
            </div> : null}

            <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#101828] via-[#0b1220] to-[#020617] p-4 text-white shadow-[0_18px_60px_-30px_rgba(0,0,0,0.65)] sm:p-6">
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
                {scheduleEntries.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    ยังไม่มีวันที่ลงงานในระบบงานเทคนิคตอนนี้
                  </div>
                )}

                {scheduleEntries.length > 0 &&
                  scheduleEntries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">{formatDateLabel(entry.date)}</p>
                            {isAdmin ? <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-100">
                              {entry.topic}
                            </span> : null}
                          </div>
                          <p className="mt-2 break-words text-sm text-slate-200">
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
                              ).map(([signerRole, signers]) => (
                                <div key={signerRole} className="rounded-2xl border border-white/10 bg-slate-950/90 p-3">
                                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{signerRole}</p>
                                  <div className="mt-2 space-y-2">
                                    {signers.map((signer) => (
                                      <div key={signer.signedAt} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0f1725] px-3 py-2">
                                        <p className="text-sm text-slate-300">{signer.name}</p>
                                        {isAdmin && editingSignerRoles[`${entry.id}:${signer.signedAt}`] !== undefined ? (
                                          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                            <select
                                              value={editingSignerRoles[`${entry.id}:${signer.signedAt}`]}
                                              onChange={(event) => setEditingSignerRoles((prev) => ({ ...prev, [`${entry.id}:${signer.signedAt}`]: event.target.value }))}
                                              aria-label={`ตำแหน่งของ ${signer.name}`}
                                              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white sm:w-40"
                                            >
                                              {ROLE_OPTIONS.map((roleOption) => <option key={roleOption} value={roleOption} className="text-slate-900">{roleOption}</option>)}
                                            </select>
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                const key = `${entry.id}:${signer.signedAt}`;
                                                const updatedRole = editingSignerRoles[key]?.trim();
                                                if (!updatedRole) {
                                                  setLoginError("กรุณาระบุตำแหน่ง");
                                                  return;
                                                }
                                                try {
                                                  const response = await fetch("/api/schedule", {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ id: entry.id, action: "updateSignerRole", signedAt: signer.signedAt, role: updatedRole }),
                                                  });
                                                  const result = await response.json();
                                                  if (!response.ok || !result?.success) throw new Error(result?.message || "ไม่สามารถแก้ไขตำแหน่งได้");
                                                  setEditingSignerRoles((prev) => {
                                                    const next = { ...prev };
                                                    delete next[key];
                                                    return next;
                                                  });
                                                  await fetchScheduleEntries();
                                                } catch (error) {
                                                  setLoginError(error instanceof Error ? error.message : "ไม่สามารถแก้ไขตำแหน่งได้");
                                                }
                                              }}
                                              className="rounded-full bg-reel px-3 py-2 text-xs font-semibold text-[#08141d]"
                                            >บันทึก</button>
                                            <button type="button" onClick={() => setEditingSignerRoles((prev) => { const next = { ...prev }; delete next[`${entry.id}:${signer.signedAt}`]; return next; })} className="text-xs text-slate-300">ยกเลิก</button>
                                          </div>
                                        ) : isAdmin ? (
                                          <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => setEditingSignerRoles((prev) => ({ ...prev, [`${entry.id}:${signer.signedAt}`]: signerRole }))} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10">แก้ไขตำแหน่ง</button>
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  const response = await fetch("/api/schedule", {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ id: entry.id, action: "removeSigner", signedAt: signer.signedAt }),
                                                  });
                                                  const result = await response.json();
                                                  if (!response.ok || !result?.success) throw new Error(result?.message || "ไม่สามารถลบชื่อได้");
                                                  await fetchScheduleEntries();
                                                } catch (error) {
                                                  setLoginError(error instanceof Error ? error.message : "ไม่สามารถลบชื่อได้");
                                                }
                                              }}
                                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:bg-red-500 hover:text-white"
                                            >ลบ</button>
                                          </div>
                                        ) : (
                                          <span className="text-sm text-slate-400">{signerRole}</span>
                                        )}
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
                              <span className="font-semibold">{isAdmin ? "กำหนดผู้รับผิดชอบ" : "กรอกชื่อและตำแหน่งของคุณ"}</span>
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
                              list={isAdmin ? "known-signer-names" : undefined}
                              placeholder={isAdmin ? "เลือกหรือพิมพ์ชื่อผู้รับผิดชอบ" : "ชื่อผู้ลงชื่อ เช่น เบน"}
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
                                    },
                                  }))
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
                              >
                                <option value="" className="text-slate-500">เลือกตำแหน่ง</option>
                                {ROLE_OPTIONS.map((roleOption) => <option key={roleOption} value={roleOption} className="text-slate-900">{roleOption}</option>)}
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                const signer = pendingSigners[entry.id];
                                const signerRole = signer?.role;
                                if (!signer?.name?.trim()) {
                                  setLoginError("กรุณากรอกชื่อผู้ลงชื่อ");
                                  return;
                                }
                                if (!signerRole?.trim()) {
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
                                      role: signerRole,
                                    }),
                                  });
                                  const result = await response.json();
                                  if (!response.ok || !result?.success) {
                                    throw new Error(result?.message || "ไม่สามารถลงชื่อได้");
                                  }
                                  await fetchScheduleEntries();
                                  setPendingSigners((prev) => ({
                                    ...prev,
                                    [entry.id]: { name: "", role: "" },
                                  }));
                                } catch (error) {
                                  setLoginError(error instanceof Error ? error.message : "ไม่สามารถลงชื่อได้");
                                }
                              }}
                              className="rounded-full bg-reel px-4 py-3 text-sm font-semibold text-[#08141d] transition hover:bg-[#fff18a]"
                            >
                              {isAdmin ? "เพิ่มชื่อทีมงาน" : "ลงชื่อ"}
                            </button>
                          </div>
                          {isAdmin && entry.note ? (
                            <p className="mt-1 text-sm text-slate-400">{entry.note}</p>
                          ) : null}
                        </div>
                        {isAdmin ? <button
                          type="button"
                          onClick={() => handleRemove(entry.id)}
                          className="shrink-0 rounded-full px-2 py-1 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                          ลบ
                        </button> : null}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {isAdmin && knownSignerNames.length > 0 ? (
            <datalist id="known-signer-names">
              {knownSignerNames.map((name) => <option key={name} value={name} />)}
            </datalist>
          ) : null}

          <div className="mt-8">
            <CalendarView entries={scheduleEntries} />
          </div>
      </div>
    </section>
  );
}

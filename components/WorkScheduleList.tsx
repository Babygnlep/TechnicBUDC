"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "./ui/Button";
import Alert from "./ui/Alert";
import Modal from "./ui/Modal";

interface ScheduleEntry {
  id: string;
  topic: string;
  date: string;
  taskDescription: string;
  note: string;
  signers?: Array<{ name: string; role: string; signedAt: string }>;
  createdAt: string;
}

function formatDateLabel(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatGoogleCalendarDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}/${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
}

function buildGoogleCalendarLink(entry: ScheduleEntry) {
  const title = `${entry.topic} - ${entry.taskDescription}`;
  const details = `หัวข้องาน: ${entry.topic}\nงาน: ${entry.taskDescription}${entry.note ? `\nหมายเหตุ: ${entry.note}` : ""}`;
  const dates = formatGoogleCalendarDate(entry.date);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&dates=${dates}`;
}

export default function WorkScheduleList() {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [error, setError] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    void fetchScheduleEntries();
  }, []);

  const fetchScheduleEntries = async () => {
    try {
      const response = await fetch("/api/schedule");
      const result = await response.json();
      if (result?.success) {
        setScheduleEntries(result.entries ?? []);
      } else {
        setError(result?.message || "ไม่สามารถโหลดข้อมูลได้");
      }
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
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
      setConfirmDeleteId(null);
    } catch {
      setError("ไม่สามารถลบข้อมูลได้");
      setConfirmDeleteId(null);
    }
  };

  const filteredEntries = useMemo(() => {
    return scheduleEntries.filter((entry) => {
      const matchesTopic = filterTopic ? entry.topic === filterTopic : true;
      const matchesDate = filterDate ? entry.date === filterDate : true;
      return matchesTopic && matchesDate;
    });
  }, [scheduleEntries, filterTopic, filterDate]);

  return (
    <div className="mx-auto max-w-5xl rounded-[2.2rem] border border-white/10 bg-[#090f1a]/95 p-6 shadow-[0_30px_120px_-45px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-10">
      <div className="flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-[#0a111f]/95 p-6 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">หน้าแยกงานที่ลงไว้</p>
            <h2 className="mt-2 text-3xl font-display text-white">รายการงานที่ลงไว้</h2>
          </div>
          <span className="rounded-full bg-reel/10 px-4 py-2 text-sm uppercase tracking-[0.25em] text-reel">
            รวม {scheduleEntries.length} งาน
          </span>
        </div>

        {error ? <Alert message={error} onDismiss={() => setError("")} /> : null}

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#081222]/90 p-4 text-sm text-slate-300">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.35em] text-slate-400">กรองหัวข้องาน</label>
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
              >
                <option value="">ทุกหัวข้อ</option>
                {[...new Set(scheduleEntries.map((entry) => entry.topic))].map((topic) => (
                  <option key={topic} value={topic} className="text-slate-900">
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.35em] text-slate-400">กรองวันที่</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel"
              />
            </div>
          </div>
          {(filterTopic || filterDate) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#050b14]/95 px-4 py-3 text-sm text-slate-300">
              <p>
                กรองตาม: {filterTopic ? `หัวข้องาน ${filterTopic}` : "ทุกหัวข้อ"}
                {filterDate ? ` | วันที่ ${formatDateLabel(filterDate)}` : ""}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterTopic("");
                  setFilterDate("");
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-200 transition hover:bg-white/10"
              >
                ล้างกรอง
              </button>
            </div>
          )}
        </div>

        {scheduleEntries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            ยังไม่มีงานลงไว้ในระบบ
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            ไม่มีงานตามตัวกรองนี้
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="rounded-[1.6rem] border border-white/10 bg-[#0a1220]/95 p-6 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                      {formatDateLabel(entry.date)} • {entry.topic}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{entry.taskDescription}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={buildGoogleCalendarLink(entry)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-reel/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-reel transition hover:bg-reel/20 hover:text-white"
                    >
                      เปิดใน Google Calendar
                    </a>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(entry.id)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-200 transition hover:bg-red-500 hover:text-white"
                    >
                      ลบงาน
                    </button>
                  </div>
                </div>

                {entry.signers && entry.signers.length > 0 ? (
                  <div className="mt-6 rounded-2xl bg-[#091122] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">รายชื่อผู้ลงชื่อ</p>
                    <div className="mt-3 space-y-3">
                      {Object.entries(
                        (entry.signers || []).reduce((groups: Record<string, Array<{ name: string; signedAt: string }>>, signer) => {
                          groups[signer.role] = groups[signer.role] ?? [];
                          groups[signer.role].push({ name: signer.name, signedAt: signer.signedAt });
                          return groups;
                        }, {})
                      ).map(([role, signers]) => (
                        <div key={role} className="rounded-2xl border border-white/10 bg-slate-950/90 p-3">
                          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{role}</p>
                          <div className="mt-2 space-y-2">
                            {signers.map((signer) => (
                              <div key={signer.signedAt} className="flex items-center justify-between gap-3 rounded-xl bg-[#0f1725] px-3 py-2">
                                <p className="text-sm text-slate-200">{signer.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-[#091122] p-4 text-sm text-slate-300">
                    ยังไม่มีผู้ลงชื่อในงานนี้
                  </div>
                )}

                {entry.note ? (
                  <p className="mt-4 text-sm text-slate-400">หมายเหตุ: {entry.note}</p>
                ) : null}
              </div>
            ))}
          </div>

          <Modal
            isOpen={confirmDeleteId !== null}
            onClose={() => setConfirmDeleteId(null)}
            title="ยืนยันการลบ"
          >
            <p className="text-sm text-slate-200">
              คุณแน่ใจหรือไม่ว่าจะลบงานนี้? หากลบแล้วจะไม่สามารถกู้คืนได้
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="danger"
                className="w-full sm:w-auto"
                onClick={() => confirmDeleteId && void handleRemove(confirmDeleteId)}
              >
                ลบเลย
              </Button>
              <Button
                variant="dark"
                className="w-full sm:w-auto"
                onClick={() => setConfirmDeleteId(null)}
              >
                ยกเลิก
              </Button>
            </div>
          </Modal>
        </>
        )}
      </div>
    </div>
  );
}

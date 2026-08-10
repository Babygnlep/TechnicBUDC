"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import ScheduleLogin from "./ScheduleLogin";

type Role = "admin" | "user";
type Status = "present" | "absent" | "leave";
interface Member { id: string; name: string; status: Status | null; leaveReason: string }

const STATUS: Record<Status, { label: string; active: string }> = {
  present: { label: "มา", active: "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" },
  absent: { label: "ขาด", active: "border-red-400/50 bg-red-400/15 text-red-200" },
  leave: { label: "ลา", active: "border-amber-300/50 bg-amber-300/15 text-amber-100" },
};

function localDate() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }
function thaiDate(date: string) { return new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }

export default function AttendanceBoard() {
  const [role, setRole] = useState<Role | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [date, setDate] = useState(localDate());
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (targetDate = date) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/attendance?date=${targetDate}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "ไม่สามารถโหลดรายชื่อได้");
      setMembers(data.members ?? []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "ไม่สามารถโหลดรายชื่อได้"); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => {
    const check = async () => {
      const response = await fetch("/api/schedule/auth", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data?.authenticated) { setRole(data.role === "admin" ? "admin" : "user"); await load(); }
      else { setRole(null); setLoading(false); }
    };
    void check();
  }, [load]);

  const totals = useMemo(() => ({
    present: members.filter((member) => member.status === "present").length,
    absent: members.filter((member) => member.status === "absent").length,
    leave: members.filter((member) => member.status === "leave").length,
  }), [members]);

  const updateStatus = async (member: Member, status: Status) => {
    const leaveReason = status === "leave" ? window.prompt(`เหตุผลการลาของ ${member.name}`, member.leaveReason) : "";
    if (status === "leave" && leaveReason === null) return;
    try {
      const response = await fetch("/api/attendance", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, memberId: member.id, status, leaveReason }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "บันทึกไม่สำเร็จ");
      await load();
    } catch (updateError) { setError(updateError instanceof Error ? updateError.message : "บันทึกไม่สำเร็จ"); }
  };

  const addMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      const response = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "เพิ่มชื่อไม่สำเร็จ");
      setName(""); await load();
    } catch (addError) { setError(addError instanceof Error ? addError.message : "เพิ่มชื่อไม่สำเร็จ"); }
  };

  if (role === null && !loading) return <ScheduleLogin onAuthenticated={(newRole) => { setRole(newRole); void load(); }} />;
  if (loading && role === null) return <div className="rounded-3xl border border-white/10 bg-[#0a111f] p-8 text-center text-slate-300">กำลังเปิดระบบเช็กชื่อ...</div>;

  return <div className="mx-auto w-full max-w-5xl rounded-[2rem] border border-white/10 bg-[#080d18]/90 p-5 shadow-[0_30px_100px_-45px_rgba(0,0,0,.85)] sm:p-8">
    <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[.3em] text-reel">Daily attendance</p><h1 className="mt-2 text-4xl font-display text-white">เช็กชื่อวันนี้</h1><p className="mt-2 text-sm text-slate-400">{thaiDate(date)}</p></div>
      <div className="flex items-center gap-3"><input type="date" value={date} onChange={(event) => { setDate(event.target.value); void load(event.target.value); }} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" /><span className="rounded-full border border-reel/30 bg-reel/10 px-3 py-2 text-xs font-semibold text-reel">{role === "admin" ? "ADMIN" : "USER"}</span></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {(["present", "absent", "leave"] as Status[]).map((status) => <div key={status} className={`rounded-2xl border p-4 ${STATUS[status].active}`}><p className="text-xs uppercase tracking-[.2em] opacity-75">{STATUS[status].label}</p><p className="mt-1 text-3xl font-display">{totals[status]}</p></div>)}
    </div>
    {role === "admin" && <form onSubmit={addMember} className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="เพิ่มชื่อสมาชิก" className="min-w-0 flex-1 bg-transparent px-3 text-white placeholder:text-slate-500 outline-none" /><Button type="submit" size="md">เพิ่มชื่อ</Button></form>}
    {error && <div className="mt-5"><Alert message={error} onDismiss={() => setError("")} /></div>}
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
      {members.length === 0 ? <p className="p-8 text-center text-sm text-slate-400">ยังไม่มีรายชื่อสมาชิก</p> : members.map((member) => <div key={member.id} className="border-b border-white/10 bg-[#0a111f] p-4 last:border-0 sm:flex sm:items-center sm:justify-between"><div><p className="font-semibold text-white">{member.name}</p>{member.status === "leave" && member.leaveReason ? <p className="mt-1 text-sm text-amber-200">ลา: {member.leaveReason}</p> : <p className="mt-1 text-xs text-slate-500">{member.status ? STATUS[member.status].label : "ยังไม่เช็กชื่อ"}</p>}</div>{role === "admin" && <div className="mt-3 flex gap-2 sm:mt-0">{(["present", "absent", "leave"] as Status[]).map((status) => <button key={status} type="button" onClick={() => void updateStatus(member, status)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${member.status === status ? STATUS[status].active : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>{STATUS[status].label}</button>)}</div>}</div>)}
    </div>
  </div>;
}

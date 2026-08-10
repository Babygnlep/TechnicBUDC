"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import ScheduleLogin from "./ScheduleLogin";

type Role = "admin" | "user";
type Status = "present" | "absent" | "leave";
interface Member { id: string; name: string; cohort: string; status: Status | null; leaveReason: string }

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
  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [cohort, setCohort] = useState("20");
  const [checkerName, setCheckerName] = useState("");
  const [checkerCohort, setCheckerCohort] = useState("20");
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
    if (!checkerName.trim()) { setError("กรุณากรอกชื่อเล่นของผู้เช็กชื่อก่อน"); return; }
    const leaveReason = status === "leave" ? window.prompt(`เหตุผลการลาของ ${member.name}`, member.leaveReason) : "";
    if (status === "leave" && leaveReason === null) return;
    try {
      const response = await fetch("/api/attendance", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, memberId: member.id, status, leaveReason, checkedBy: checkerName, checkedCohort: checkerCohort }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "บันทึกไม่สำเร็จ");
      await load();
    } catch (updateError) { setError(updateError instanceof Error ? updateError.message : "บันทึกไม่สำเร็จ"); }
  };

  const clearStatus = async (member: Member) => {
    if (!confirm(`ยกเลิกสถานะเช็กชื่อของ ${member.name} ใช่หรือไม่?`)) return;
    try {
      const response = await fetch("/api/attendance", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, memberId: member.id }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "ยกเลิกสถานะไม่สำเร็จ");
      await load();
    } catch (clearError) { setError(clearError instanceof Error ? clearError.message : "ยกเลิกสถานะไม่สำเร็จ"); }
  };

  const addMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !nickname.trim()) { setError("กรุณากรอกทั้งชื่อจริงและชื่อเล่น"); return; }
    try {
      const name = `${firstName.trim()} (${nickname.trim()})`;
      const response = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, cohort }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "เพิ่มชื่อไม่สำเร็จ");
      setFirstName(""); setNickname(""); await load();
    } catch (addError) { setError(addError instanceof Error ? addError.message : "เพิ่มชื่อไม่สำเร็จ"); }
  };

  const logout = async () => {
    await fetch("/api/schedule/auth", { method: "DELETE" });
    setMembers([]);
    setRole(null);
  };

  const exportPdf = () => {
    document.title = `เช็กชื่อ-${date}`;
    window.print();
  };

  if (role === null && !loading) return <ScheduleLogin onAuthenticated={(newRole) => { setRole(newRole); void load(); }} />;
  if (loading && role === null) return <div className="rounded-3xl border border-white/10 bg-[#0a111f] p-8 text-center text-slate-300">กำลังเปิดระบบเช็กชื่อ...</div>;

  return <div className="mx-auto w-full max-w-5xl rounded-[2rem] border border-white/10 bg-[#080d18]/90 p-5 shadow-[0_30px_100px_-45px_rgba(0,0,0,.85)] sm:p-8">
    <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[.3em] text-reel">Daily attendance</p><h1 className="mt-2 text-4xl font-display text-white">เช็กชื่อวันนี้</h1><p className="mt-2 text-sm text-slate-400">{thaiDate(date)}</p></div>
      <div className="flex flex-wrap items-center gap-2"><input type="date" value={date} onChange={(event) => { setDate(event.target.value); void load(event.target.value); }} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" /><span className="rounded-full border border-reel/30 bg-reel/10 px-3 py-2 text-xs font-semibold text-reel">{role === "admin" ? "ADMIN" : "USER"}</span><button type="button" onClick={() => void logout()} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">ออกจากระบบ</button></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {(["present", "absent", "leave"] as Status[]).map((status) => <div key={status} className={`rounded-2xl border p-4 ${STATUS[status].active}`}><p className="text-xs uppercase tracking-[.2em] opacity-75">{STATUS[status].label}</p><p className="mt-1 text-3xl font-display">{totals[status]}</p></div>)}
    </div>
    <div className="mt-6 rounded-2xl border border-reel/25 bg-reel/[0.06] p-4 sm:flex sm:items-end sm:justify-between sm:gap-4"><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-[.25em] text-reel">ผู้เช็กชื่อ</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={checkerName} onChange={(event) => setCheckerName(event.target.value)} placeholder="ชื่อเล่นผู้เช็กชื่อ *" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500" /><select value={checkerCohort} onChange={(event) => setCheckerCohort(event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white"><option value="20">เช็กรุ่น 20</option><option value="19">เช็กรุ่น 19</option><option value="ทุกคน">เช็กทุกรุ่น</option></select></div><p className="mt-2 text-xs text-slate-400">กรอกก่อนกด มา / ขาด / ลา เพื่อยืนยันผู้รับผิดชอบการเช็กชื่อ</p></div><button type="button" onClick={exportPdf} className="mt-4 shrink-0 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/15 sm:mt-0">ส่งออก PDF</button></div>
    {role === "admin" && <form onSubmit={addMember} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_1fr_auto_auto]"><input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="ชื่อจริง *" className="min-w-0 rounded-xl bg-transparent px-3 py-2 text-white placeholder:text-slate-500 outline-none" /><input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="ชื่อเล่น *" className="min-w-0 rounded-xl bg-transparent px-3 py-2 text-white placeholder:text-slate-500 outline-none" /><select value={cohort} onChange={(event) => setCohort(event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"><option value="20">รุ่น 20</option><option value="19">รุ่น 19</option><option value="ยังไม่ระบุ">ไม่ระบุรุ่น</option></select><Button type="submit" size="md">เพิ่มชื่อ</Button></form>}
    {error && <div className="mt-5"><Alert message={error} onDismiss={() => setError("")} /></div>}
    <div id="attendance-report" className="mt-6 grid gap-6 lg:grid-cols-2">
      {members.length === 0 ? <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-400 lg:col-span-2">ยังไม่มีรายชื่อสมาชิก</p> : Object.entries(members.reduce((groups: Record<string, Member[]>, member) => { (groups[member.cohort] ??= []).push(member); return groups; }, {})).sort(([left], [right]) => right.localeCompare(left)).map(([memberCohort, cohortMembers]) => <section key={memberCohort} className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0a111f] shadow-[0_18px_45px_-32px_rgba(0,0,0,.9)]"><div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-reel/15 to-transparent px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[.28em] text-reel">Technic cohort</p><h2 className="mt-1 text-2xl font-display text-white">รุ่น {memberCohort}</h2></div><span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">{cohortMembers.length} คน</span></div><div className="divide-y divide-white/10">{cohortMembers.map((member) => <div key={member.id} className="p-4 transition hover:bg-white/[0.025]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{member.name}</p>{member.status === "leave" && member.leaveReason ? <p className="mt-1 text-sm text-amber-200">ลา: {member.leaveReason}</p> : <p className="mt-1 text-xs text-slate-500">{member.status ? `สถานะ: ${STATUS[member.status].label}` : "รอเช็กชื่อ"}</p>}</div>{member.status ? <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS[member.status].active}`}>{STATUS[member.status].label}</span> : null}</div><div className="mt-3 grid grid-cols-4 gap-2">{(["present", "absent", "leave"] as Status[]).map((status) => <button key={status} type="button" onClick={() => void updateStatus(member, status)} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${member.status === status ? STATUS[status].active : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10"}`}>{STATUS[status].label}</button>)}<button type="button" disabled={!member.status} onClick={() => void clearStatus(member)} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-slate-300 disabled:opacity-35">ยกเลิก</button></div></div>)}</div></section>)}
    </div>
  </div>;
}

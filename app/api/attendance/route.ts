import { NextResponse } from "next/server";
import { addAttendanceMember, clearAttendance, getAttendance, seedPdfRoster, setAttendance, type AttendanceStatus } from "@/lib/attendance-store";
import { getScheduleRoleFromSession, getScheduleSessionFromRequest } from "@/lib/schedule-auth";

function roleFor(request: Request) {
  return getScheduleRoleFromSession(getScheduleSessionFromRequest(request));
}

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  if (!roleFor(request)) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" }, { status: 401 });
  try {
    const date = new URL(request.url).searchParams.get("date") || today();
    await seedPdfRoster();
    const members = await getAttendance(date);
    return NextResponse.json({ success: true, date, members });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (roleFor(request) !== "admin") return NextResponse.json({ success: false, message: "เฉพาะ Admin เท่านั้น" }, { status: 403 });
  try {
    const { name, cohort } = await request.json();
    if (typeof name !== "string" || !name.trim()) return NextResponse.json({ success: false, message: "กรุณากรอกชื่อ" }, { status: 400 });
    await addAttendanceMember(name, typeof cohort === "string" ? cohort : undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!roleFor(request)) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" }, { status: 401 });
  try {
    const { date, memberId, status, leaveReason, checkedBy, checkedCohort } = await request.json();
    if (typeof memberId !== "string" || !["present", "absent", "leave"].includes(status)) return NextResponse.json({ success: false, message: "ข้อมูลเช็กชื่อไม่ถูกต้อง" }, { status: 400 });
    if (typeof checkedBy !== "string" || !checkedBy.trim()) return NextResponse.json({ success: false, message: "กรุณาระบุผู้เช็กชื่อ" }, { status: 400 });
    await setAttendance(typeof date === "string" ? date : today(), memberId, status as AttendanceStatus, typeof leaveReason === "string" ? leaveReason : "", checkedBy, typeof checkedCohort === "string" ? checkedCohort : "");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!roleFor(request)) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" }, { status: 401 });
  try {
    const { date, memberId } = await request.json();
    if (typeof memberId !== "string") return NextResponse.json({ success: false, message: "ไม่พบรายชื่อ" }, { status: 400 });
    await clearAttendance(typeof date === "string" ? date : today(), memberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

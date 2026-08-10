import { pool } from "./postgres";

export type AttendanceStatus = "present" | "absent" | "leave";

export interface AttendanceMember {
  id: string;
  name: string;
  status: AttendanceStatus | null;
  leaveReason: string;
}

function requireDatabase() {
  if (!pool) throw new Error("ยังไม่ได้ตั้งค่าฐานข้อมูลถาวร กรุณาตั้ง POSTGRES_URL หรือ DATABASE_URL ก่อนบันทึกข้อมูล");
  return pool;
}

async function initAttendanceTables() {
  const database = requireDatabase();
  await database.query(`
    CREATE TABLE IF NOT EXISTS attendance_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attendance_records (
      member_id TEXT NOT NULL REFERENCES attendance_members(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
      leave_reason TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      PRIMARY KEY (member_id, date)
    );
  `);
}

export async function getAttendance(date: string): Promise<AttendanceMember[]> {
  const database = requireDatabase();
  await initAttendanceTables();
  const { rows } = await database.query<{ id: string; name: string; status: AttendanceStatus | null; leaveReason: string }>(`
    SELECT m.id, m.name, r.status, COALESCE(r.leave_reason, '') AS "leaveReason"
    FROM attendance_members m
    LEFT JOIN attendance_records r ON r.member_id = m.id AND r.date = $1
    ORDER BY m.name ASC
  `, [date]);
  return rows;
}

export async function addAttendanceMember(name: string) {
  const database = requireDatabase();
  await initAttendanceTables();
  const id = `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await database.query(`INSERT INTO attendance_members (id, name, created_at) VALUES ($1, $2, $3)`, [id, name.trim(), new Date().toISOString()]);
}

export async function setAttendance(date: string, memberId: string, status: AttendanceStatus, leaveReason: string) {
  const database = requireDatabase();
  await initAttendanceTables();
  await database.query(`
    INSERT INTO attendance_records (member_id, date, status, leave_reason, updated_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (member_id, date) DO UPDATE SET status = EXCLUDED.status, leave_reason = EXCLUDED.leave_reason, updated_at = EXCLUDED.updated_at
  `, [memberId, date, status, status === "leave" ? leaveReason.trim() : "", new Date().toISOString()]);
}

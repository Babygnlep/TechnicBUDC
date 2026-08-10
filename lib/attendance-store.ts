import { pool } from "./postgres";

export type AttendanceStatus = "present" | "absent" | "leave";

export interface AttendanceMember {
  id: string;
  name: string;
  cohort: string;
  status: AttendanceStatus | null;
  leaveReason: string;
}

const PDF_ROSTER = [
  ["19", "สหัสวรรษ เพ็งผาย (สปาย)"], ["19", "อชิรวิชญ์ สัปคง (อชิ)"], ["19", "ภานุพงศ์ เปรมกิจไพบูลย์ (เปรม)"], ["19", "ขวัญพริษฐ์ ศรีวิจิตรวรกุล (บูเก้)"], ["19", "บุณยภา สิทธิหาญ (นวย)"], ["19", "ศิริภัสสร ฤทธิ์ประเสริฐ (น้ำมนต์)"], ["19", "อาวินเดอร์ ซิงห์ เดชเดชาชาญ (คริส)"], ["19", "กษิดิ์เดช ทองเหลี่ยม (เบย์)"], ["19", "วรภัทร พลยานันท์ (ไผ่)"], ["19", "วีริศ ทูสรานนท์ (รถจี๊ป)"], ["19", "ปัญญาวุฒิ เย็นชัยสิทธิ์ (เฟิร์ส)"], ["19", "นภสร อาภานันท์ (เฟียส)"], ["19", "เศรษฐนันท์ เสฏฐวิวรรธ์ (ซี)"], ["19", "แทนไท อนุวงค์ (เดียโก้)"], ["19", "วีรวิทย์ แก้วเจริญ (ฟิล์ม)"], ["19", "ณัฐกมล ภัทราดูลย์ (โคนัท)"], ["19", "อุ่นเรือน ไชยวงศ์ (อาเล็ก)"], ["19", "นันท์นภัส พิมพ์ภักดิ์ (เบสท์)"], ["19", "พิมพ์ลพัส พันลูกท้าว (พิมพ์)"], ["19", "กุลชา จันทร์แจ่ม (เอ็มกุล)"], ["19", "ณัฐภัสสร สิทธิกรจิรัชยา (เนย)"], ["19", "เพ็ญพิชชา ทองทับ (ไอเดีย)"], ["19", "สุพิชญา ปัญจวัฒนากุล (น้ำขิง)"], ["19", "วรรณพร กอขันธ์ (หลิงหลิง)"], ["19", "ปุญญพัฒน์ กองบุญ (ภูมิ)"], ["19", "มงคล ดีพร้อมทรัพย์ (มง)"], ["19", "กิตติธัช กิ่งแก้ว (ปอนด์)"], ["19", "ธนกร ใจกุม (บิ๊ก)"],
  ["20", "อชิรวิทย์ รัชนีลัดดาจิต (อชิ)"], ["20", "พิรชัช ลิมปนาธาร (ชัช)"], ["20", "ปราบดา แดนเขตร (ป้าง)"], ["20", "อภิวิชญ์ แสนจิตตธัม (โต๋)"], ["20", "สรชัช อินชูใจ (ภูมิ)"], ["20", "อัจฉริญา สุมานาท (ลิน)"], ["20", "นันท์นภัส อ่อนยนต์ (แบมเบ้บ)"], ["20", "อัฐภิญญา นามมลตรี (ไอซ์)"], ["20", "กนกกาญ พุ่มพระครูถิ่น (บีม)"], ["20", "ธีร์รัฐ เมธีชัยธนบูรณ์ (พิมพ์เพชร)"], ["20", "พิพัฒน์ กัลยาวัฒนเจริญ (บอสชูเกส)"], ["20", "พงศกร กฤษณะ (พี)"], ["20", "มณฑิตา ไชยดำ (มิ้น)"], ["20", "ณัฐวุฒิ ประสมศรี (ตี้)"], ["20", "กีรติยา นิมุสา (จีเนียร์)"], ["20", "พรธีรา โหงษา (น้ำหวาน)"], ["20", "พิมพ์พร เรืองสุรัตน์ (พิมพ์)"], ["20", "ฐิติศักดิ์ มาลาศรี (ขิง)"], ["20", "ภิณญาภัค ผลศรัทธา (อิ้ง)"], ["20", "ธนภูมิ แก้วเจ๊ย (ขลุ่ย)"],
] as const;

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
      cohort TEXT NOT NULL DEFAULT 'ยังไม่ระบุ',
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
  await database.query(`ALTER TABLE attendance_members ADD COLUMN IF NOT EXISTS cohort TEXT NOT NULL DEFAULT 'ยังไม่ระบุ'`);
}

export async function getAttendance(date: string): Promise<AttendanceMember[]> {
  const database = requireDatabase();
  await initAttendanceTables();
  const { rows } = await database.query<{ id: string; name: string; cohort: string; status: AttendanceStatus | null; leaveReason: string }>(`
    SELECT m.id, m.name, m.cohort, r.status, COALESCE(r.leave_reason, '') AS "leaveReason"
    FROM attendance_members m
    LEFT JOIN attendance_records r ON r.member_id = m.id AND r.date = $1
    ORDER BY m.cohort DESC, m.name ASC
  `, [date]);
  return rows;
}

export async function addAttendanceMember(name: string, cohort = "ยังไม่ระบุ") {
  const database = requireDatabase();
  await initAttendanceTables();
  const id = `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await database.query(`INSERT INTO attendance_members (id, name, cohort, created_at) VALUES ($1, $2, $3, $4)`, [id, name.trim(), cohort.trim() || "ยังไม่ระบุ", new Date().toISOString()]);
}

export async function seedPdfRoster() {
  const database = requireDatabase();
  await initAttendanceTables();
  const { rows } = await database.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM attendance_members`);
  if (Number(rows[0]?.count) > 0) return;
  for (const [cohort, name] of PDF_ROSTER) {
    await database.query(`INSERT INTO attendance_members (id, name, cohort, created_at) VALUES ($1, $2, $3, $4)`, [`pdf-${cohort}-${name}`, name, cohort, new Date().toISOString()]);
  }
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

import {
  addScheduleEntryToDb,
  getScheduleEntriesFromDb,
  removeScheduleEntryFromDb,
  removeScheduleSignerFromDb,
  signScheduleEntryInDb,
  updateScheduleSignerRoleInDb,
} from "./postgres";

export interface ScheduleEntry {
  id: string;
  topic: string;
  date: string;
  taskDescription: string;
  note: string;
  signers?: Array<{
    name: string;
    role: string;
    team?: string;
    signedAt: string;
  }>;
  createdAt: string;
}

function requireDatabaseConnection() {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    throw new Error(
      "ยังไม่ได้ตั้งค่าฐานข้อมูลถาวร กรุณาตั้ง POSTGRES_URL หรือ DATABASE_URL ก่อนบันทึกข้อมูล"
    );
  }
}

export async function getScheduleEntries(): Promise<ScheduleEntry[]> {
  requireDatabaseConnection();
  const entries = await getScheduleEntriesFromDb();
  return entries.sort((a: ScheduleEntry, b: ScheduleEntry) => a.date.localeCompare(b.date));
}

export async function addScheduleEntry(
  topic: string,
  date: string,
  taskDescription: string,
  note: string
): Promise<ScheduleEntry> {
  requireDatabaseConnection();
  return addScheduleEntryToDb(topic, date, taskDescription, note);
}

export async function signScheduleEntry(
  id: string,
  name: string,
  role: string,
  team?: string
): Promise<ScheduleEntry> {
  requireDatabaseConnection();
  await signScheduleEntryInDb(id, name, role, team);
  const entry = (await getScheduleEntries()).find((scheduleEntry) => scheduleEntry.id === id);
  if (!entry) throw new Error("Entry not found");
  return entry;
}

export async function removeScheduleSigner(id: string, signedAt: string): Promise<ScheduleEntry> {
  requireDatabaseConnection();
  await removeScheduleSignerFromDb(id, signedAt);
  const entry = (await getScheduleEntries()).find((scheduleEntry) => scheduleEntry.id === id);
  if (!entry) throw new Error("Entry not found");
  return entry;
}

export async function updateScheduleSignerRole(id: string, signedAt: string, role: string): Promise<ScheduleEntry> {
  requireDatabaseConnection();
  await updateScheduleSignerRoleInDb(id, signedAt, role);
  const entry = (await getScheduleEntries()).find((scheduleEntry) => scheduleEntry.id === id);
  if (!entry) throw new Error("Entry not found");
  return entry;
}

export async function removeScheduleEntry(id: string): Promise<void> {
  requireDatabaseConnection();
  await removeScheduleEntryFromDb(id);
}

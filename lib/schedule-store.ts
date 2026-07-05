import { promises as fs } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "schedule.json");

async function ensureStoreFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readEntries(): Promise<ScheduleEntry[]> {
  await ensureStoreFile();
  const content = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(content) as ScheduleEntry[];
}

async function writeEntries(entries: ScheduleEntry[]): Promise<void> {
  await ensureStoreFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");
}

export async function getScheduleEntries(): Promise<ScheduleEntry[]> {
  const entries = await readEntries();
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export async function addScheduleEntry(
  topic: string,
  date: string,
  taskDescription: string,
  note: string
): Promise<ScheduleEntry> {
  const entries = await readEntries();
  const entry: ScheduleEntry = {
    id: `${date}-${Date.now()}`,
    topic,
    date,
    taskDescription: taskDescription.trim(),
    note: note.trim() || "พร้อมลงงาน",
    createdAt: new Date().toISOString(),
  };

  const nextEntries = [entry, ...entries].sort((a, b) => a.date.localeCompare(b.date));
  await writeEntries(nextEntries);
  return entry;
}

export async function signScheduleEntry(id: string, name: string, role: string, team?: string): Promise<ScheduleEntry> {
  const entries = await readEntries();
  let signedEntry: ScheduleEntry | undefined;

  const nextEntries = entries.map((entry) => {
    if (entry.id !== id) return entry;
    const signer = {
      name: name.trim(),
      role: role.trim(),
      team: team?.trim() || undefined,
      signedAt: new Date().toISOString(),
    };
    signedEntry = {
      ...entry,
      signers: [...(entry.signers ?? []), signer],
    };
    return signedEntry;
  });

  if (!signedEntry) {
    throw new Error("Entry not found");
  }

  await writeEntries(nextEntries);
  return signedEntry;
}

export async function removeScheduleSigner(id: string, signedAt: string): Promise<ScheduleEntry> {
  const entries = await readEntries();
  let updatedEntry: ScheduleEntry | undefined;

  const nextEntries = entries.map((entry) => {
    if (entry.id !== id) return entry;
    const signers = (entry.signers ?? []).filter((signer) => signer.signedAt !== signedAt);
    if (signers.length === (entry.signers ?? []).length) {
      throw new Error("Signer not found");
    }
    updatedEntry = {
      ...entry,
      signers,
    };
    return updatedEntry;
  });

  if (!updatedEntry) {
    throw new Error("Entry not found");
  }

  await writeEntries(nextEntries);
  return updatedEntry;
}

export async function removeScheduleEntry(id: string): Promise<void> {
  const entries = await readEntries();
  const nextEntries = entries.filter((entry) => entry.id !== id);
  await writeEntries(nextEntries);
}

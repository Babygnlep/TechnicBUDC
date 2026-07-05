import { promises as fs, constants as fsConstants } from "fs";
import os from "os";
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

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");
const TEMP_DATA_DIR = path.join(os.tmpdir(), "media-recruit-data");
const DATA_FILE = path.join(DEFAULT_DATA_DIR, "schedule.json");
const TEMP_DATA_FILE = path.join(TEMP_DATA_DIR, "schedule.json");

async function getWritablePath(): Promise<{ dir: string; file: string }> {
  try {
    await fs.mkdir(DEFAULT_DATA_DIR, { recursive: true });
    await fs.access(DEFAULT_DATA_DIR, fsConstants.W_OK);
    return { dir: DEFAULT_DATA_DIR, file: DATA_FILE };
  } catch {
    await fs.mkdir(TEMP_DATA_DIR, { recursive: true });
    await fs.access(TEMP_DATA_DIR, fsConstants.W_OK);
    return { dir: TEMP_DATA_DIR, file: TEMP_DATA_FILE };
  }
}

async function ensureStoreFile(): Promise<void> {
  const { file } = await getWritablePath();
  try {
    await fs.access(file, fsConstants.R_OK | fsConstants.W_OK);
  } catch {
    await fs.writeFile(file, "[]", "utf8");
  }
}

async function readEntries(): Promise<ScheduleEntry[]> {
  const { file } = await getWritablePath();
  await ensureStoreFile();
  const content = await fs.readFile(file, "utf8");

  try {
    return JSON.parse(content) as ScheduleEntry[];
  } catch {
    await fs.writeFile(file, "[]", "utf8");
    return [];
  }
}

async function writeEntries(entries: ScheduleEntry[]): Promise<void> {
  const { file } = await getWritablePath();
  await ensureStoreFile();
  await fs.writeFile(file, JSON.stringify(entries, null, 2), "utf8");
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

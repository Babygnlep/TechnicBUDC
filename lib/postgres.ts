import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export async function initScheduleTables() {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedule_entries (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      date TEXT NOT NULL,
      task_description TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedule_signers (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      team TEXT,
      signed_at TEXT NOT NULL
    );
  `);
}

interface ScheduleEntryRow extends QueryResultRow {
  id: string;
  topic: string;
  date: string;
  taskDescription: string;
  note: string;
  signers: Array<{
    name: string;
    role: string;
    team?: string;
    signedAt: string;
  }>;
  createdAt: string;
}

export async function getScheduleEntriesFromDb() {
  if (!pool) {
    return [];
  }

  await initScheduleTables();

  const { rows } = await pool.query<ScheduleEntryRow>(`
    SELECT
      s.id,
      s.topic,
      s.date,
      s.task_description AS "taskDescription",
      s.note,
      s.created_at AS "createdAt",
      COALESCE(
        json_agg(
          json_build_object(
            'name', sg.name,
            'role', sg.role,
            'team', sg.team,
            'signedAt', sg.signed_at
          ) ORDER BY sg.signed_at
        ) FILTER (WHERE sg.id IS NOT NULL),
        '[]'::json
      ) AS signers
    FROM schedule_entries s
    LEFT JOIN schedule_signers sg ON sg.entry_id = s.id
    GROUP BY s.id, s.topic, s.date, s.task_description, s.note, s.created_at
    ORDER BY s.date ASC, s.created_at DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    topic: row.topic,
    date: row.date,
    taskDescription: row.taskDescription,
    note: row.note,
    signers: row.signers || [],
    createdAt: row.createdAt,
  }));
}

export async function addScheduleEntryToDb(topic: string, date: string, taskDescription: string, note: string) {
  if (!pool) {
    throw new Error("POSTGRES_URL or DATABASE_URL is not configured");
  }

  await initScheduleTables();

  const id = `${date}-${Date.now()}`;
  const createdAt = new Date().toISOString();

  await pool.query(
    `
      INSERT INTO schedule_entries (id, topic, date, task_description, note, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [id, topic, date, taskDescription.trim(), note.trim() || "พร้อมลงงาน", createdAt]
  );

  return {
    id,
    topic,
    date,
    taskDescription: taskDescription.trim(),
    note: note.trim() || "พร้อมลงงาน",
    createdAt,
  };
}

export async function signScheduleEntryInDb(id: string, name: string, role: string, team?: string) {
  if (!pool) {
    throw new Error("POSTGRES_URL or DATABASE_URL is not configured");
  }

  await initScheduleTables();

  const signerId = `${id}-${Date.now()}`;
  const signedAt = new Date().toISOString();

  await pool.query(
    `
      INSERT INTO schedule_signers (id, entry_id, name, role, team, signed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [signerId, id, name.trim(), role.trim(), team?.trim() || null, signedAt]
  );

  return { id, signedAt };
}

export async function removeScheduleSignerFromDb(entryId: string, signedAt: string) {
  if (!pool) {
    throw new Error("POSTGRES_URL or DATABASE_URL is not configured");
  }

  await initScheduleTables();

  await pool.query(`DELETE FROM schedule_signers WHERE entry_id = $1 AND signed_at = $2`, [entryId, signedAt]);
}

export async function removeScheduleEntryFromDb(id: string) {
  if (!pool) {
    throw new Error("POSTGRES_URL or DATABASE_URL is not configured");
  }

  await initScheduleTables();
  await pool.query(`DELETE FROM schedule_entries WHERE id = $1`, [id]);
}

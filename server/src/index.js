import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '..', 'database', 'work-calendar.db'));

app.use(cors());
app.use(express.json());

const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      projectName TEXT NOT NULL,
      client TEXT NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      breakTime INTEGER NOT NULL,
      totalHours REAL NOT NULL,
      location TEXT,
      description TEXT,
      colorLabel TEXT,
      startDateTime TEXT NOT NULL,
      endDateTime TEXT NOT NULL,
      googleEventId TEXT,
      createdAt TEXT NOT NULL
    );
  `);
};

initDb();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/events', (_req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY createdAt DESC').all();
  res.json(rows);
});

app.post('/api/events', (req, res) => {
  const event = req.body;
  const stmt = db.prepare(`
    INSERT INTO events (id, title, projectName, client, start, end, breakTime, totalHours, location, description, colorLabel, startDateTime, endDateTime, googleEventId, createdAt)
    VALUES (@id, @title, @projectName, @client, @start, @end, @breakTime, @totalHours, @location, @description, @colorLabel, @startDateTime, @endDateTime, @googleEventId, @createdAt)
  `);
  stmt.run(event);
  res.status(201).json(event);
});

app.put('/api/events/:id', (req, res) => {
  const event = req.body;
  const stmt = db.prepare(`
    UPDATE events SET
      title = @title,
      projectName = @projectName,
      client = @client,
      start = @start,
      end = @end,
      breakTime = @breakTime,
      totalHours = @totalHours,
      location = @location,
      description = @description,
      colorLabel = @colorLabel,
      startDateTime = @startDateTime,
      endDateTime = @endDateTime,
      googleEventId = @googleEventId
    WHERE id = @id
  `);
  stmt.run(event);
  res.json(event);
});

app.delete('/api/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

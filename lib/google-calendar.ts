import { google } from "googleapis";

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

function getNextDayDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const nextDay = new Date(year, month - 1, day + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;
}

export async function createGoogleCalendarEvent(
  topic: string,
  date: string,
  taskDescription: string,
  note: string
) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE ?? "Asia/Bangkok";

  if (!calendarId || !serviceAccountEmail || !privateKey) {
    throw new Error(
      `Missing Google Calendar config: ${[
        calendarId ? null : "GOOGLE_CALENDAR_ID",
        serviceAccountEmail ? null : "GOOGLE_SERVICE_ACCOUNT_EMAIL",
        privateKey ? null : "GOOGLE_PRIVATE_KEY",
      ]
        .filter(Boolean)
        .join(", ")}`
    );
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: normalizePrivateKey(privateKey),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${topic} - ${taskDescription}`,
      description: `หัวข้องาน: ${topic}\nงาน: ${taskDescription}${note ? `\nหมายเหตุ: ${note}` : ""}`,
      start: { date, timeZone },
      end: { date: getNextDayDate(date), timeZone },
    },
  });
}

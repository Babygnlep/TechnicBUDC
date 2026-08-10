import { google } from "googleapis";

function normalizeEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}

function stripSurroundingQuotes(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function normalizePrivateKey(key: string) {
  let normalized = key.trim();
  normalized = stripSurroundingQuotes(normalized);
  normalized = normalized.replace(/\\n/g, '\n');
  normalized = normalized.replace(/\r/g, '');
  return normalized.trim();
}

function parseServiceAccountCredentials(serviceAccountEmail: string, rawPrivateKey: string) {
  const trimmed = stripSurroundingQuotes(rawPrivateKey.trim());

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('GOOGLE_PRIVATE_KEY is not a valid JSON object or PEM private key');
    }

    if (typeof parsed.client_email !== 'string' || typeof parsed.private_key !== 'string') {
      throw new Error('GOOGLE_PRIVATE_KEY JSON object must contain client_email and private_key');
    }

    const clientEmail = normalizeEnvValue(parsed.client_email);
    return {
      serviceAccountEmail: serviceAccountEmail || clientEmail,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  }

  return {
    serviceAccountEmail,
    privateKey: normalizePrivateKey(trimmed),
  };
}

export function isGoogleCalendarConfigured() {
  const calendarId = normalizeEnvValue(process.env.GOOGLE_CALENDAR_ID);
  const serviceAccountEmail = normalizeEnvValue(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!calendarId || !rawPrivateKey) {
    return false;
  }

  if (serviceAccountEmail) {
    return true;
  }

  const trimmed = rawPrivateKey.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Boolean(parsed.client_email && parsed.private_key);
    } catch {
      return false;
    }
  }

  return true;
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
  const calendarId = normalizeEnvValue(process.env.GOOGLE_CALENDAR_ID);
  const serviceAccountEmailInput = normalizeEnvValue(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE ?? "Asia/Bangkok";

  if (!rawPrivateKey) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY");
  }

  if (!calendarId) {
    throw new Error("Missing GOOGLE_CALENDAR_ID");
  }

  const { serviceAccountEmail, privateKey } = parseServiceAccountCredentials(serviceAccountEmailInput, rawPrivateKey);

  if (!serviceAccountEmail) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL and no client_email found in GOOGLE_PRIVATE_KEY JSON object");
  }

  if (!serviceAccountEmail.match(/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/)) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL must be a valid service account email ending in .iam.gserviceaccount.com");
  }

  if (
    !privateKey ||
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error("GOOGLE_PRIVATE_KEY is not a valid PEM private key");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${topic} - ${taskDescription}`,
        description: `หัวข้องาน: ${topic}\nงาน: ${taskDescription}${note ? `\nหมายเหตุ: ${note}` : ""}`,
        start: {
          dateTime: `${date}T00:00:00`,
          timeZone,
        },
        end: {
          dateTime: `${getNextDayDate(date)}T00:00:00`,
          timeZone,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Google Calendar auth error", {
      serviceAccountEmail,
      calendarId,
      message,
    });

    if (message.includes("invalid_grant")) {
      throw new Error(`Google Calendar authentication failed: invalid grant for ${serviceAccountEmail}. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.`);
    }

    if (message.includes("account not found")) {
      throw new Error(`Google Calendar authentication failed: account not found for ${serviceAccountEmail}. Verify the service account email and calendar sharing permissions.`);
    }

    throw new Error(`Google Calendar API error: ${message}`);
  }
}

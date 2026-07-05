import { NextResponse } from "next/server";
import { google } from "googleapis";
import { addScheduleEntry, getScheduleEntries, removeScheduleEntry, removeScheduleSigner, signScheduleEntry } from "@/lib/schedule-store";

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

function getNextDayDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const nextDay = new Date(year, month - 1, day + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;
}

async function createGoogleCalendarEvent(topic: string, date: string, taskDescription: string, note: string) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE ?? "Asia/Bangkok";

  if (!calendarId || !serviceAccountEmail || !privateKey) {
    return;
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

export async function GET() {
  try {
    const entries = await getScheduleEntries();
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = typeof body?.topic === "string" ? body.topic : "";
    const date = typeof body?.date === "string" ? body.date : "";
    const taskDescription = typeof body?.taskDescription === "string" ? body.taskDescription : "";
    const note = typeof body?.note === "string" ? body.note : "";

    if (!topic) {
      return NextResponse.json(
        { success: false, message: "กรุณาเลือกหัวข้องานก่อน" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { success: false, message: "กรุณาเลือกวันที่ก่อน" },
        { status: 400 }
      );
    }

    if (!taskDescription.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุว่างานนี้ทำอะไร" },
        { status: 400 }
      );
    }

    const entry = await addScheduleEntry(topic, date, taskDescription, note);
    await createGoogleCalendarEvent(topic, date, taskDescription, note);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const action = typeof body?.action === "string" ? body.action : "sign";

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing entry id" },
        { status: 400 }
      );
    }

    if (action === "removeSigner") {
      const signedAt = typeof body?.signedAt === "string" ? body.signedAt : "";
      if (!signedAt) {
        return NextResponse.json(
          { success: false, message: "Missing signer timestamp" },
          { status: 400 }
        );
      }
      const entry = await removeScheduleSigner(id, signedAt);
      return NextResponse.json({ success: true, entry });
    }

    const name = typeof body?.name === "string" ? body.name : "";
    const role = typeof body?.role === "string" ? body.role : "";
    const team = typeof body?.team === "string" ? body.team : "";

    if (!name.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกชื่อผู้ลงชื่อ" },
        { status: 400 }
      );
    }

    if (!role.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุหน้าที่หรือบทบาท" },
        { status: 400 }
      );
    }

    const entry = await signScheduleEntry(id, name, role, team);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id" },
        { status: 400 }
      );
    }

    await removeScheduleEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

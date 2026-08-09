import { NextResponse } from "next/server";
import { addScheduleEntry, getScheduleEntries, removeScheduleEntry, removeScheduleSigner, signScheduleEntry } from "@/lib/schedule-store";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";


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

    // Allow opting out of Google Calendar integration via env var.
    // Set DISABLE_GOOGLE_CALENDAR=true to skip creating Google events.
    const disableGoogle = String(process.env.DISABLE_GOOGLE_CALENDAR || "").toLowerCase() === "true";
    if (!disableGoogle) {
      try {
        await createGoogleCalendarEvent(topic, date, taskDescription, note);
      } catch (error) {
        // If calendar creation fails, remove the saved entry to keep behavior
        // compatible with previous implementation and return an error.
        await removeScheduleEntry(entry.id).catch(() => undefined);
        return NextResponse.json(
          {
            success: false,
            message: `ไม่สามารถส่งข้อมูลไป Google Calendar: ${String(error)}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, entry, googleSyncSkipped: disableGoogle });
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

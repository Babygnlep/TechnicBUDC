import { NextResponse } from "next/server";
import { addScheduleEntry, getScheduleEntries, removeScheduleEntry, removeScheduleSigner, signScheduleEntry, updateScheduleSignerRole } from "@/lib/schedule-store";
import { getScheduleRoleFromSession, getScheduleSessionFromRequest, type ScheduleRole } from "@/lib/schedule-auth";

function getScheduleRole(request: Request): ScheduleRole | null {
  return getScheduleRoleFromSession(getScheduleSessionFromRequest(request));
}

function requireScheduleAuthentication(request: Request, requiredRole?: "admin") {
  const role = getScheduleRole(request);
  if (!role) {
    return NextResponse.json(
      { success: false, message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" },
      { status: 401 }
    );
  }

  if (requiredRole === "admin" && role !== "admin") {
    return NextResponse.json(
      { success: false, message: "เฉพาะผู้ดูแลระบบเท่านั้นที่ทำรายการนี้ได้" },
      { status: 403 }
    );
  }

  return null;
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isPreviewRequest = searchParams.get("preview") === "1";

  if (isPreviewRequest) {
    try {
      const entries = await getScheduleEntries();
      return NextResponse.json({
        success: true,
        entries: entries.map(({ id, topic, date, taskDescription, note }) => ({
          id,
          topic,
          date,
          taskDescription,
          note,
        })),
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: String(error) },
        { status: 500 }
      );
    }
  }

  const unauthorized = requireScheduleAuthentication(req);
  if (unauthorized) return unauthorized;

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
  const unauthorized = requireScheduleAuthentication(req, "admin");
  if (unauthorized) return unauthorized;

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
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const unauthorized = requireScheduleAuthentication(req);
  if (unauthorized) return unauthorized;
  const requestRole = getScheduleRole(req);

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
      const unauthorized = requireScheduleAuthentication(req, "admin");
      if (unauthorized) return unauthorized;

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

    if (action === "updateSignerRole") {
      const unauthorized = requireScheduleAuthentication(req, "admin");
      if (unauthorized) return unauthorized;

      const signedAt = typeof body?.signedAt === "string" ? body.signedAt : "";
      const signerRole = typeof body?.role === "string" ? body.role.trim() : "";
      if (!signedAt || !signerRole) {
        return NextResponse.json(
          { success: false, message: "กรุณาระบุตำแหน่ง" },
          { status: 400 }
        );
      }
      const entry = await updateScheduleSignerRole(id, signedAt, signerRole);
      return NextResponse.json({ success: true, entry });
    }

    const name = typeof body?.name === "string" ? body.name : "";
    const requestedSignerRole = typeof body?.role === "string" ? body.role : "";
    const team = typeof body?.team === "string" ? body.team : "";
    const signerRole = requestedSignerRole;

    if (!name.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกชื่อผู้ลงชื่อ" },
        { status: 400 }
      );
    }

    if (!signerRole.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุหน้าที่หรือบทบาท" },
        { status: 400 }
      );
    }

    const entry = await signScheduleEntry(id, name, signerRole, requestRole === "admin" ? team : undefined);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const unauthorized = requireScheduleAuthentication(req, "admin");
  if (unauthorized) return unauthorized;

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

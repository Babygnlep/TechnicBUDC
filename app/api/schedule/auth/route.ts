import { NextResponse } from "next/server";
import {
  createScheduleSessionToken,
  getScheduleSessionFromRequest,
  getScheduleRoleForPassword,
  getScheduleRoleFromSession,
  SCHEDULE_SESSION_COOKIE,
} from "@/lib/schedule-auth";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    authenticated: Boolean(getScheduleRoleFromSession(getScheduleSessionFromRequest(request))),
    role: getScheduleRoleFromSession(getScheduleSessionFromRequest(request)),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";
  const role = getScheduleRoleForPassword(password);

  if (!role) {
    return NextResponse.json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, role });
  response.cookies.set({
    name: SCHEDULE_SESSION_COOKIE,
    value: createScheduleSessionToken(role),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SCHEDULE_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

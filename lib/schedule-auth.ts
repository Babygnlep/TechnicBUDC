import { createHmac, timingSafeEqual } from "crypto";

export const SCHEDULE_SESSION_COOKIE = "schedule_session";
const SESSION_MESSAGE = "media-recruit-schedule-session-v1";

export type ScheduleRole = "admin" | "user";

function getUserPassword() {
  // SCHEDULE_ACCESS_PASSWORD remains supported so existing setup becomes the user password.
  return (process.env.SCHEDULE_USER_PASSWORD || process.env.SCHEDULE_ACCESS_PASSWORD)?.trim() ?? "";
}

function getAdminPassword() {
  return process.env.SCHEDULE_ADMIN_PASSWORD?.trim() ?? "";
}

function getPasswordForRole(role: ScheduleRole) {
  return role === "admin" ? getAdminPassword() : getUserPassword();
}

function safelyMatches(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function getScheduleRoleForPassword(password: string): ScheduleRole | null {
  const adminPassword = getAdminPassword();
  if (adminPassword && safelyMatches(password, adminPassword)) return "admin";

  const userPassword = getUserPassword();
  if (userPassword && safelyMatches(password, userPassword)) return "user";

  return null;
}

export function createScheduleSessionToken(role: ScheduleRole) {
  const password = getPasswordForRole(role);
  const signature = createHmac("sha256", password).update(`${SESSION_MESSAGE}:${role}`).digest("base64url");
  return `${role}.${signature}`;
}

export function getScheduleRoleFromSession(session?: string): ScheduleRole | null {
  if (!session) return null;

  const [role, signature] = session.split(".");
  if ((role !== "admin" && role !== "user") || !signature) return null;

  const expectedSession = createScheduleSessionToken(role);
  return safelyMatches(session, expectedSession) ? role : null;
}

export function getScheduleSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader.split(";").find((item) => item.trim().startsWith(`${SCHEDULE_SESSION_COOKIE}=`));
  return cookie?.split("=").slice(1).join("=").trim();
}

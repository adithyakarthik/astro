import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseEnabledModules, type ModuleKey } from "./modules";

export const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_DAYS = 30;

export interface CurrentUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  enabledModules: ModuleKey[];
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Finds or creates the User row for an email that just passed OTP verification. */
export async function findOrCreateUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const isAdmin = adminEmails().includes(normalizedEmail);

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      role: isAdmin ? "ADMIN" : "USER",
    },
  });
}

export async function createSession(userId: string) {
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  const isAdmin = session.user.role === "ADMIN" || adminEmails().includes(session.user.email);

  return {
    id: session.user.id,
    email: session.user.email,
    role: isAdmin ? "ADMIN" : "USER",
    enabledModules: parseEnabledModules(session.user.enabledModules),
  };
}

export function hasModule(user: CurrentUser, moduleKey: ModuleKey): boolean {
  return user.role === "ADMIN" || user.enabledModules.includes(moduleKey);
}

/** For use at the top of any protected server component or server action. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Guards a server action so it can't create/modify data for a module the
 * user's subscription doesn't include, even if they somehow bypass the UI.
 */
export function requireModuleAccess(user: CurrentUser, moduleKey: ModuleKey) {
  if (!hasModule(user, moduleKey)) {
    throw new Error(`Your plan does not include the "${moduleKey}" module.`);
  }
}

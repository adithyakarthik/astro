// Session handling for the client-facing portal — a separate login/cookie
// from the astrologer's own session, so a client can never end up with
// astrologer-level access. Portal access is opt-in per Client record
// (granted/revoked by the astrologer, e.g. tied to a payment schedule) and
// requires that Client to have an email on file, since login is by OTP.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const PORTAL_SESSION_COOKIE_NAME = "portal_session";
const PORTAL_SESSION_TTL_DAYS = 30;

export interface PortalClient {
  id: string;
  name: string;
  email: string;
  userId: string;
  tier: string;
}

/** Whether a client's portal access is currently usable (enabled and not past its expiry). */
export function isPortalAccessActive(client: { portalAccessEnabled: boolean; portalAccessExpiresAt: Date | null }): boolean {
  return client.portalAccessEnabled && (!client.portalAccessExpiresAt || client.portalAccessExpiresAt.getTime() > Date.now());
}

export async function createPortalSession(clientId: string) {
  const session = await prisma.clientPortalSession.create({
    data: {
      clientId,
      expiresAt: new Date(Date.now() + PORTAL_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(PORTAL_SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function destroyPortalSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(PORTAL_SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.clientPortalSession.delete({ where: { id: sessionId } }).catch(() => {});
  }
  cookieStore.delete(PORTAL_SESSION_COOKIE_NAME);
}

/** Clients with portal access currently enabled for the given email, across any astrologer. */
export async function findPortalEligibleClients(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const clients = await prisma.client.findMany({
    where: { email: normalizedEmail, portalAccessEnabled: true },
    include: { user: { select: { email: true } } },
  });
  return clients.filter(isPortalAccessActive);
}

export async function getCurrentPortalClient(): Promise<PortalClient | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(PORTAL_SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.clientPortalSession.findUnique({
    where: { id: sessionId },
    include: { client: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  const client = session.client;
  if (!isPortalAccessActive(client)) return null;
  if (!client.email) return null;

  return { id: client.id, name: client.name, email: client.email, userId: client.userId, tier: client.tier };
}

export async function requirePortalClient(): Promise<PortalClient> {
  const client = await getCurrentPortalClient();
  if (!client) {
    redirect("/portal/login");
  }
  return client;
}

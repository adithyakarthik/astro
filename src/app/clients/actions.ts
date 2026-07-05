"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { computeKundli, type AyanamsaKey } from "@/lib/astro/engine";
import { localBirthToUtcAuto } from "@/lib/astro/birth-utils";
import { requireModuleAccess, requireUser } from "@/lib/auth/session";
import { TIER_KEYS, type TierKey } from "@/lib/auth/modules";

export async function createClient(formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "clients");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "clients");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== user.id) notFound();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

function buildChartData(
  birthDateLocal: string,
  latitude: number,
  longitude: number,
  useTrueNodes: boolean,
  ayanamsa: AyanamsaKey
) {
  const { utcDate, timezoneOffsetMinutes } = localBirthToUtcAuto(birthDateLocal, latitude, longitude);
  const chart = computeKundli({ utcDate, latitude, longitude, useTrueNodes, ayanamsa });
  return { utcDate, timezoneOffsetMinutes, chart };
}

export async function createKundli(clientId: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "clients");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== user.id) notFound();

  const name = String(formData.get("name") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim() || null;
  const birthDateLocal = String(formData.get("birthDateLocal") ?? "");
  const birthPlace = String(formData.get("birthPlace") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));

  if (!name || !birthDateLocal || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Missing required birth details");
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { utcDate, timezoneOffsetMinutes, chart } = buildChartData(
    birthDateLocal,
    latitude,
    longitude,
    user.useTrueNodes,
    user.ayanamsa
  );

  const kundli = await prisma.kundli.create({
    data: {
      clientId,
      name,
      gender,
      birthDate: utcDate,
      birthPlace,
      latitude,
      longitude,
      timezoneOffsetMinutes,
      ayanamsa: chart.ayanamsaKey,
      chartData: JSON.stringify(chart),
      notes,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  redirect(`/kundli/${kundli.id}`);
}

export async function updateKundli(kundliId: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "clients");
  const kundli = await prisma.kundli.findUnique({ where: { id: kundliId }, include: { client: true } });
  if (!kundli || kundli.client.userId !== user.id) notFound();

  const name = String(formData.get("name") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim() || null;
  const birthDateLocal = String(formData.get("birthDateLocal") ?? "");
  const birthPlace = String(formData.get("birthPlace") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));

  if (!name || !birthDateLocal || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Missing required birth details");
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { utcDate, timezoneOffsetMinutes, chart } = buildChartData(
    birthDateLocal,
    latitude,
    longitude,
    user.useTrueNodes,
    user.ayanamsa
  );

  await prisma.kundli.update({
    where: { id: kundliId },
    data: {
      name,
      gender,
      birthDate: utcDate,
      birthPlace,
      latitude,
      longitude,
      timezoneOffsetMinutes,
      ayanamsa: chart.ayanamsaKey,
      chartData: JSON.stringify(chart),
      notes,
    },
  });

  revalidatePath(`/kundli/${kundliId}`);
  redirect(`/kundli/${kundliId}`);
}

/**
 * Recomputes and re-saves every kundli owned by the current user from its
 * stored birth instant/coordinates — needed after an engine fix (e.g. the
 * Ascendant formula correction) since chartData is cached at save time, not
 * recalculated on every view.
 */
export async function recomputeMyKundlis() {
  const user = await requireUser();
  requireModuleAccess(user, "clients");

  const kundlis = await prisma.kundli.findMany({ where: { client: { userId: user.id } } });
  for (const k of kundlis) {
    const chart = computeKundli({
      utcDate: k.birthDate,
      latitude: k.latitude,
      longitude: k.longitude,
      useTrueNodes: user.useTrueNodes,
      ayanamsa: user.ayanamsa,
    });
    await prisma.kundli.update({
      where: { id: k.id },
      data: { ayanamsa: chart.ayanamsaKey, chartData: JSON.stringify(chart) },
    });
  }

  revalidatePath("/clients");
}

export async function updateClientPortalAccess(clientId: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "clients");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== user.id) notFound();
  if (!client.email) throw new Error("Add an email address to this client before enabling portal access");

  const portalAccessEnabled = formData.get("portalAccessEnabled") === "on";
  const expiresLocal = String(formData.get("portalAccessExpiresAt") ?? "").trim();
  const portalAccessExpiresAt = expiresLocal ? new Date(`${expiresLocal}T23:59:59`) : null;

  await prisma.client.update({
    where: { id: clientId },
    data: { portalAccessEnabled, portalAccessExpiresAt },
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function updateClientTier(clientId: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "clients");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== user.id) notFound();

  const tier = String(formData.get("tier") ?? "SILVER");
  if (!(TIER_KEYS as readonly string[]).includes(tier)) throw new Error("Invalid tier");

  await prisma.client.update({ where: { id: clientId }, data: { tier: tier as TierKey } });
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const user = await requireUser();
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== user.id) notFound();

  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function deleteKundli(kundliId: string) {
  const user = await requireUser();
  const kundli = await prisma.kundli.findUnique({ where: { id: kundliId }, include: { client: true } });
  if (!kundli || kundli.client.userId !== user.id) notFound();

  await prisma.kundli.delete({ where: { id: kundliId } });
  revalidatePath(`/clients/${kundli.clientId}`);
  redirect(`/clients/${kundli.clientId}`);
}

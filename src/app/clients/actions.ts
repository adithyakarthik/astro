"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { computeKundli } from "@/lib/astro/engine";
import { localBirthToUtcAuto } from "@/lib/astro/birth-utils";
import { requireModuleAccess, requireUser } from "@/lib/auth/session";

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
  useTrueNodes: boolean
) {
  const { utcDate, timezoneOffsetMinutes } = localBirthToUtcAuto(birthDateLocal, latitude, longitude);
  const chart = computeKundli({ utcDate, latitude, longitude, useTrueNodes });
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

  const { utcDate, timezoneOffsetMinutes, chart } = buildChartData(birthDateLocal, latitude, longitude, user.useTrueNodes);

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

  const { utcDate, timezoneOffsetMinutes, chart } = buildChartData(birthDateLocal, latitude, longitude, user.useTrueNodes);

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
      chartData: JSON.stringify(chart),
      notes,
    },
  });

  revalidatePath(`/kundli/${kundliId}`);
  redirect(`/kundli/${kundliId}`);
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

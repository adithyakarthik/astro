"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { extractYoutubeId } from "@/lib/youtube";
import { requireModuleAccess, requireUser } from "@/lib/auth/session";
import { TIER_KEYS, type TierKey } from "@/lib/auth/modules";

function readFolderId(formData: FormData): string | null {
  const raw = String(formData.get("folderId") ?? "").trim();
  return raw || null;
}

function readAllowedTiers(formData: FormData): TierKey[] {
  return TIER_KEYS.filter((tier) => formData.get(`tier-${tier}`) === "on");
}

/** Syncs per-video, per-client direct access grants from `client-<id>` checkboxes. */
async function syncVideoAccess(videoId: string, userId: string, formData: FormData) {
  const clients = await prisma.client.findMany({ where: { userId, portalAccessEnabled: true }, select: { id: true } });
  const grantedClientIds = clients.filter((c) => formData.get(`client-${c.id}`) === "on").map((c) => c.id);

  await prisma.$transaction([
    prisma.videoAccess.deleteMany({ where: { videoId } }),
    prisma.videoAccess.createMany({
      data: grantedClientIds.map((clientId) => ({ videoId, clientId })),
    }),
  ]);
}

export async function createVideo(formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "videos");
  const title = String(formData.get("title") ?? "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const folderId = readFolderId(formData);

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!title || !youtubeId) {
    throw new Error("Provide a title and a valid YouTube URL");
  }
  if (folderId) {
    const folder = await prisma.videoFolder.findUnique({ where: { id: folderId } });
    if (!folder || folder.userId !== user.id) throw new Error("Invalid folder");
  }

  const created = await prisma.videoContent.create({
    data: { userId: user.id, title, youtubeUrl, youtubeId, description, category, folderId, allowedTiers: readAllowedTiers(formData) },
  });
  await syncVideoAccess(created.id, user.id, formData);

  revalidatePath("/videos");
  redirect("/videos");
}

export async function updateVideo(id: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "videos");
  const video = await prisma.videoContent.findUnique({ where: { id } });
  if (!video || video.userId !== user.id) notFound();

  const title = String(formData.get("title") ?? "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const folderId = readFolderId(formData);

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!title || !youtubeId) {
    throw new Error("Provide a title and a valid YouTube URL");
  }
  if (folderId) {
    const folder = await prisma.videoFolder.findUnique({ where: { id: folderId } });
    if (!folder || folder.userId !== user.id) throw new Error("Invalid folder");
  }

  await prisma.videoContent.update({
    where: { id },
    data: { title, youtubeUrl, youtubeId, description, category, folderId, allowedTiers: readAllowedTiers(formData) },
  });
  await syncVideoAccess(id, user.id, formData);

  revalidatePath("/videos");
  redirect("/videos");
}

export async function deleteVideo(id: string) {
  const user = await requireUser();
  const video = await prisma.videoContent.findUnique({ where: { id } });
  if (!video || video.userId !== user.id) notFound();

  await prisma.videoContent.delete({ where: { id } });
  revalidatePath("/videos");
}

export async function createVideoFolder(formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "videos");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Enter a folder name");

  await prisma.videoFolder.create({ data: { userId: user.id, name } });
  revalidatePath("/videos");
}

export async function deleteVideoFolder(id: string) {
  const user = await requireUser();
  const folder = await prisma.videoFolder.findUnique({ where: { id } });
  if (!folder || folder.userId !== user.id) notFound();

  await prisma.videoFolder.delete({ where: { id } });
  revalidatePath("/videos");
  redirect("/videos");
}

export async function updateFolderAccess(folderId: string, formData: FormData) {
  const user = await requireUser();
  const folder = await prisma.videoFolder.findUnique({ where: { id: folderId } });
  if (!folder || folder.userId !== user.id) notFound();

  const clients = await prisma.client.findMany({ where: { userId: user.id }, select: { id: true } });
  const grantedClientIds = clients.filter((c) => formData.get(`client-${c.id}`) === "on").map((c) => c.id);
  const allowedTiers = readAllowedTiers(formData);

  await prisma.$transaction([
    prisma.videoFolder.update({ where: { id: folderId }, data: { allowedTiers } }),
    prisma.videoFolderAccess.deleteMany({ where: { folderId } }),
    prisma.videoFolderAccess.createMany({
      data: grantedClientIds.map((clientId) => ({ folderId, clientId })),
    }),
  ]);

  revalidatePath(`/videos/folders/${folderId}`);
}

"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireModuleAccess, requireUser } from "@/lib/auth/session";
import { saveUploadedPhoto } from "@/lib/storage";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function uploadPhotos(formData: FormData): Promise<string[]> {
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  return Promise.all(files.map((file) => saveUploadedPhoto(file)));
}

export async function createFind(formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "finds");

  const title = String(formData.get("title") ?? "").trim();
  const heading = String(formData.get("heading") ?? "").trim();
  const latitude = parseFloat(String(formData.get("latitude") ?? ""));
  const longitude = parseFloat(String(formData.get("longitude") ?? ""));
  if (!title || !heading || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Title, heading and location are required");
  }

  const photoUrls = await uploadPhotos(formData);

  const find = await prisma.find.create({
    data: {
      userId: user.id,
      title,
      heading,
      description: String(formData.get("description") ?? "").trim() || null,
      tags: parseTags(String(formData.get("tags") ?? "")),
      shopName: String(formData.get("shopName") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      latitude,
      longitude,
      photos: { create: photoUrls.map((url) => ({ url })) },
    },
  });

  revalidatePath("/finds");
  redirect(`/finds/${find.id}`);
}

export async function updateFind(findId: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "finds");
  const find = await prisma.find.findUnique({ where: { id: findId } });
  if (!find || find.userId !== user.id) notFound();

  const title = String(formData.get("title") ?? "").trim();
  const heading = String(formData.get("heading") ?? "").trim();
  const latitude = parseFloat(String(formData.get("latitude") ?? ""));
  const longitude = parseFloat(String(formData.get("longitude") ?? ""));
  if (!title || !heading || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Title, heading and location are required");
  }

  const removePhotoIds = formData.getAll("removePhotoIds").map(String);
  const photoUrls = await uploadPhotos(formData);

  await prisma.find.update({
    where: { id: findId },
    data: {
      title,
      heading,
      description: String(formData.get("description") ?? "").trim() || null,
      tags: parseTags(String(formData.get("tags") ?? "")),
      shopName: String(formData.get("shopName") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      latitude,
      longitude,
      photos: {
        deleteMany: removePhotoIds.length > 0 ? { id: { in: removePhotoIds } } : undefined,
        create: photoUrls.map((url) => ({ url })),
      },
    },
  });

  revalidatePath("/finds");
  revalidatePath(`/finds/${findId}`);
  redirect(`/finds/${findId}`);
}

export async function deleteFind(findId: string) {
  const user = await requireUser();
  requireModuleAccess(user, "finds");
  const find = await prisma.find.findUnique({ where: { id: findId } });
  if (!find || find.userId !== user.id) notFound();

  await prisma.find.delete({ where: { id: findId } });
  revalidatePath("/finds");
  redirect("/finds");
}

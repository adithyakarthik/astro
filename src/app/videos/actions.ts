"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { extractYoutubeId } from "@/lib/youtube";

export async function createVideo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!title || !youtubeId) {
    throw new Error("Provide a title and a valid YouTube URL");
  }

  await prisma.videoContent.create({
    data: { title, youtubeUrl, youtubeId, description, category },
  });

  revalidatePath("/videos");
  redirect("/videos");
}

export async function deleteVideo(id: string) {
  await prisma.videoContent.delete({ where: { id } });
  revalidatePath("/videos");
}

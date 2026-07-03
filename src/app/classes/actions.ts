"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireModuleAccess, requireUser } from "@/lib/auth/session";

export async function createClass(formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "classes");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const startsAtLocal = String(formData.get("startsAt") ?? "");
  const durationMins = Number(formData.get("durationMins") ?? 60);
  const feeInRupees = Number(formData.get("feeInRupees"));
  const upiId = String(formData.get("upiId") ?? "").trim();
  const payeeName = String(formData.get("payeeName") ?? "").trim();
  const meetingLink = String(formData.get("meetingLink") ?? "").trim() || null;

  if (!title || !startsAtLocal || !upiId || !payeeName || Number.isNaN(feeInRupees)) {
    throw new Error("Missing required fields");
  }

  await prisma.classAnnouncement.create({
    data: {
      userId: user.id,
      title,
      description,
      startsAt: new Date(startsAtLocal),
      durationMins,
      feeInRupees,
      upiId,
      payeeName,
      meetingLink,
    },
  });

  revalidatePath("/classes");
  redirect("/classes");
}

export async function deleteClass(id: string) {
  const user = await requireUser();
  const cls = await prisma.classAnnouncement.findUnique({ where: { id } });
  if (!cls || cls.userId !== user.id) notFound();

  await prisma.classAnnouncement.delete({ where: { id } });
  revalidatePath("/classes");
}

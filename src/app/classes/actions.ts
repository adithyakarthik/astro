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
  const endsAtLocal = String(formData.get("endsAt") ?? "").trim();
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
      endsAt: endsAtLocal ? new Date(endsAtLocal) : null,
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

export async function updateClass(id: string, formData: FormData) {
  const user = await requireUser();
  requireModuleAccess(user, "classes");
  const cls = await prisma.classAnnouncement.findUnique({ where: { id } });
  if (!cls || cls.userId !== user.id) notFound();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const startsAtLocal = String(formData.get("startsAt") ?? "");
  const endsAtLocal = String(formData.get("endsAt") ?? "").trim();
  const durationMins = Number(formData.get("durationMins") ?? 60);
  const feeInRupees = Number(formData.get("feeInRupees"));
  const upiId = String(formData.get("upiId") ?? "").trim();
  const payeeName = String(formData.get("payeeName") ?? "").trim();
  const meetingLink = String(formData.get("meetingLink") ?? "").trim() || null;

  if (!title || !startsAtLocal || !upiId || !payeeName || Number.isNaN(feeInRupees)) {
    throw new Error("Missing required fields");
  }

  await prisma.classAnnouncement.update({
    where: { id },
    data: {
      title,
      description,
      startsAt: new Date(startsAtLocal),
      endsAt: endsAtLocal ? new Date(endsAtLocal) : null,
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

async function requireOwnedClass(classId: string) {
  const user = await requireUser();
  requireModuleAccess(user, "classes");
  const cls = await prisma.classAnnouncement.findUnique({ where: { id: classId } });
  if (!cls || cls.userId !== user.id) notFound();
  return cls;
}

export async function createClassPayment(classId: string, formData: FormData) {
  await requireOwnedClass(classId);

  const studentName = String(formData.get("studentName") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim() || null;
  const amountPaid = Number(formData.get("amountPaid"));
  const paidAtLocal = String(formData.get("paidAt") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!studentName || Number.isNaN(amountPaid) || !paidAtLocal) {
    throw new Error("Missing required fields");
  }

  await prisma.classPayment.create({
    data: {
      classId,
      studentName,
      contact,
      amountPaid,
      paidAt: new Date(paidAtLocal),
      notes,
    },
  });

  revalidatePath(`/classes/${classId}/payments`);
}

export async function deleteClassPayment(classId: string, paymentId: string) {
  await requireOwnedClass(classId);
  const payment = await prisma.classPayment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.classId !== classId) notFound();

  await prisma.classPayment.delete({ where: { id: paymentId } });
  revalidatePath(`/classes/${classId}/payments`);
}

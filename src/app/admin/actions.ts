"use server";

import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { MODULE_KEYS, serializeEnabledModules, TIER_KEYS, type ModuleKey, type TierKey } from "@/lib/auth/modules";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}

export async function updateUserModules(targetUserId: string, formData: FormData) {
  await requireAdmin();

  const enabled = MODULE_KEYS.filter((key) => formData.get(`module-${key}`) === "on") as ModuleKey[];
  const tier = String(formData.get("tier") ?? "SILVER");
  if (!(TIER_KEYS as readonly string[]).includes(tier)) throw new Error("Invalid tier");

  await prisma.user.update({
    where: { id: targetUserId },
    data: { tier: tier as TierKey, enabledModules: serializeEnabledModules(enabled) },
  });

  revalidatePath("/admin/users");
}

export async function updateUserRole(targetUserId: string, formData: FormData) {
  const admin = await requireAdmin();
  const role = String(formData.get("role") ?? "USER");
  if (role !== "USER" && role !== "ADMIN") throw new Error("Invalid role");
  if (targetUserId === admin.id && role !== "ADMIN") {
    throw new Error("You can't demote your own account.");
  }

  await prisma.user.update({ where: { id: targetUserId }, data: { role } });
  revalidatePath("/admin/users");
}

/** Pre-provisions a user by email so they can log in via OTP immediately, with modules already granted. */
export async function createUser(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Enter a valid email address");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("A user with this email already exists");

  await prisma.user.create({ data: { email } });
  revalidatePath("/admin/users");
}

export async function deleteUser(targetUserId: string) {
  const admin = await requireAdmin();
  if (targetUserId === admin.id) throw new Error("You can't delete your own account.");

  await prisma.user.delete({ where: { id: targetUserId } });
  revalidatePath("/admin/users");
}

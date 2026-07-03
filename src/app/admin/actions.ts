"use server";

import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { MODULE_KEYS, serializeEnabledModules, type ModuleKey } from "@/lib/auth/modules";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}

export async function updateUserModules(targetUserId: string, formData: FormData) {
  await requireAdmin();

  const enabled = MODULE_KEYS.filter((key) => formData.get(`module-${key}`) === "on") as ModuleKey[];

  await prisma.user.update({
    where: { id: targetUserId },
    data: { enabledModules: serializeEnabledModules(enabled) },
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

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { AYANAMSA_KEYS } from "@/lib/astro/constants";

export async function updateSettings(formData: FormData) {
  const user = await requireUser();

  const theme = String(formData.get("theme") ?? "light");
  const chartStyle = String(formData.get("chartStyle") ?? "south");
  const useTrueNodes = formData.get("useTrueNodes") === "on";
  const ayanamsa = String(formData.get("ayanamsa") ?? "LAHIRI");

  if (theme !== "light" && theme !== "dark") throw new Error("Invalid theme");
  if (chartStyle !== "south" && chartStyle !== "north") throw new Error("Invalid chart style");
  if (!(AYANAMSA_KEYS as readonly string[]).includes(ayanamsa)) throw new Error("Invalid ayanamsa");

  await prisma.user.update({
    where: { id: user.id },
    data: { theme, chartStyle, useTrueNodes, ayanamsa },
  });

  revalidatePath("/", "layout");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

export async function updateSettings(formData: FormData) {
  const user = await requireUser();

  const theme = String(formData.get("theme") ?? "light");
  const chartStyle = String(formData.get("chartStyle") ?? "south");
  const useTrueNodes = formData.get("useTrueNodes") === "on";

  if (theme !== "light" && theme !== "dark") throw new Error("Invalid theme");
  if (chartStyle !== "south" && chartStyle !== "north") throw new Error("Invalid chart style");

  await prisma.user.update({
    where: { id: user.id },
    data: { theme, chartStyle, useTrueNodes },
  });

  revalidatePath("/", "layout");
}

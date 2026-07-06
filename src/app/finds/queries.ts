import { prisma } from "@/lib/db";

// Distinct headings a user has filed finds under so far — powers the heading
// datalist on the form and the heading filter on the list page. Not a server
// action (plain server-only helper), so `userId` is always the caller's own id
// from the session, never a client-supplied value.
export async function listFindHeadings(userId: string): Promise<string[]> {
  const rows = await prisma.find.findMany({
    where: { userId },
    select: { heading: true },
    distinct: ["heading"],
    orderBy: { heading: "asc" },
  });
  return rows.map((r) => r.heading);
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePortalClient } from "@/lib/auth/portal-session";
import { getTranslations } from "@/lib/i18n/server";

export default async function PortalDashboardPage() {
  const client = await requirePortalClient();
  const { t } = await getTranslations();

  const kundlis = await prisma.kundli.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
          {t("portal.welcome")}, {client.name}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("portal.dashboardSubtitle")}</p>
      </div>

      {kundlis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {t("portal.noKundlis")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {kundlis.map((k) => (
            <Link
              key={k.id}
              href={`/portal/kundli/${k.id}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="font-medium dark:text-zinc-100">{k.name}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{k.birthPlace}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

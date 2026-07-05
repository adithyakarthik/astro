import Link from "next/link";
import { prisma } from "@/lib/db";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { recomputeMyKundlis } from "./actions";

export default async function ClientsPage() {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t } = await getTranslations();

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { kundlis: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t("clients.title")}</h1>
        <Link
          href="/clients/new"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("clients.addClient")}
        </Link>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900 dark:bg-amber-950/20">
        <h2 className="font-semibold text-amber-800 dark:text-amber-400">{t("clients.recomputeHeading")}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("clients.recomputeSubtitle")}</p>
        <div className="mt-3">
          <ConfirmSubmitForm
            action={recomputeMyKundlis}
            confirmMessage={t("clients.recomputeConfirm")}
            label={t("clients.recomputeButton")}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          />
        </div>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:text-zinc-400">
          {t("clients.empty")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:text-zinc-400 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium">{t("clients.tableName")}</th>
                <th className="px-4 py-3 font-medium">{t("clients.tablePhone")}</th>
                <th className="px-4 py-3 font-medium">{t("clients.tableEmail")}</th>
                <th className="px-4 py-3 font-medium">{t("clients.tableKundlis")}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-700">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{client.email ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{client._count.kundlis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

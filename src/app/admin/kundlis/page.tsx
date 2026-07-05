import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getTranslations } from "@/lib/i18n/server";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { recomputeAllKundlisAdmin } from "../actions";

export default async function AdminKundlisPage() {
  const admin = await requireUser();
  if (admin.role !== "ADMIN") notFound();
  const { t } = await getTranslations();

  const kundlis = await prisma.kundli.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { include: { user: { select: { email: true } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/users" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          {t("adminKundlis.back")}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t("adminKundlis.title")}</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("adminKundlis.subtitle")}</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900 dark:bg-amber-950/20">
        <h2 className="font-semibold text-amber-800 dark:text-amber-400">{t("clients.recomputeHeading")}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("adminKundlis.recomputeAllSubtitle")}</p>
        <div className="mt-3">
          <ConfirmSubmitForm
            action={recomputeAllKundlisAdmin}
            confirmMessage={t("clients.recomputeConfirm")}
            label={t("adminKundlis.recomputeAllButton")}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          />
        </div>
      </div>

      {kundlis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {t("adminKundlis.empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">{t("adminKundlis.kundli")}</th>
                <th className="px-4 py-2 font-medium">{t("adminKundlis.client")}</th>
                <th className="px-4 py-2 font-medium">{t("adminKundlis.owner")}</th>
                <th className="px-4 py-2 font-medium">{t("adminKundlis.created")}</th>
              </tr>
            </thead>
            <tbody>
              {kundlis.map((k) => (
                <tr key={k.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-2 font-medium">
                    <Link href={`/kundli/${k.id}`} className="text-amber-700 hover:underline dark:text-amber-500">
                      {k.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{k.client.name}</td>
                  <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{k.client.user.email}</td>
                  <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{new Date(k.createdAt).toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

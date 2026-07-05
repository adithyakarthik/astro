import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClassPayment, deleteClassPayment } from "@/app/classes/actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";

export default async function ClassPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "classes")) return <ModuleLocked moduleKey="classes" />;
  const { t } = await getTranslations();

  const { id } = await params;
  const cls = await prisma.classAnnouncement.findUnique({
    where: { id },
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });
  if (!cls || cls.userId !== user.id) notFound();

  const addPayment = createClassPayment.bind(null, cls.id);
  const totalCollected = cls.payments.reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/classes" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← {t("classes.title")}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{cls.title}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {t("classes.totalCollected")}: ₹{totalCollected.toFixed(0)} ({cls.payments.length} {t("classes.payments")})
        </p>
      </div>

      <form
        action={addPayment}
        className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.studentName")} *
          <input name="studentName" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.contact")}
          <input name="contact" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.amountPaid")} *
          <input
            name="amountPaid"
            type="number"
            step="1"
            min="0"
            required
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.paidAt")} *
          <input name="paidAt" type="datetime-local" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.notes")}
          <input name="notes" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
          {t("classes.recordPayment")}
        </button>
      </form>

      {cls.payments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:text-zinc-400">
          {t("classes.noPayments")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:text-zinc-400 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium">{t("classes.studentName")}</th>
                <th className="px-4 py-3 font-medium">{t("classes.contact")}</th>
                <th className="px-4 py-3 font-medium">{t("classes.amountPaid")}</th>
                <th className="px-4 py-3 font-medium">{t("classes.paidAt")}</th>
                <th className="px-4 py-3 font-medium">{t("common.notes")}</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {cls.payments.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium">{p.studentName}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.contact ?? "—"}</td>
                  <td className="px-4 py-3">₹{p.amountPaid.toFixed(0)}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {new Date(p.paidAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.notes ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmSubmitForm
                      action={deleteClassPayment.bind(null, cls.id, p.id)}
                      confirmMessage={t("kundli.confirmDelete")}
                      label={t("common.remove")}
                      className="text-xs text-red-500 hover:underline dark:text-red-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

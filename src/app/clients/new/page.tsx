import { createClient } from "../actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

export default async function NewClientPage() {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("clients.newTitle")}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("clients.newSubtitle")}</p>

      <form action={createClient} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("clients.fullName")} *
          <input name="name" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.phone")}
          <input name="phone" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.email")}
          <input name="email" type="email" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.notes")}
          <textarea name="notes" rows={3} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("clients.saveClient")}
        </button>
      </form>
    </div>
  );
}

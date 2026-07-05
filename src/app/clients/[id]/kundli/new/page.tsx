import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { createKundli } from "@/app/clients/actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { BirthPlaceLookup } from "@/components/BirthPlaceLookup";

export default async function NewKundliPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t } = await getTranslations();

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.userId !== user.id) notFound();

  const createKundliForClient = createKundli.bind(null, client.id);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("kundli.newTitleFor")} {client.name}
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("kundli.newSubtitle")}</p>

      <form
        action={createKundliForClient}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.chartName")} *
          <input
            name="name"
            required
            placeholder={client.name}
            defaultValue={client.name}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.gender")}
          <select name="gender" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            <option value="">{t("kundli.genderPreferNot")}</option>
            <option value="male">{t("kundli.male")}</option>
            <option value="female">{t("kundli.female")}</option>
            <option value="other">{t("kundli.other")}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.birthDateTime")} *
          <input
            name="birthDateLocal"
            type="datetime-local"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>

        <BirthPlaceLookup
          labels={{
            place: t("kundli.birthPlace"),
            lat: t("common.latitude"),
            lon: t("common.longitude"),
            find: t("kundli.findLocation"),
            tip: t("kundli.coordsTip"),
          }}
        />

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.notes")}
          <textarea name="notes" rows={4} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("kundli.generate")}
        </button>
      </form>
    </div>
  );
}

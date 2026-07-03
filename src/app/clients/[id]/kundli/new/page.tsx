import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { createKundli } from "@/app/clients/actions";
import { COMMON_TIMEZONES } from "@/lib/astro/birth-utils";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

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
      <p className="mt-1 text-zinc-600">{t("kundli.newSubtitle")}</p>

      <form
        action={createKundliForClient}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.chartName")} *
          <input
            name="name"
            required
            placeholder={client.name}
            defaultValue={client.name}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.gender")}
          <select name="gender" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
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
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.birthTimezone")} *
          <select
            name="timezoneOffsetMinutes"
            required
            defaultValue={330}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.label} value={tz.offsetMinutes}>
                {tz.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.birthPlace")} *
          <input
            name="birthPlace"
            required
            placeholder="e.g. Chennai, India"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("common.latitude")} *
            <input
              name="latitude"
              type="number"
              step="any"
              required
              placeholder="13.0827"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("common.longitude")} *
            <input
              name="longitude"
              type="number"
              step="any"
              required
              placeholder="80.2707"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <p className="-mt-2 text-xs text-zinc-500">{t("kundli.coordsTip")}</p>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("kundli.generate")}
        </button>
      </form>
    </div>
  );
}

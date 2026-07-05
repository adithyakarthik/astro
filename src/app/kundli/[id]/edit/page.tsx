import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateKundli } from "@/app/clients/actions";
import { utcToLocalParts } from "@/lib/astro/birth-utils";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { BirthPlaceLookup } from "@/components/BirthPlaceLookup";
import { ActionForm } from "@/components/ActionForm";

export default async function EditKundliPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t } = await getTranslations();

  const { id } = await params;
  const kundli = await prisma.kundli.findUnique({ where: { id }, include: { client: true } });
  if (!kundli || kundli.client.userId !== user.id) notFound();

  const updateThisKundli = updateKundli.bind(null, kundli.id);
  const local = utcToLocalParts(kundli.birthDate, kundli.timezoneOffsetMinutes);
  const birthDateLocalValue = `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(
    2,
    "0"
  )}T${String(local.hour).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("kundli.editTitleFor")} {kundli.client.name}
      </h1>

      <ActionForm
        action={updateThisKundli}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.chartName")} *
          <input
            name="name"
            required
            defaultValue={kundli.name}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("kundli.gender")}
          <select
            name="gender"
            defaultValue={kundli.gender ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
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
            defaultValue={birthDateLocalValue}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <BirthPlaceLookup
          defaultPlace={kundli.birthPlace}
          defaultLatitude={kundli.latitude}
          defaultLongitude={kundli.longitude}
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
          <textarea
            name="notes"
            rows={4}
            defaultValue={kundli.notes ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {t("kundli.save")}
          </button>
        </div>
      </ActionForm>
    </div>
  );
}

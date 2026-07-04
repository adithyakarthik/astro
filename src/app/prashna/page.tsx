import Link from "next/link";
import { computeKundli } from "@/lib/astro/engine";
import { RasiChartGrid } from "@/components/RasiChartGrid";
import { localizedChartNames } from "@/lib/astro/localized-names";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { BirthPlaceLookup } from "@/components/BirthPlaceLookup";

function groupBySign(planets: { planet: string; rasiIndex: number }[]) {
  const map: Record<number, string[]> = {};
  for (const p of planets) {
    map[p.rasiIndex] = map[p.rasiIndex] ? [...map[p.rasiIndex], p.planet] : [p.planet];
  }
  return map;
}

function fmtDeg(deg: number) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'`;
}

export default async function PrashnaPage({
  searchParams,
}: {
  searchParams: Promise<{ question?: string; birthPlace?: string; latitude?: string; longitude?: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "prashna")) return <ModuleLocked moduleKey="prashna" />;
  const { t, lang } = await getTranslations();
  const names = localizedChartNames(lang);

  const params = await searchParams;
  const latitude = params.latitude ? Number(params.latitude) : undefined;
  const longitude = params.longitude ? Number(params.longitude) : undefined;
  const hasCoords = latitude !== undefined && longitude !== undefined && !Number.isNaN(latitude) && !Number.isNaN(longitude);

  if (!hasCoords) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold tracking-tight">{t("prashna.title")}</h1>
        <p className="mt-1 text-zinc-600">{t("prashna.subtitle")}</p>

        <form method="GET" className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("prashna.question")}
            <textarea name="question" rows={2} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          </label>

          <BirthPlaceLookup
            labels={{
              place: t("prashna.place"),
              lat: t("common.latitude"),
              lon: t("common.longitude"),
              find: t("prashna.findLocation"),
            }}
          />

          <button
            type="submit"
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {t("prashna.castButton")}
          </button>
        </form>
      </div>
    );
  }

  const now = new Date();
  const chart = computeKundli({ utcDate: now, latitude, longitude });
  const rasiGroups = groupBySign(chart.planets);
  const moonPlacement = chart.planets.find((p) => p.planet === "Moon")!;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("prashna.resultHeading")}</h1>
          <p className="text-zinc-600">
            {t("prashna.castAt")} {now.toISOString().replace("T", " ").slice(0, 19)} UTC
            {params.birthPlace ? ` · ${params.birthPlace}` : ""} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
          </p>
          {params.question && <p className="mt-2 text-sm italic text-zinc-500">&ldquo;{params.question}&rdquo;</p>}
        </div>
        <Link href="/prashna" className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50">
          {t("prashna.newQuestion")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-8 rounded-xl border border-zinc-200 bg-white p-6">
        <RasiChartGrid
          title={t("kundli.rasiChart")}
          ascendantRasiIndex={chart.ascendant.rasiIndex}
          planetsBySign={rasiGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
          ascendantLabel={names.ascendantLabel}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">{t("kundli.planetaryPositions")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.graha")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.rasi")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.degree")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.nakshatra")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.pada")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium text-amber-700">{names.ascendantLabel}</td>
                <td className="py-1.5 pr-4">{names.rasi[chart.ascendant.rasiIndex]}</td>
                <td className="py-1.5 pr-4">{fmtDeg(chart.ascendant.degreeInSign)}</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
              </tr>
              {chart.planets.map((p) => (
                <tr key={p.planet} className="border-t border-zinc-100">
                  <td className="py-1.5 pr-4 font-medium">{names.planet[p.planet]}</td>
                  <td className="py-1.5 pr-4">{names.rasi[p.rasiIndex]}</td>
                  <td className="py-1.5 pr-4">{fmtDeg(p.degreeInSign)}</td>
                  <td className="py-1.5 pr-4">{names.nakshatra[p.nakshatraIndex]}</td>
                  <td className="py-1.5 pr-4">{p.pada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          {t("kundli.nakshatra")} ({t("kundli.graha")}: {names.planet.Moon}): {names.nakshatra[moonPlacement.nakshatraIndex]},{" "}
          {t("kundli.pada")} {moonPlacement.pada}
        </p>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-zinc-600">
        {t("prashna.interpretiveNote")}
      </p>
    </div>
  );
}

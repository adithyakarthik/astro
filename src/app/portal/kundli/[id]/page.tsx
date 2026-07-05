import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePortalClient } from "@/lib/auth/portal-session";
import type { ChartData, DashaPeriod } from "@/lib/astro/engine";
import { RasiChartGrid } from "@/components/RasiChartGrid";
import { PrintButton } from "@/components/PrintButton";
import { utcToLocalParts, formatOffset } from "@/lib/astro/birth-utils";
import { getTranslations } from "@/lib/i18n/server";
import { localizedChartNames } from "@/lib/astro/localized-names";

function groupBySign(chart: ChartData, key: "rasiIndex" | "navamsaRasiIndex") {
  const map: Record<number, string[]> = {};
  for (const p of chart.planets) {
    const sign = p[key];
    map[sign] = map[sign] ? [...map[sign], p.planet] : [p.planet];
  }
  return map;
}

function fmtDeg(deg: number) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'`;
}

function DashaRow({
  d,
  planetNames,
  depth = 0,
}: {
  d: DashaPeriod;
  planetNames: Record<string, string>;
  depth?: number;
}) {
  return (
    <>
      <tr className="border-t border-zinc-100 dark:border-zinc-800">
        <td className="py-1.5 pr-4 font-medium" style={{ paddingLeft: depth * 16 }}>
          {depth > 0 && <span className="text-zinc-300 dark:text-zinc-600">↳ </span>}
          {planetNames[d.planet]}
        </td>
        <td className="py-1.5 pr-4">{new Date(d.startDate).toISOString().slice(0, 10)}</td>
        <td className="py-1.5 pr-4">{new Date(d.endDate).toISOString().slice(0, 10)}</td>
        <td className="py-1.5 pr-4">{d.years.toFixed(2)} yrs</td>
      </tr>
      {d.antardashas.map((a, i) => (
        <DashaRow key={i} d={a} planetNames={planetNames} depth={depth + 1} />
      ))}
    </>
  );
}

export default async function PortalKundliPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const portalClient = await requirePortalClient();
  const { t, lang } = await getTranslations();
  const names = localizedChartNames(lang);

  const { id } = await params;
  const kundli = await prisma.kundli.findUnique({ where: { id } });
  if (!kundli || kundli.clientId !== portalClient.id) notFound();

  const chart = JSON.parse(kundli.chartData) as ChartData;
  const rasiGroups = groupBySign(chart, "rasiIndex");
  const navamsaGroups = groupBySign(chart, "navamsaRasiIndex");
  const local = utcToLocalParts(kundli.birthDate, kundli.timezoneOffsetMinutes);
  const localStr = `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")} ${String(
    local.hour
  ).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/portal" className="text-sm text-zinc-500 hover:underline print:hidden dark:text-zinc-400">
            ← {t("portal.myKundlis")}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight dark:text-zinc-100">{kundli.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t("portal.bornLabel")} {localStr} ({formatOffset(kundli.timezoneOffsetMinutes)}) · {kundli.birthPlace}
          </p>
        </div>
        <div className="print:hidden">
          <PrintButton
            label={t("kundli.print")}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <RasiChartGrid
          title={t("kundli.rasiChart")}
          ascendantRasiIndex={chart.ascendant.rasiIndex}
          planetsBySign={rasiGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
          ascendantLabel={names.ascendantLabel}
        />
        <RasiChartGrid
          title={t("kundli.navamsaChart")}
          ascendantRasiIndex={-1}
          planetsBySign={navamsaGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold dark:text-zinc-100">{t("kundli.planetaryPositions")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.graha")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.rasi")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.degree")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.nakshatra")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.pada")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium text-amber-700 dark:text-amber-500">{names.ascendantLabel}</td>
                <td className="py-1.5 pr-4">{names.rasi[chart.ascendant.rasiIndex]}</td>
                <td className="py-1.5 pr-4">{fmtDeg(chart.ascendant.degreeInSign)}</td>
                <td className="py-1.5 pr-4 text-zinc-400 dark:text-zinc-500">—</td>
                <td className="py-1.5 pr-4 text-zinc-400 dark:text-zinc-500">—</td>
              </tr>
              {chart.planets.map((p) => (
                <tr key={p.planet} className="border-t border-zinc-100 dark:border-zinc-800">
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
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-1 text-lg font-semibold dark:text-zinc-100">{t("kundli.vimshottariDasha")}</h2>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">{t("kundli.dashaHint")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.mahadashaCol")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.start")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.end")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.duration")}</th>
              </tr>
            </thead>
            <tbody>
              {chart.vimshottariDasha.map((d, i) => (
                <DashaRow key={i} d={d} planetNames={names.planet} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-zinc-600 print:hidden dark:border-amber-900 dark:bg-amber-950/20 dark:text-zinc-400">
        {t("portal.contactNote")}
      </p>
    </div>
  );
}

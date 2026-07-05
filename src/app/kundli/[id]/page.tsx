import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RasiChartGrid } from "@/components/RasiChartGrid";
import { NorthIndianChartGrid } from "@/components/NorthIndianChartGrid";
import { Tabs } from "@/components/Tabs";
import type { ChartData, DashaPeriod } from "@/lib/astro/engine";
import { NADI_BY_NAKSHATRA } from "@/lib/astro/constants";
import { localizedChartNames } from "@/lib/astro/localized-names";
import { utcToLocalParts, formatOffset } from "@/lib/astro/birth-utils";
import {
  VARGA_KEYS,
  VARGA_LABELS,
  VARGA_SIGNIFICANCE,
  computeVargaChart,
  groupVargaBySign,
  type VargaKey,
} from "@/lib/astro/vargas";
import { computeKpTable } from "@/lib/astro/kp";
import { computeArudhaLagna, computeCharaKarakas, computeKarakamsha } from "@/lib/astro/jaimini";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { deleteKundli } from "@/app/clients/actions";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { PrintButton } from "@/components/PrintButton";

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
          {depth > 0 && <span className="text-zinc-300">↳ </span>}
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

export default async function KundliDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ varga?: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t, lang } = await getTranslations();
  const names = localizedChartNames(lang);
  const ChartGrid = user.chartStyle === "north" ? NorthIndianChartGrid : RasiChartGrid;

  const { id } = await params;
  const { varga } = await searchParams;
  const kundli = await prisma.kundli.findUnique({
    where: { id },
    include: { client: { include: { user: { select: { email: true } } } } },
  });
  if (!kundli || (kundli.client.userId !== user.id && user.role !== "ADMIN")) notFound();

  const chart = JSON.parse(kundli.chartData) as ChartData;
  const rasiGroups = groupBySign(chart, "rasiIndex");
  const navamsaGroups = groupBySign(chart, "navamsaRasiIndex");
  const navamsaChart = computeVargaChart("D9", chart);
  const deleteThisKundli = deleteKundli.bind(null, kundli.id);

  const selectedVarga: VargaKey = (VARGA_KEYS as string[]).includes(varga ?? "") ? (varga as VargaKey) : "D10";
  const selectedVargaChart = computeVargaChart(selectedVarga, chart);
  const selectedVargaGroups = groupVargaBySign(selectedVargaChart);

  const kpRows = computeKpTable(chart);
  const charaKarakas = computeCharaKarakas(chart);
  const atmakaraka = charaKarakas[0].planet;
  const arudhaLagnaRasi = computeArudhaLagna(chart);
  const karakamshaRasi = computeKarakamsha(chart, atmakaraka);
  const local = utcToLocalParts(kundli.birthDate, kundli.timezoneOffsetMinutes);
  const localStr = `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")} ${String(
    local.hour
  ).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`;

  const moonPlacement = chart.planets.find((p) => p.planet === "Moon")!;
  const isOwner = kundli.client.userId === user.id;

  const overviewTab = (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-semibold">{t("kundli.notes")}</h2>
        {kundli.notes ? (
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{kundli.notes}</p>
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">{t("kundli.notesEmpty")}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <ChartGrid
          title={t("kundli.rasiChart")}
          ascendantRasiIndex={chart.ascendant.rasiIndex}
          planetsBySign={rasiGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
          ascendantLabel={names.ascendantLabel}
        />
        <ChartGrid
          title={t("kundli.navamsaChart")}
          ascendantRasiIndex={navamsaChart.ascendantRasiIndex}
          planetsBySign={navamsaGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
          ascendantLabel={names.ascendantLabel}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="mb-3 text-lg font-semibold">{t("kundli.planetaryPositions")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.graha")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.rasi")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.degree")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.nakshatra")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.pada")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.navamsa")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium text-amber-700 dark:text-amber-500">{names.ascendantLabel}</td>
                <td className="py-1.5 pr-4">{names.rasi[chart.ascendant.rasiIndex]}</td>
                <td className="py-1.5 pr-4">{fmtDeg(chart.ascendant.degreeInSign)}</td>
                <td className="py-1.5 pr-4 text-zinc-400 dark:text-zinc-500">—</td>
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
                  <td className="py-1.5 pr-4">{names.rasi[p.navamsaRasiIndex]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="mb-1 text-lg font-semibold">{t("kundli.vimshottariDasha")}</h2>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t("kundli.moonNakshatraAtBirth")}: {names.nakshatra[moonPlacement.nakshatraIndex]}, {t("kundli.pada")}{" "}
          {chart.moonNakshatra.pada}. {t("kundli.dashaHint")}
        </p>
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
    </>
  );

  const referenceRasiChart = (
    <div className="flex flex-wrap gap-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
      <ChartGrid
        title={t("kundli.rasiChart")}
        ascendantRasiIndex={chart.ascendant.rasiIndex}
        planetsBySign={rasiGroups}
        rasiNames={names.rasi}
        planetAbbr={names.planetShort}
        ascendantLabel={names.ascendantLabel}
      />
    </div>
  );

  const divisionalTab = (
    <>
      {referenceRasiChart}
      <div className="rounded-xl border border-indigo-200 bg-white p-6 dark:bg-zinc-900 dark:border-indigo-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-400">{t("kundli.divisionalCharts")}</h2>
        <form method="GET" className="flex items-center gap-2 print:hidden">
          <select
            name="varga"
            defaultValue={selectedVarga}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {VARGA_KEYS.map((key) => (
              <option key={key} value={key}>
                {VARGA_LABELS[key]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {t("kundli.selectChart")}
          </button>
        </form>
      </div>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{VARGA_SIGNIFICANCE[selectedVarga]}</p>
      <ChartGrid
        title={VARGA_LABELS[selectedVarga]}
        ascendantRasiIndex={selectedVargaChart.ascendantRasiIndex}
        planetsBySign={selectedVargaGroups}
        rasiNames={names.rasi}
        planetAbbr={names.planetShort}
        ascendantLabel={names.ascendantLabel}
      />
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("kundli.divisionalChartsNote")}</p>
      </div>
    </>
  );

  const kpTab = (
    <>
      {referenceRasiChart}
      <div className="rounded-xl border border-blue-200 bg-white p-6 dark:bg-zinc-900 dark:border-blue-900">
      <h2 className="mb-3 text-lg font-semibold text-blue-800 dark:text-blue-400">{t("kundli.kpHeading")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.graha")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.rasi")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.degree")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.starLord")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.subLord")}</th>
            </tr>
          </thead>
          <tbody>
            {kpRows.map((row) => (
              <tr key={row.label} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium">
                  {row.label === "Ascendant" ? names.ascendantLabel : names.planet[row.label as keyof typeof names.planet]}
                </td>
                <td className="py-1.5 pr-4">{names.rasi[row.rasiIndex]}</td>
                <td className="py-1.5 pr-4">{fmtDeg(row.degreeInSign)}</td>
                <td className="py-1.5 pr-4">{names.planet[row.starLord]}</td>
                <td className="py-1.5 pr-4">{names.planet[row.subLord]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("kundli.kpNote")}</p>
      </div>
    </>
  );

  const jaiminiTab = (
    <>
      {referenceRasiChart}
      <div className="rounded-xl border border-violet-200 bg-white p-6 dark:bg-zinc-900 dark:border-violet-900">
      <h2 className="mb-3 text-lg font-semibold text-violet-800 dark:text-violet-400">{t("kundli.jaiminiHeading")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full max-w-md text-left text-sm">
          <thead className="text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.karakaCol")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.graha")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.degree")}</th>
            </tr>
          </thead>
          <tbody>
            {charaKarakas.map((k) => (
              <tr key={k.label} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium">{k.label}</td>
                <td className="py-1.5 pr-4">{names.planet[k.planet]}</td>
                <td className="py-1.5 pr-4">{fmtDeg(k.degreeInSign)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <table className="mt-4 w-full max-w-md text-left text-sm">
        <tbody>
          <tr className="border-t border-zinc-200 dark:border-zinc-800">
            <td className="py-1.5 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t("kundli.arudhaLagna")}</td>
            <td className="py-1.5 pr-4">{names.rasi[arudhaLagnaRasi]}</td>
          </tr>
          <tr className="border-t border-zinc-200 dark:border-zinc-800">
            <td className="py-1.5 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t("kundli.karakamsha")}</td>
            <td className="py-1.5 pr-4">{names.rasi[karakamshaRasi]}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("kundli.jaiminiNote")}</p>
      </div>
    </>
  );

  const nadiTab = (
    <>
      {referenceRasiChart}
      <div className="rounded-xl border border-teal-200 bg-white p-6 dark:bg-zinc-900 dark:border-teal-900">
      <h2 className="mb-3 text-lg font-semibold text-teal-800 dark:text-teal-400">{t("kundli.nadiHeading")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full max-w-md text-left text-sm">
          <thead className="text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.graha")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.nakshatra")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.nadiHeading")}</th>
            </tr>
          </thead>
          <tbody>
            {chart.planets.map((p) => (
              <tr key={p.planet} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium">{names.planet[p.planet]}</td>
                <td className="py-1.5 pr-4">{names.nakshatra[p.nakshatraIndex]}</td>
                <td className="py-1.5 pr-4">{NADI_BY_NAKSHATRA[p.nakshatraIndex]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("kundli.nadiNote")}</p>
      </div>
    </>
  );

  const jamakkolTab = (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 dark:bg-amber-950/20 dark:border-amber-900">
      <h2 className="mb-1 text-lg font-semibold text-amber-800 dark:text-amber-400">{t("kundli.jamakkolHeading")}</h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t("kundli.jamakkolSubtitle")}</p>

      <table className="mb-4 w-full max-w-md text-left text-sm">
        <tbody>
          <tr className="border-t border-zinc-200 dark:border-zinc-800">
            <td className="py-1 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t("kundli.jamakkolName")}</td>
            <td className="py-1">{kundli.name}</td>
          </tr>
          <tr className="border-t border-zinc-200 dark:border-zinc-800">
            <td className="py-1 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t("kundli.jamakkolPlace")}</td>
            <td className="py-1">{kundli.birthPlace}</td>
          </tr>
          <tr className="border-t border-zinc-200 dark:border-zinc-800">
            <td className="py-1 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t("kundli.nakshatra")}</td>
            <td className="py-1">
              {names.nakshatra[moonPlacement.nakshatraIndex]} — {t("kundli.pada")} {chart.moonNakshatra.pada}
            </td>
          </tr>
          <tr className="border-t border-zinc-200 dark:border-zinc-800">
            <td className="py-1 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t("kundli.jamakkolMoonRasi")}</td>
            <td className="py-1">{names.rasi[moonPlacement.rasiIndex]}</td>
          </tr>
          <tr className="border-t border-zinc-200 dark:border-zinc-800">
            <td className="py-1 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{names.ascendantLabel}</td>
            <td className="py-1">{names.rasi[chart.ascendant.rasiIndex]}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-wrap gap-8 rounded-xl border border-amber-200 bg-white p-6 dark:bg-zinc-900 dark:border-amber-900">
        <RasiChartGrid
          title={`${t("kundli.rasiChart")}`}
          ascendantRasiIndex={chart.ascendant.rasiIndex}
          planetsBySign={rasiGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
          ascendantLabel={names.ascendantLabel}
        />
        <RasiChartGrid
          title={`${t("kundli.navamsaChart")}`}
          ascendantRasiIndex={navamsaChart.ascendantRasiIndex}
          planetsBySign={navamsaGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
          ascendantLabel={names.ascendantLabel}
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white p-6 dark:bg-zinc-900 dark:border-amber-900">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.graha")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.rasi")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.nakshatra")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.pada")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="py-1.5 pr-4 font-medium text-amber-700 dark:text-amber-500">{names.ascendantLabel}</td>
              <td className="py-1.5 pr-4">{names.rasi[chart.ascendant.rasiIndex]}</td>
              <td className="py-1.5 pr-4 text-zinc-400 dark:text-zinc-500">—</td>
              <td className="py-1.5 pr-4 text-zinc-400 dark:text-zinc-500">—</td>
            </tr>
            {chart.planets.map((p) => (
              <tr key={p.planet} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium">{names.planet[p.planet]}</td>
                <td className="py-1.5 pr-4">{names.rasi[p.rasiIndex]}</td>
                <td className="py-1.5 pr-4">{names.nakshatra[p.nakshatraIndex]}</td>
                <td className="py-1.5 pr-4">{p.pada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white p-6 dark:bg-zinc-900 dark:border-amber-900">
        <h3 className="mb-3 font-semibold">{t("kundli.jamakkolDasaBukthi")}</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.mahadashaCol")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.start")}</th>
              <th className="py-1.5 pr-4 font-medium">{t("kundli.end")}</th>
            </tr>
          </thead>
          <tbody>
            {chart.vimshottariDasha.map((d, i) => (
              <Fragment key={i}>
                <tr className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 pr-4 font-medium">{names.planet[d.planet]}</td>
                  <td className="py-1.5 pr-4">{new Date(d.startDate).toISOString().slice(0, 10)}</td>
                  <td className="py-1.5 pr-4">{new Date(d.endDate).toISOString().slice(0, 10)}</td>
                </tr>
                {d.antardashas.map((a, j) => (
                  <tr key={j} className="border-t border-zinc-50 text-zinc-500 dark:text-zinc-400">
                    <td className="py-1 pr-4 pl-4">↳ {names.planet[a.planet]}</td>
                    <td className="py-1 pr-4">{new Date(a.startDate).toISOString().slice(0, 10)}</td>
                    <td className="py-1 pr-4">{new Date(a.endDate).toISOString().slice(0, 10)}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {isOwner ? (
            <Link href={`/clients/${kundli.clientId}`} className="text-sm text-zinc-500 hover:underline print:hidden dark:text-zinc-400">
              ← {kundli.client.name}
            </Link>
          ) : (
            <Link href="/admin/kundlis" className="text-sm text-zinc-500 hover:underline print:hidden dark:text-zinc-400">
              ← {t("adminKundlis.back")}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{kundli.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Born {localStr} ({formatOffset(kundli.timezoneOffsetMinutes)}) · {kundli.birthPlace} (
            {kundli.latitude.toFixed(4)}, {kundli.longitude.toFixed(4)}) · Ayanamsa used:{" "}
            {fmtDeg(chart.ayanamsaUsed)} (Lahiri, approximate)
          </p>
          {!isOwner && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {t("adminKundlis.client")}: {kundli.client.name} · {t("adminKundlis.owner")}: {kundli.client.user.email}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2 print:hidden">
          <PrintButton
            label={t("kundli.print")}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          />
          {isOwner && (
            <>
              <Link
                href={`/kundli/${kundli.id}/edit`}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                {t("kundli.edit")}
              </Link>
              <ConfirmSubmitForm
                action={deleteThisKundli}
                confirmMessage={t("kundli.confirmDelete")}
                label={t("kundli.delete")}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 dark:text-red-400"
              />
            </>
          )}
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: t("kundli.tabOverview"), icon: "🪐", content: overviewTab },
          { id: "divisional", label: t("kundli.tabDivisional"), icon: "🔷", content: divisionalTab },
          { id: "kp", label: t("kundli.tabKp"), icon: "🔭", content: kpTab },
          { id: "jaimini", label: t("kundli.tabJaimini"), icon: "🪷", content: jaiminiTab },
          { id: "nadi", label: t("kundli.tabNadi"), icon: "🧵", content: nadiTab },
          { id: "jamakkol", label: t("kundli.tabJamakkol"), icon: "🕉️", content: jamakkolTab },
        ]}
      />
    </div>
  );
}

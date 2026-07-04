import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RasiChartGrid } from "@/components/RasiChartGrid";
import type { ChartData, DashaPeriod } from "@/lib/astro/engine";
import {
  TAMIL_NAKSHATRA_NAMES,
  TAMIL_PLANET_NAMES,
  TAMIL_PLANET_SHORT,
  TAMIL_RASI_NAMES,
} from "@/lib/astro/constants";
import { localizedChartNames } from "@/lib/astro/localized-names";
import { utcToLocalParts, formatOffset } from "@/lib/astro/birth-utils";
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
      <tr className="border-t border-zinc-100">
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
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t, lang } = await getTranslations();
  const names = localizedChartNames(lang);

  const { id } = await params;
  const kundli = await prisma.kundli.findUnique({ where: { id }, include: { client: true } });
  if (!kundli || kundli.client.userId !== user.id) notFound();

  const chart = JSON.parse(kundli.chartData) as ChartData;
  const rasiGroups = groupBySign(chart, "rasiIndex");
  const navamsaGroups = groupBySign(chart, "navamsaRasiIndex");
  const deleteThisKundli = deleteKundli.bind(null, kundli.id);
  const local = utcToLocalParts(kundli.birthDate, kundli.timezoneOffsetMinutes);
  const localStr = `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")} ${String(
    local.hour
  ).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/clients/${kundli.clientId}`} className="text-sm text-zinc-500 hover:underline print:hidden">
            ← {kundli.client.name}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{kundli.name}</h1>
          <p className="text-zinc-600">
            Born {localStr} ({formatOffset(kundli.timezoneOffsetMinutes)}) · {kundli.birthPlace} (
            {kundli.latitude.toFixed(4)}, {kundli.longitude.toFixed(4)}) · Ayanamsa used:{" "}
            {fmtDeg(chart.ayanamsaUsed)} (Lahiri, approximate)
          </p>
        </div>
        <div className="flex shrink-0 gap-2 print:hidden">
          <PrintButton
            label={t("kundli.print")}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          />
          <Link
            href={`/kundli/${kundli.id}/edit`}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          >
            {t("kundli.edit")}
          </Link>
          <ConfirmSubmitForm
            action={deleteThisKundli}
            confirmMessage={t("kundli.confirmDelete")}
            label={t("kundli.delete")}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          />
        </div>
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
        <RasiChartGrid
          title={t("kundli.navamsaChart")}
          ascendantRasiIndex={-1}
          planetsBySign={navamsaGroups}
          rasiNames={names.rasi}
          planetAbbr={names.planetShort}
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
                <th className="py-1.5 pr-4 font-medium">{t("kundli.navamsa")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium text-amber-700">{names.ascendantLabel}</td>
                <td className="py-1.5 pr-4">{names.rasi[chart.ascendant.rasiIndex]}</td>
                <td className="py-1.5 pr-4">{fmtDeg(chart.ascendant.degreeInSign)}</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
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
                  <td className="py-1.5 pr-4">{names.rasi[p.navamsaRasiIndex]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold">{t("kundli.vimshottariDasha")}</h2>
        <p className="mb-3 text-sm text-zinc-500">
          {t("kundli.moonNakshatraAtBirth")}: {names.nakshatra[chart.planets.find((p) => p.planet === "Moon")!.nakshatraIndex]}
          , {t("kundli.pada")} {chart.moonNakshatra.pada}. {t("kundli.dashaHint")}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
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

      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6">
        <h2 className="mb-1 text-lg font-semibold">ஜாதகம் — Tamil Jathakam (Jamakkol style)</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Same chart, presented with traditional Tamil terminology and the South Indian (Jamakkol) chart layout.
        </p>

        <table className="mb-4 w-full max-w-md text-left text-sm">
          <tbody>
            <tr className="border-t border-zinc-200">
              <td className="py-1 pr-4 font-medium text-zinc-500">பெயர் (Name)</td>
              <td className="py-1">{kundli.name}</td>
            </tr>
            <tr className="border-t border-zinc-200">
              <td className="py-1 pr-4 font-medium text-zinc-500">ஊர் (Place)</td>
              <td className="py-1">{kundli.birthPlace}</td>
            </tr>
            <tr className="border-t border-zinc-200">
              <td className="py-1 pr-4 font-medium text-zinc-500">நட்சத்திரம் (Nakshatra)</td>
              <td className="py-1">
                {TAMIL_NAKSHATRA_NAMES[chart.planets.find((p) => p.planet === "Moon")!.nakshatraIndex]} — பாதம்{" "}
                {chart.moonNakshatra.pada}
              </td>
            </tr>
            <tr className="border-t border-zinc-200">
              <td className="py-1 pr-4 font-medium text-zinc-500">ராசி (Moon rasi)</td>
              <td className="py-1">{TAMIL_RASI_NAMES[chart.planets.find((p) => p.planet === "Moon")!.rasiIndex]}</td>
            </tr>
            <tr className="border-t border-zinc-200">
              <td className="py-1 pr-4 font-medium text-zinc-500">லக்னம் (Lagna)</td>
              <td className="py-1">{TAMIL_RASI_NAMES[chart.ascendant.rasiIndex]}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-wrap gap-8 rounded-xl border border-amber-200 bg-white p-6">
          <RasiChartGrid
            title="ராசி (D1)"
            ascendantRasiIndex={chart.ascendant.rasiIndex}
            planetsBySign={rasiGroups}
            rasiNames={TAMIL_RASI_NAMES}
            planetAbbr={TAMIL_PLANET_SHORT}
            ascendantLabel="லக்"
          />
          <RasiChartGrid
            title="நவாம்சம் (D9)"
            ascendantRasiIndex={-1}
            planetsBySign={navamsaGroups}
            rasiNames={TAMIL_RASI_NAMES}
            planetAbbr={TAMIL_PLANET_SHORT}
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white p-6">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 pr-4 font-medium">கிரகம்</th>
                <th className="py-1.5 pr-4 font-medium">ராசி</th>
                <th className="py-1.5 pr-4 font-medium">நட்சத்திரம்</th>
                <th className="py-1.5 pr-4 font-medium">பாதம்</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium text-amber-700">லக்னம்</td>
                <td className="py-1.5 pr-4">{TAMIL_RASI_NAMES[chart.ascendant.rasiIndex]}</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
              </tr>
              {chart.planets.map((p) => (
                <tr key={p.planet} className="border-t border-zinc-100">
                  <td className="py-1.5 pr-4 font-medium">{TAMIL_PLANET_NAMES[p.planet]}</td>
                  <td className="py-1.5 pr-4">{TAMIL_RASI_NAMES[p.rasiIndex]}</td>
                  <td className="py-1.5 pr-4">{TAMIL_NAKSHATRA_NAMES[p.nakshatraIndex]}</td>
                  <td className="py-1.5 pr-4">{p.pada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white p-6">
          <h3 className="mb-3 font-semibold">தசா புக்தி (Dasa-Bukthi)</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 pr-4 font-medium">தசை / புக்தி</th>
                <th className="py-1.5 pr-4 font-medium">தொடக்கம்</th>
                <th className="py-1.5 pr-4 font-medium">முடிவு</th>
              </tr>
            </thead>
            <tbody>
              {chart.vimshottariDasha.map((d, i) => (
                <Fragment key={i}>
                  <tr className="border-t border-zinc-100">
                    <td className="py-1.5 pr-4 font-medium">{TAMIL_PLANET_NAMES[d.planet]}</td>
                    <td className="py-1.5 pr-4">{new Date(d.startDate).toISOString().slice(0, 10)}</td>
                    <td className="py-1.5 pr-4">{new Date(d.endDate).toISOString().slice(0, 10)}</td>
                  </tr>
                  {d.antardashas.map((a, j) => (
                    <tr key={j} className="border-t border-zinc-50 text-zinc-500">
                      <td className="py-1 pr-4 pl-4">↳ {TAMIL_PLANET_NAMES[a.planet]}</td>
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
    </div>
  );
}

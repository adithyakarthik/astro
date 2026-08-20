import Link from "next/link";
import { computeKundli } from "@/lib/astro/engine";
import { RasiChartGrid } from "@/components/RasiChartGrid";
import { localizedChartNames } from "@/lib/astro/localized-names";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { BirthPlaceLookup } from "@/components/BirthPlaceLookup";
import { PredictionPanel } from "@/components/PredictionPanel";
import { generatePredictionAction } from "@/app/predictions/actions";
import { PREDICTION_TOPICS, type PredictionTopic } from "@/lib/ai/predictions";
import { isDaytimeAt } from "@/lib/astro/panchang";
import { computeJamakkolSensitivePoints, type SensitivePointResult } from "@/lib/astro/jamakkol-sensitive-points";
import type { TranslationKey } from "@/lib/i18n/server";

const PREDICTION_TOPIC_KEYS: Record<PredictionTopic, TranslationKey> = {
  profession: "predictions.topicProfession",
  health: "predictions.topicHealth",
  family: "predictions.topicFamily",
  children: "predictions.topicChildren",
  wealthMoney: "predictions.topicWealthMoney",
  foreignTravel: "predictions.topicForeignTravel",
  parents: "predictions.topicParents",
  siblings: "predictions.topicSiblings",
  property: "predictions.topicProperty",
};

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
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("prashna.subtitle")}</p>

        <form method="GET" className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("prashna.question")}
            <textarea name="question" rows={2} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
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
            className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
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
  const sunPlacement = chart.planets.find((p) => p.planet === "Sun")!;

  const isDaytime = isDaytimeAt(now, latitude, longitude);
  const jamakkolPoints = computeJamakkolSensitivePoints(sunPlacement.siderealLongitude, now.getUTCDay(), isDaytime);

  const predictionTopics = PREDICTION_TOPICS.map((topic) => ({
    value: topic,
    label: t(PREDICTION_TOPIC_KEYS[topic]),
  }));
  const predictionContext = params.question ? `Prashna question: "${params.question}"` : "Prashna (horary) chart, no specific question recorded";
  const generateForThisPrashna = generatePredictionAction.bind(null, JSON.stringify(chart), predictionContext);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("prashna.resultHeading")}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t("prashna.castAt")} {now.toISOString().replace("T", " ").slice(0, 19)} UTC
            {params.birthPlace ? ` · ${params.birthPlace}` : ""} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
          </p>
          {params.question && <p className="mt-2 text-sm italic text-zinc-500 dark:text-zinc-400">&ldquo;{params.question}&rdquo;</p>}
        </div>
        <Link href="/prashna" className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
          {t("prashna.newQuestion")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-8 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <RasiChartGrid
          title={t("kundli.rasiChart")}
          ascendantRasiIndex={chart.ascendant.rasiIndex}
          planetsBySign={rasiGroups}
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
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t("kundli.nakshatra")} ({t("kundli.graha")}: {names.planet.Moon}): {names.nakshatra[moonPlacement.nakshatraIndex]},{" "}
          {t("kundli.pada")} {moonPlacement.pada}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">{t("jamakkolSensitive.heading")}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("jamakkolSensitive.subtitle")}</p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("jamakkolSensitive.dayNightLabel")}: <span className="font-medium">{isDaytime ? t("jamakkolSensitive.dayTime") : t("jamakkolSensitive.nightTime")}</span>
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-1.5 pr-4 font-medium">{t("jamakkolSensitive.point")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.rasi")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.degree")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.nakshatra")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("kundli.pada")}</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["rahuKaalam", jamakkolPoints.rahuKaalam],
                  ["yamaGandam", jamakkolPoints.yamaGandam],
                  ["mrithyu", jamakkolPoints.mrithyu],
                  ["maandhi", jamakkolPoints.maandhi],
                ] as [keyof typeof jamakkolPoints, SensitivePointResult][]
              ).map(([key, r]) => (
                <tr key={key} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 pr-4 font-medium">{t(`jamakkolSensitive.${key}`)}</td>
                  <td className="py-1.5 pr-4">{names.rasi[r.rasiIndex]}</td>
                  <td className="py-1.5 pr-4">{fmtDeg(r.degreeInSign)}</td>
                  <td className="py-1.5 pr-4">{names.nakshatra[r.nakshatraIndex]}</td>
                  <td className="py-1.5 pr-4">{r.pada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <li>
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("jamakkolSensitive.rahuKaalam")}:</span> {t("jamakkolSensitive.rahuKaalamNote")}
          </li>
          <li>
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("jamakkolSensitive.yamaGandam")}:</span> {t("jamakkolSensitive.yamaGandamNote")}
          </li>
          <li>
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("jamakkolSensitive.mrithyu")}:</span> {t("jamakkolSensitive.mrithyuNote")}
          </li>
          <li>
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("jamakkolSensitive.maandhi")}:</span> {t("jamakkolSensitive.maandhiNote")}
          </li>
          {!isDaytime && <li className="italic">{t("jamakkolSensitive.nightUncertaintyNote")}</li>}
        </ul>
      </div>

      <PredictionPanel
        action={generateForThisPrashna}
        topics={predictionTopics}
        labels={{
          heading: t("predictions.heading"),
          subtitle: t("predictions.subtitle"),
          generateButton: t("predictions.generateButton"),
          loading: t("predictions.loading"),
          predictionHeading: t("predictions.predictionHeading"),
          reasoningHeading: t("predictions.reasoningHeading"),
          notConfigured: t("predictions.notConfigured"),
          genericError: t("predictions.genericError"),
        }}
      />

      <p className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-zinc-600 dark:text-zinc-400 dark:bg-amber-950/20 dark:border-amber-900">
        {t("prashna.interpretiveNote")}
      </p>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { computeCurrentTransits } from "@/lib/astro/transit";
import type { ChartData } from "@/lib/astro/engine";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

function fmtDeg(deg: number) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'`;
}

export default async function TransitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "transits")) return <ModuleLocked moduleKey="transits" />;
  const { t } = await getTranslations();

  const params = await searchParams;
  const asOf = params.date ? new Date(`${params.date}T12:00:00Z`) : new Date();

  const kundlis = await prisma.kundli.findMany({
    where: { client: { userId: user.id } },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  const selectedKundli = params.kundliId
    ? kundlis.find((k) => k.id === params.kundliId)
    : undefined;

  let ascRef: number | undefined;
  let moonRef: number | undefined;
  if (selectedKundli) {
    const chart = JSON.parse(selectedKundli.chartData) as ChartData;
    ascRef = chart.ascendant.rasiIndex;
    moonRef = chart.planets.find((p) => p.planet === "Moon")?.rasiIndex;
  }

  const transits = computeCurrentTransits(asOf, ascRef, moonRef);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("transits.title")}</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("transits.subtitle")}</p>
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.date")}
          <input
            name="date"
            type="date"
            defaultValue={asOf.toISOString().slice(0, 10)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("transits.compareKundli")}
          <select name="kundliId" defaultValue={params.kundliId ?? ""} className="min-w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            <option value="">{t("transits.noneOption")}</option>
            {kundlis.map((k) => (
              <option key={k.id} value={k.id}>
                {k.client.name} — {k.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
          {t("transits.show")}
        </button>
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="mb-3 text-lg font-semibold">
          {t("transits.positionsAsOf")} {transits.asOf.toISOString().slice(0, 10)} (UTC)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-1.5 pr-4 font-medium">{t("transits.graha")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("transits.rasi")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("transits.degree")}</th>
                <th className="py-1.5 pr-4 font-medium">{t("transits.nakshatra")}</th>
                {selectedKundli && <th className="py-1.5 pr-4 font-medium">{t("transits.houseFromAsc")}</th>}
                {selectedKundli && <th className="py-1.5 pr-4 font-medium">{t("transits.houseFromMoon")}</th>}
              </tr>
            </thead>
            <tbody>
              {transits.planets.map((p) => (
                <tr key={p.planet} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 pr-4 font-medium">{p.planet}</td>
                  <td className="py-1.5 pr-4">{p.rasiName}</td>
                  <td className="py-1.5 pr-4">{fmtDeg(p.degreeInSign)}</td>
                  <td className="py-1.5 pr-4">{p.nakshatraName}</td>
                  {selectedKundli && <td className="py-1.5 pr-4">{p.houseFromAscendant}</td>}
                  {selectedKundli && <td className="py-1.5 pr-4">{p.houseFromMoon}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedKundli && (
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            {t("transits.referenceChart")}: {selectedKundli.client.name} — {selectedKundli.name}.
          </p>
        )}
      </div>
    </div>
  );
}

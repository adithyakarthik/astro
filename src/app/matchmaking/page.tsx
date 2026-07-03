import { prisma } from "@/lib/db";
import { computeAshtakootMilan } from "@/lib/astro/matching";
import type { ChartData } from "@/lib/astro/engine";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

function moonPlacementFromChart(chartData: string) {
  const chart = JSON.parse(chartData) as ChartData;
  const moon = chart.planets.find((p) => p.planet === "Moon")!;
  return { nakshatraIndex: moon.nakshatraIndex, rasiIndex: moon.rasiIndex, nakshatraName: moon.nakshatraName, rasiName: moon.rasiName };
}

export default async function MatchmakingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "matchmaking")) return <ModuleLocked moduleKey="matchmaking" />;
  const { t } = await getTranslations();

  const params = await searchParams;
  const kundlis = await prisma.kundli.findMany({
    where: { client: { userId: user.id } },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  const boyKundli = params.boyId ? kundlis.find((k) => k.id === params.boyId) : undefined;
  const girlKundli = params.girlId ? kundlis.find((k) => k.id === params.girlId) : undefined;

  const result =
    boyKundli && girlKundli
      ? computeAshtakootMilan(
          moonPlacementFromChart(boyKundli.chartData),
          moonPlacementFromChart(girlKundli.chartData)
        )
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("matchmaking.title")}</h1>
        <p className="mt-1 text-zinc-600">{t("matchmaking.subtitle")}</p>
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-5">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("matchmaking.personA")}
          <select name="boyId" defaultValue={params.boyId ?? ""} className="min-w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="">{t("matchmaking.selectKundli")}</option>
            {kundlis.map((k) => (
              <option key={k.id} value={k.id}>
                {k.client.name} — {k.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("matchmaking.personB")}
          <select name="girlId" defaultValue={params.girlId ?? ""} className="min-w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="">{t("matchmaking.selectKundli")}</option>
            {kundlis.map((k) => (
              <option key={k.id} value={k.id}>
                {k.client.name} — {k.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          {t("matchmaking.check")}
        </button>
      </form>

      {kundlis.length < 2 && (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          {t("matchmaking.needTwo")}
        </p>
      )}

      {result && boyKundli && girlKundli && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">
              {boyKundli.client.name} ✕ {girlKundli.client.name}
            </h2>
            <div className="text-2xl font-semibold">
              {result.totalPoints} / {result.maxPoints}
            </div>
          </div>
          <p
            className={`mb-4 rounded-lg p-3 text-sm ${
              result.hasNadiDosha ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {result.verdict}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="py-1.5 pr-4 font-medium">{t("matchmaking.koot")}</th>
                  <th className="py-1.5 pr-4 font-medium">{t("matchmaking.points")}</th>
                  <th className="py-1.5 pr-4 font-medium">{t("matchmaking.note")}</th>
                </tr>
              </thead>
              <tbody>
                {result.koots.map((k) => (
                  <tr key={k.name} className="border-t border-zinc-100">
                    <td className="py-1.5 pr-4 font-medium">{k.name}</td>
                    <td className="py-1.5 pr-4">
                      {k.points} / {k.maxPoints}
                    </td>
                    <td className="py-1.5 pr-4 text-zinc-600">{k.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-zinc-500">{t("matchmaking.disclaimer")}</p>
        </div>
      )}
    </div>
  );
}

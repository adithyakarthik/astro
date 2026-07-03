import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RasiChartGrid } from "@/components/RasiChartGrid";
import type { ChartData } from "@/lib/astro/engine";

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

export default async function KundliDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kundli = await prisma.kundli.findUnique({ where: { id }, include: { client: true } });
  if (!kundli) notFound();

  const chart = JSON.parse(kundli.chartData) as ChartData;
  const rasiGroups = groupBySign(chart, "rasiIndex");
  const navamsaGroups = groupBySign(chart, "navamsaRasiIndex");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/clients/${kundli.clientId}`} className="text-sm text-zinc-500 hover:underline">
          ← {kundli.client.name}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{kundli.name}</h1>
        <p className="text-zinc-600">
          Born {new Date(kundli.birthDate).toUTCString().replace(" GMT", " UTC")} · {kundli.birthPlace} (
          {kundli.latitude.toFixed(4)}, {kundli.longitude.toFixed(4)}) · Ayanamsa used:{" "}
          {fmtDeg(chart.ayanamsaUsed)} (Lahiri, approximate)
        </p>
      </div>

      <div className="flex flex-wrap gap-8 rounded-xl border border-zinc-200 bg-white p-6">
        <RasiChartGrid title="Rasi Chart (D1)" ascendantRasiIndex={chart.ascendant.rasiIndex} planetsBySign={rasiGroups} />
        <RasiChartGrid
          title="Navamsa Chart (D9)"
          ascendantRasiIndex={-1}
          planetsBySign={navamsaGroups}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Planetary positions (sidereal)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 pr-4 font-medium">Graha</th>
                <th className="py-1.5 pr-4 font-medium">Rasi</th>
                <th className="py-1.5 pr-4 font-medium">Degree</th>
                <th className="py-1.5 pr-4 font-medium">Nakshatra</th>
                <th className="py-1.5 pr-4 font-medium">Pada</th>
                <th className="py-1.5 pr-4 font-medium">Navamsa</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium text-amber-700">Ascendant</td>
                <td className="py-1.5 pr-4">{chart.ascendant.rasiName}</td>
                <td className="py-1.5 pr-4">{fmtDeg(chart.ascendant.degreeInSign)}</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
                <td className="py-1.5 pr-4 text-zinc-400">—</td>
              </tr>
              {chart.planets.map((p) => (
                <tr key={p.planet} className="border-t border-zinc-100">
                  <td className="py-1.5 pr-4 font-medium">{p.planet}</td>
                  <td className="py-1.5 pr-4">{p.rasiName}</td>
                  <td className="py-1.5 pr-4">{fmtDeg(p.degreeInSign)}</td>
                  <td className="py-1.5 pr-4">{p.nakshatraName}</td>
                  <td className="py-1.5 pr-4">{p.pada}</td>
                  <td className="py-1.5 pr-4">{p.navamsaRasiName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold">Vimshottari Dasha</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Moon nakshatra at birth: {chart.moonNakshatra.name}, pada {chart.moonNakshatra.pada}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1.5 pr-4 font-medium">Mahadasha</th>
                <th className="py-1.5 pr-4 font-medium">Start</th>
                <th className="py-1.5 pr-4 font-medium">End</th>
                <th className="py-1.5 pr-4 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {chart.vimshottariDasha.map((d, i) => (
                <tr key={i} className="border-t border-zinc-100">
                  <td className="py-1.5 pr-4 font-medium">{d.planet}</td>
                  <td className="py-1.5 pr-4">{new Date(d.startDate).toISOString().slice(0, 10)}</td>
                  <td className="py-1.5 pr-4">{new Date(d.endDate).toISOString().slice(0, 10)}</td>
                  <td className="py-1.5 pr-4">{d.years.toFixed(2)} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import type { ChartData } from "@/lib/astro/engine";
import { computeDashaChainAt, DASHA_CHAIN_LEVEL_COUNT } from "@/lib/astro/engine";
import { utcToLocalParts } from "@/lib/astro/birth-utils";

function fmtLocal(iso: string, timezoneOffsetMinutes: number): string {
  const p = utcToLocalParts(new Date(iso), timezoneOffsetMinutes);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")} ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

/** Value for an <input type="datetime-local">, in the kundli's birth-place local time. */
function toDatetimeLocalValue(date: Date, timezoneOffsetMinutes: number): string {
  const p = utcToLocalParts(date, timezoneOffsetMinutes);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}T${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

/** Parses a birth-place-local `datetime-local` value (e.g. "2026-07-05T12:00") back to a UTC Date. */
export function parseLocalDatetimeParam(value: string, timezoneOffsetMinutes: number): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number) as unknown as number[];
  const localAsUtcMs = Date.UTC(y, mo - 1, d, h, mi);
  return new Date(localAsUtcMs - timezoneOffsetMinutes * 60 * 1000);
}

export function CurrentDashaChain({
  chart,
  asOf,
  timezoneOffsetMinutes,
  planetNames,
  levelLabels,
  labels,
  accentTextClass = "text-zinc-800 dark:text-zinc-200",
}: {
  chart: ChartData;
  asOf: Date;
  timezoneOffsetMinutes: number;
  planetNames: Record<string, string>;
  levelLabels: readonly string[];
  labels: { heading: string; subtitle: string; asOf: string; checkButton: string; level: string; graha: string; start: string; end: string; note: string };
  accentTextClass?: string;
}) {
  const chain = computeDashaChainAt(chart.vimshottariDasha, asOf, DASHA_CHAIN_LEVEL_COUNT);
  const asOfValue = toDatetimeLocalValue(asOf, timezoneOffsetMinutes);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-lg font-semibold ${accentTextClass}`}>{labels.heading}</h2>
        <form method="GET" className="flex items-center gap-2 print:hidden">
          <label className="flex items-center gap-2 text-sm">
            {labels.asOf}
            <input
              type="datetime-local"
              name="asOf"
              defaultValue={asOfValue}
              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {labels.checkButton}
          </button>
        </form>
      </div>
      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">{labels.subtitle}</p>
      <div className="overflow-x-auto">
        <table className="w-full max-w-xl text-left text-sm">
          <thead className="text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="py-1.5 pr-4 font-medium">{labels.level}</th>
              <th className="py-1.5 pr-4 font-medium">{labels.graha}</th>
              <th className="py-1.5 pr-4 font-medium">{labels.start}</th>
              <th className="py-1.5 pr-4 font-medium">{labels.end}</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((entry) => (
              <tr key={entry.level} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-4 font-medium">{levelLabels[entry.level]}</td>
                <td className="py-1.5 pr-4">{planetNames[entry.planet] ?? entry.planet}</td>
                <td className="py-1.5 pr-4">{fmtLocal(entry.startDate, timezoneOffsetMinutes)}</td>
                <td className="py-1.5 pr-4">{fmtLocal(entry.endDate, timezoneOffsetMinutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{labels.note}</p>
    </div>
  );
}

import { RASI_NAMES } from "@/lib/astro/constants";

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

// Fixed South-Indian style layout: sign position on screen never changes,
// only which sign carries the Ascendant (marked "Asc") changes per chart.
// prettier-ignore
const GRID_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

export function RasiChartGrid({
  title,
  ascendantRasiIndex,
  planetsBySign,
}: {
  title: string;
  ascendantRasiIndex: number;
  planetsBySign: Record<number, string[]>;
}) {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 text-sm font-medium text-zinc-600">{title}</div>
      <div className="grid grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-lg border border-zinc-300 bg-zinc-300">
        {GRID_LAYOUT.flat().map((rasiIndex, i) => {
          if (rasiIndex === null) {
            return <div key={`empty-${i}`} className="bg-zinc-50" />;
          }
          const planets = planetsBySign[rasiIndex] ?? [];
          const isAsc = rasiIndex === ascendantRasiIndex;
          return (
            <div
              key={rasiIndex}
              className={`flex min-h-20 flex-col justify-between bg-white p-1.5 text-xs ${
                isAsc ? "ring-2 ring-inset ring-amber-500" : ""
              }`}
            >
              <span className="text-[10px] text-zinc-400">{RASI_NAMES[rasiIndex]}</span>
              <div className="flex flex-wrap gap-1">
                {isAsc && (
                  <span className="rounded bg-amber-100 px-1 font-semibold text-amber-700">Asc</span>
                )}
                {planets.map((p) => (
                  <span key={p} className="rounded bg-zinc-100 px-1 font-medium text-zinc-700">
                    {PLANET_ABBR[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

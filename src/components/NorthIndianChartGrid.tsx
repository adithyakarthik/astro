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

// Standard North Indian diamond layout: houses are FIXED screen positions
// (House 1 always top-middle), and which rasi (sign) occupies each house
// rotates with the Ascendant. Geometry: a square with both diagonals and a
// diamond connecting the four edge-midpoints, which together carve the
// square into exactly 12 regions — 4 "kendra" kite shapes at the edge
// midpoints (houses 1/4/7/10) and 8 corner triangles (the rest), each
// corner further split in two by the diagonal that terminates there.
const A = { x: 0, y: 0 };
const B = { x: 100, y: 0 };
const C = { x: 100, y: 100 };
const D = { x: 0, y: 100 };
const N = { x: 50, y: 0 };
const E = { x: 100, y: 50 };
const S = { x: 50, y: 100 };
const W = { x: 0, y: 50 };
const O = { x: 50, y: 50 };
const AO = { x: 25, y: 25 };
const BO = { x: 75, y: 25 };
const CO = { x: 75, y: 75 };
const DO = { x: 25, y: 75 };

type Pt = { x: number; y: number };

// Index 0 = House 1 (top), proceeding clockwise through House 12.
const HOUSE_POLYGONS: Pt[][] = [
  [N, AO, O, BO], // House 1 (kendra, top)
  [N, BO, B], // House 2
  [B, BO, E], // House 3
  [E, BO, O, CO], // House 4 (kendra, right)
  [E, CO, C], // House 5
  [C, CO, S], // House 6
  [S, CO, O, DO], // House 7 (kendra, bottom)
  [S, DO, D], // House 8
  [D, DO, W], // House 9
  [W, DO, O, AO], // House 10 (kendra, left)
  [W, AO, A], // House 11
  [A, AO, N], // House 12
];

function centroid(points: Pt[]): Pt {
  const x = points.reduce((s, p) => s + p.x, 0) / points.length;
  const y = points.reduce((s, p) => s + p.y, 0) / points.length;
  return { x, y };
}

// Nudge label position toward the chart center for the smaller corner
// triangles, so text doesn't crowd the outer border.
function labelPosition(points: Pt[]): Pt {
  const c = centroid(points);
  if (points.length === 3) {
    return { x: c.x + (O.x - c.x) * 0.15, y: c.y + (O.y - c.y) * 0.15 };
  }
  return c;
}

export function NorthIndianChartGrid({
  title,
  ascendantRasiIndex,
  planetsBySign,
  rasiNames = RASI_NAMES,
  planetAbbr = PLANET_ABBR,
  ascendantLabel = "Asc",
}: {
  title: string;
  ascendantRasiIndex: number;
  planetsBySign: Record<number, string[]>;
  rasiNames?: readonly string[];
  planetAbbr?: Record<string, string>;
  ascendantLabel?: string;
}) {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</div>
      <svg viewBox="0 0 100 100" className="w-full rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <polygon points="0,0 100,0 100,100 0,100" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-zinc-300 dark:text-zinc-700" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" className="text-zinc-300 dark:text-zinc-700" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" className="text-zinc-300 dark:text-zinc-700" />
        <polygon
          points={`${N.x},${N.y} ${E.x},${E.y} ${S.x},${S.y} ${W.x},${W.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          className="text-zinc-300 dark:text-zinc-700"
        />
        {HOUSE_POLYGONS.map((poly, houseIndex) => {
          const rasiIndex = (ascendantRasiIndex + houseIndex) % 12;
          const planets = planetsBySign[rasiIndex] ?? [];
          const isAsc = houseIndex === 0;
          const label = labelPosition(poly);
          return (
            <g key={houseIndex}>
              {isAsc && (
                <polygon
                  points={poly.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="currentColor"
                  className="text-amber-100 dark:text-amber-900/30"
                />
              )}
              <text
                x={label.x}
                y={label.y - (isAsc ? 3.5 : 2.5)}
                textAnchor="middle"
                fontSize="4"
                className="fill-zinc-400 dark:fill-zinc-500"
              >
                {rasiNames[rasiIndex] ? rasiIndex + 1 : ""}
              </text>
              {isAsc && (
                <text x={label.x} y={label.y + 1.5} textAnchor="middle" fontSize="3.6" fontWeight="600" className="fill-amber-700 dark:fill-amber-500">
                  {ascendantLabel}
                </text>
              )}
              <text
                x={label.x}
                y={label.y + (isAsc ? 6 : 3)}
                textAnchor="middle"
                fontSize="4.2"
                fontWeight="500"
                className="fill-zinc-700 dark:fill-zinc-300"
              >
                {planets.map((p) => planetAbbr[p] ?? p).join(" ")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

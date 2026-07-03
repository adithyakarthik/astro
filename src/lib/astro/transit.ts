// Transit (Gochar) engine: where the planets are *right now* (or on any
// chosen date), and which natal house that falls in relative to a chart's
// Ascendant and Moon sign — the two most common reference points used in
// Vedic transit analysis.

import { computeKundli, type GrahaPlacement } from "./engine";

export interface TransitPlacement extends GrahaPlacement {
  houseFromAscendant: number; // 1-12
  houseFromMoon: number; // 1-12
}

export interface TransitResult {
  asOf: Date;
  planets: TransitPlacement[];
}

function houseFrom(referenceRasiIndex: number, transitingRasiIndex: number): number {
  return ((transitingRasiIndex - referenceRasiIndex + 12) % 12) + 1;
}

/**
 * Current sidereal planetary positions. Latitude/longitude don't affect
 * planetary longitudes (only the Ascendant does), so any placeholder
 * coordinates give correct planet positions here — the Ascendant field of
 * the underlying chart is simply unused.
 */
export function computeCurrentTransits(
  asOf: Date,
  natalAscendantRasiIndex?: number,
  natalMoonRasiIndex?: number
): TransitResult {
  const chart = computeKundli({ utcDate: asOf, latitude: 0, longitude: 0 });
  const ascRef = natalAscendantRasiIndex ?? chart.ascendant.rasiIndex;
  const moonRef = natalMoonRasiIndex ?? chart.planets.find((p) => p.planet === "Moon")!.rasiIndex;

  const planets: TransitPlacement[] = chart.planets.map((p) => ({
    ...p,
    houseFromAscendant: houseFrom(ascRef, p.rasiIndex),
    houseFromMoon: houseFrom(moonRef, p.rasiIndex),
  }));

  return { asOf, planets };
}

// Jaimini astrology: Chara Karakas (temperament significators, ranked by
// degree within sign), Arudha Lagna (the sign of "perceived" material life),
// and Karakamsha (the Atmakaraka's navamsa sign, used for spiritual
// indications). Chara Dasha (Jaimini's rasi-based dasha system) is not yet
// implemented — it needs its own well-tested period-length/direction rules
// and is left for a future pass rather than shipping a half-verified one.

import { PlanetKey, SIGN_LORDS } from "./constants";
import type { ChartData } from "./engine";

const KARAKA_PLANETS: PlanetKey[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

export const CHARA_KARAKA_LABELS = [
  "Atmakaraka",
  "Amatyakaraka",
  "Bhratrikaraka",
  "Matrikaraka",
  "Putrakaraka",
  "Gnatikaraka",
  "Darakaraka",
] as const;

export interface CharaKaraka {
  label: string;
  planet: PlanetKey;
  degreeInSign: number;
}

/** The 7 classical Chara Karakas, ranked by degree-in-sign (highest = Atmakaraka, "soul significator"). */
export function computeCharaKarakas(chart: ChartData): CharaKaraka[] {
  const relevant = chart.planets.filter((p) => KARAKA_PLANETS.includes(p.planet));
  const sorted = [...relevant].sort((a, b) => b.degreeInSign - a.degreeInSign);
  return sorted.map((p, i) => ({
    label: CHARA_KARAKA_LABELS[i] ?? `Karaka ${i + 1}`,
    planet: p.planet,
    degreeInSign: p.degreeInSign,
  }));
}

/**
 * Arudha Lagna: count from Lagna to its lord's sign, then count the same
 * distance again forward from the lord's own sign. If the result lands in
 * the 1st or 7th from Lagna, it moves ahead 10 signs (a fixed Jaimini rule
 * to avoid the Arudha coinciding with the Lagna itself).
 */
export function computeArudhaLagna(chart: ChartData): number {
  const lagnaRasi = chart.ascendant.rasiIndex;
  const lord = SIGN_LORDS[lagnaRasi];
  const lordPlacement = chart.planets.find((p) => p.planet === lord);
  if (!lordPlacement) return lagnaRasi;

  const distance = (lordPlacement.rasiIndex - lagnaRasi + 12) % 12;
  let al = (lordPlacement.rasiIndex + distance) % 12;
  if (al === lagnaRasi || al === (lagnaRasi + 6) % 12) {
    al = (al + 9) % 12;
  }
  return al;
}

/** The Atmakaraka's navamsa sign — used for spiritual/soul-path indications. */
export function computeKarakamsha(chart: ChartData, atmakaraka: PlanetKey): number {
  const placement = chart.planets.find((p) => p.planet === atmakaraka);
  return placement ? placement.navamsaRasiIndex : chart.ascendant.rasiIndex;
}

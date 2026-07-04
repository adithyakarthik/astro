// Krishnamurti Paddhati (KP) sub-lord system: each of the 27 nakshatras
// (13°20' wide) is further divided into 9 unequal sub-portions, in the same
// proportions as the Vimshottari dasha years of the 9 grahas, starting with
// the nakshatra's own lord. The sub-lord a point falls into is used for
// KP's signature "significator" style predictions.
//
// Note: full KP practice also uses Placidus house cusps (not the whole-sign
// ascendant used elsewhere in this app) for cuspal sub-lords — that requires
// iterative numeric house-division math not yet implemented here, so this
// covers planet/ascendant sub-lords only, not cuspal sub-lords.

import { DASHA_SEQUENCE, DASHA_YEARS, PlanetKey, nakshatraLord } from "./constants";
import type { ChartData } from "./engine";

const NAK_WIDTH = 360 / 27;

export function kpSubLord(nakshatraIndex: number, siderealLongitude: number): PlanetKey {
  const posInNak = siderealLongitude - nakshatraIndex * NAK_WIDTH;
  const startLord = nakshatraLord(nakshatraIndex);
  const startIdx = DASHA_SEQUENCE.indexOf(startLord);

  let cursor = 0;
  for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
    const lord = DASHA_SEQUENCE[(startIdx + i) % DASHA_SEQUENCE.length];
    const width = NAK_WIDTH * (DASHA_YEARS[lord] / 120);
    if (posInNak < cursor + width || i === DASHA_SEQUENCE.length - 1) return lord;
    cursor += width;
  }
  return startLord;
}

export interface KpRow {
  label: string;
  rasiIndex: number;
  degreeInSign: number;
  starLord: PlanetKey;
  subLord: PlanetKey;
}

export function computeKpTable(chart: ChartData): KpRow[] {
  const ascNakIndex = Math.floor(chart.ascendant.siderealLongitude / NAK_WIDTH);
  const rows: KpRow[] = [
    {
      label: "Ascendant",
      rasiIndex: chart.ascendant.rasiIndex,
      degreeInSign: chart.ascendant.degreeInSign,
      starLord: nakshatraLord(ascNakIndex),
      subLord: kpSubLord(ascNakIndex, chart.ascendant.siderealLongitude),
    },
  ];
  for (const p of chart.planets) {
    rows.push({
      label: p.planet,
      rasiIndex: p.rasiIndex,
      degreeInSign: p.degreeInSign,
      starLord: nakshatraLord(p.nakshatraIndex),
      subLord: kpSubLord(p.nakshatraIndex, p.siderealLongitude),
    });
  }
  return rows;
}

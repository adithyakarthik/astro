// Jamakkol "sensitive point" horary tools: Rahu Kaalam, Yama Gandam, Mrithyu,
// and Maandhi. These are distinct from the sunrise/sunset-based Rahu Kalam /
// Yamagandam "avoid windows" in panchang.ts (which give a clock-time window
// to avoid starting things) — here each tool locates a specific zodiacal
// *degree* (Sun's sidereal longitude + a fixed per-weekday offset), used in
// Jamakkol Prasannam (horary) practice to read a house/nakshatra/pada for
// questions about danger, death, accidents, surgery timing, and the like.
//
// Source: a Jamakkol horary reference (Rahu Kaalam / Yama Gandam / Mrithyu /
// Maandhi degree tables, pp. 73-75). All four offset tables and the formula
// below were verified against that source's own worked examples before
// being trusted — see scripts/verify-jamakkol-sensitive-points.ts.
//
// Rahu Kaalam and Yama Gandam's night-time formula includes an extra +180°
// step beyond the night-column table value itself (confirmed via the
// source's fully-worked night examples, which only reproduce the stated
// nakshatra/pada answer with that extra step included). Mrithyu and
// Maandhi's written rule explicitly describes a single add-and-normalize
// step for both day and night, with no extra +180° — but the source only
// includes day-time worked examples for these two, so the night-time case
// rests on the stated rule text rather than a cross-checked example; treat
// Mrithyu/Maandhi night results as somewhat less certain than the rest.

import { NAKSHATRA_NAMES, RASI_NAMES } from "./constants";

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// Indexed 0=Sunday..6=Saturday, matching Date#getUTCDay() / WEEKDAY_NAMES.
interface DayNightOffsets {
  day: number[];
  night: number[];
}

const RAHU_KAALAM_OFFSETS: DayNightOffsets = {
  day: [180, 36, 154, 108, 132, 84, 60],
  night: [84, 108, 60, 180, 36, 154, 132],
};

const YAMA_GANDAM_OFFSETS: DayNightOffsets = {
  day: [108, 84, 60, 36, 12, 154, 132],
  night: [12, 154, 132, 108, 84, 60, 36],
};

const MRITHYU_OFFSETS: DayNightOffsets = {
  day: [60, 36, 12, 156, 132, 108, 84],
  night: [312, 288, 264, 240, 216, 192, 336],
};

const MAANDHI_OFFSETS: DayNightOffsets = {
  day: [156, 132, 108, 84, 60, 36, 12],
  night: [240, 216, 192, 336, 312, 288, 264],
};

export interface SensitivePointResult {
  longitude: number; // sidereal, 0-360
  rasiIndex: number;
  rasiName: string;
  degreeInSign: number;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number; // 1-4
}

const NAK_WIDTH = 360 / 27;

function toResult(longitude: number): SensitivePointResult {
  const lon = norm360(longitude);
  const rasiIndex = Math.floor(lon / 30);
  const nakshatraIndex = Math.floor(lon / NAK_WIDTH);
  const posInNak = lon - nakshatraIndex * NAK_WIDTH;
  const pada = Math.floor(posInNak / (NAK_WIDTH / 4)) + 1;
  return {
    longitude: lon,
    rasiIndex,
    rasiName: RASI_NAMES[rasiIndex],
    degreeInSign: lon - rasiIndex * 30,
    nakshatraIndex,
    nakshatraName: NAKSHATRA_NAMES[nakshatraIndex],
    pada,
  };
}

/**
 * Computes all four Jamakkol sensitive points for a given moment.
 *
 * @param sunSiderealDeg Sun's sidereal (nirayana) longitude, 0-360, at the
 *   moment in question — the same sidereal convention used everywhere else
 *   in this app (Lahiri by default).
 * @param weekdayIndex 0=Sunday..6=Saturday, for that same moment/place.
 * @param isDaytime Whether the moment falls between sunrise and sunset at
 *   that place (vs. sunset-to-sunrise night).
 */
export function computeJamakkolSensitivePoints(
  sunSiderealDeg: number,
  weekdayIndex: number,
  isDaytime: boolean
): {
  rahuKaalam: SensitivePointResult;
  yamaGandam: SensitivePointResult;
  mrithyu: SensitivePointResult;
  maandhi: SensitivePointResult;
} {
  const rahuOffset = isDaytime
    ? RAHU_KAALAM_OFFSETS.day[weekdayIndex]
    : RAHU_KAALAM_OFFSETS.night[weekdayIndex] + 180;
  const yamaOffset = isDaytime
    ? YAMA_GANDAM_OFFSETS.day[weekdayIndex]
    : YAMA_GANDAM_OFFSETS.night[weekdayIndex] + 180;
  const mrithyuOffset = isDaytime ? MRITHYU_OFFSETS.day[weekdayIndex] : MRITHYU_OFFSETS.night[weekdayIndex];
  const maandhiOffset = isDaytime ? MAANDHI_OFFSETS.day[weekdayIndex] : MAANDHI_OFFSETS.night[weekdayIndex];

  return {
    rahuKaalam: toResult(sunSiderealDeg + rahuOffset),
    yamaGandam: toResult(sunSiderealDeg + yamaOffset),
    mrithyu: toResult(sunSiderealDeg + mrithyuOffset),
    maandhi: toResult(sunSiderealDeg + maandhiOffset),
  };
}

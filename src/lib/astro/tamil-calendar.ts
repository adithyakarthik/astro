// Tamil solar calendar (used alongside Panchang in Tamil Nadu / "Jamakkol"
// style readings): which Tamil month we're in, and roughly which day of it.
//
// The Tamil calendar is solar and sidereal: a new month begins the moment
// the Sun's Lahiri-sidereal longitude crosses into the next rashi
// (a "Sankranti"). Traditional almanacs also account for the exact time of
// day the Sankranti occurs (relative to sunrise) to decide whether that day
// or the next is "day 1" — this simplified version does not, so the day
// number can be off by one near a month boundary. Treat it as approximate.

import { lahiriAyanamsa, norm360, sunTropicalLongitudeDeg, toJulianDay } from "./engine";
import { TAMIL_MONTH_NAMES, TAMIL_WEEKDAY_NAMES } from "./constants";

export interface TamilCalendarDate {
  monthName: string;
  /** Approximate day-of-month (1-indexed), may be off by one near a month boundary. */
  day: number;
  weekdayName: string;
}

function sunSiderealRasiIndex(dateAtNoonUtc: Date): number {
  const jd = toJulianDay(dateAtNoonUtc);
  const ayanamsa = lahiriAyanamsa(jd);
  const sunSidereal = norm360(sunTropicalLongitudeDeg(jd) - ayanamsa);
  return Math.floor(sunSidereal / 30);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LOOKBACK_DAYS = 35; // a Tamil solar month is ~29-32 days

export function computeTamilCalendarDate(dateAtNoonUtc: Date): TamilCalendarDate {
  const currentRasi = sunSiderealRasiIndex(dateAtNoonUtc);

  let day = MAX_LOOKBACK_DAYS; // fallback if no transition found (shouldn't happen)
  for (let back = 1; back <= MAX_LOOKBACK_DAYS; back++) {
    const testDate = new Date(dateAtNoonUtc.getTime() - back * ONE_DAY_MS);
    if (sunSiderealRasiIndex(testDate) !== currentRasi) {
      day = back;
      break;
    }
  }

  return {
    monthName: TAMIL_MONTH_NAMES[currentRasi],
    day,
    weekdayName: TAMIL_WEEKDAY_NAMES[dateAtNoonUtc.getUTCDay()],
  };
}

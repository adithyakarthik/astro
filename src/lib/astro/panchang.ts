// Panchang / Muhurta engine: tithi, nakshatra, yoga, karana, sunrise/sunset,
// and the standard "avoid" windows (Rahu Kalam, Yamagandam, Gulika Kalam)
// plus the "good" Abhijit Muhurta window used for picking auspicious timings.
//
// All five/eight-fold day divisions and weekday tables below are the
// standard ones published across most Panchang references. Panchang is
// conventionally reckoned from one sunrise to the next, so tithi/nakshatra/
// yoga/karana here are computed *at the sunrise moment* of the given date —
// a simplified but common convention (this app does not compute the exact
// transition time to the next tithi/nakshatra during the day).

import julianModule from "astronomia/julian";
import sunriseModule from "astronomia/sunrise";

import {
  GULIKA_KALAM_PART_BY_WEEKDAY,
  KARANA_FIXED_NAMES,
  KARANA_MOVABLE_NAMES,
  NAKSHATRA_NAMES,
  RAHU_KALAM_PART_BY_WEEKDAY,
  TITHI_BASE_NAMES,
  WEEKDAY_NAMES,
  YAMAGANDAM_PART_BY_WEEKDAY,
  YOGA_NAMES,
} from "./constants";
import {
  lahiriAyanamsa,
  moonTropicalLongitudeDeg,
  norm360,
  sunTropicalLongitudeDeg,
  toJulianDay,
} from "./engine";

/* eslint-disable @typescript-eslint/no-explicit-any */
const julian = (julianModule as any).default ?? julianModule;
const { Sunrise } = sunriseModule as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface PanchangInput {
  /** Calendar date, interpreted as local to the given place (year/month/day only; time of day is ignored). */
  dateUtcNoon: Date;
  latitude: number;
  longitude: number; // east positive
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface PanchangResult {
  weekday: string;
  sunrise: Date;
  sunset: Date;
  tithi: { number: number; name: string; paksha: "Shukla" | "Krishna" };
  nakshatra: { name: string; index: number };
  yoga: { name: string };
  karana: { name: string };
  rahuKalam: TimeWindow;
  yamagandam: TimeWindow;
  gulikaKalam: TimeWindow;
  abhijitMuhurta: TimeWindow;
}

function divideDaylight(sunrise: Date, sunset: Date, parts: number): TimeWindow[] {
  const startMs = sunrise.getTime();
  const spanMs = sunset.getTime() - startMs;
  const windows: TimeWindow[] = [];
  for (let i = 0; i < parts; i++) {
    windows.push({
      start: new Date(startMs + (spanMs * i) / parts),
      end: new Date(startMs + (spanMs * (i + 1)) / parts),
    });
  }
  return windows;
}

export function computePanchang(input: PanchangInput): PanchangResult {
  const cal = new julian.Calendar().fromDate(input.dateUtcNoon);
  // astronomia's Sunrise takes longitude measured positive WESTwards, the
  // opposite convention from the rest of this app (east positive).
  const sunrise = new Sunrise(cal, input.latitude, -input.longitude);
  const sunriseDate: Date = sunrise.rise().toDate();
  const sunsetDate: Date = sunrise.set().toDate();

  const jd = toJulianDay(sunriseDate);
  const ayanamsa = lahiriAyanamsa(jd);
  const sunSidereal = norm360(sunTropicalLongitudeDeg(jd) - ayanamsa);
  const moonSidereal = norm360(moonTropicalLongitudeDeg(jd) - ayanamsa);

  const diff = norm360(moonSidereal - sunSidereal);
  const tithiIndex = Math.floor(diff / 12); // 0-29
  const paksha: "Shukla" | "Krishna" = tithiIndex < 15 ? "Shukla" : "Krishna";
  const withinPaksha = tithiIndex % 15; // 0-14
  const tithiName =
    withinPaksha === 14
      ? paksha === "Shukla"
        ? "Purnima"
        : "Amavasya"
      : TITHI_BASE_NAMES[withinPaksha];

  const nakWidth = 360 / 27;
  const nakshatraIndex = Math.floor(moonSidereal / nakWidth);

  const yogaSum = norm360(sunSidereal + moonSidereal);
  const yogaIndex = Math.floor(yogaSum / (360 / 27));

  const karanaIndex = Math.floor(diff / 6); // 0-59
  let karanaName: string;
  if (karanaIndex === 0) karanaName = KARANA_FIXED_NAMES[0]; // Kimstughna
  else if (karanaIndex >= 57) karanaName = KARANA_FIXED_NAMES[karanaIndex - 56]; // Shakuni/Chatushpada/Naga
  else karanaName = KARANA_MOVABLE_NAMES[(karanaIndex - 1) % 7];

  const weekdayIndex = sunriseDate.getUTCDay();
  const weekday = WEEKDAY_NAMES[weekdayIndex];

  const eighths = divideDaylight(sunriseDate, sunsetDate, 8);
  const rahuKalam = eighths[RAHU_KALAM_PART_BY_WEEKDAY[weekdayIndex] - 1];
  const yamagandam = eighths[YAMAGANDAM_PART_BY_WEEKDAY[weekdayIndex] - 1];
  const gulikaKalam = eighths[GULIKA_KALAM_PART_BY_WEEKDAY[weekdayIndex] - 1];

  const fifteenths = divideDaylight(sunriseDate, sunsetDate, 15);
  const abhijitMuhurta = fifteenths[7]; // 8th of 15

  return {
    weekday,
    sunrise: sunriseDate,
    sunset: sunsetDate,
    tithi: { number: withinPaksha + 1, name: tithiName, paksha },
    nakshatra: { name: NAKSHATRA_NAMES[nakshatraIndex], index: nakshatraIndex },
    yoga: { name: YOGA_NAMES[yogaIndex] },
    karana: { name: karanaName },
    rahuKalam,
    yamagandam,
    gulikaKalam,
    abhijitMuhurta,
  };
}

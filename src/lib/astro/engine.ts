// Core Vedic (sidereal) astrology calculation engine.
//
// Planetary positions are derived from VSOP87 (via the `astronomia` library),
// the same class of theory used by most desktop planetarium software, giving
// sub-arcminute accuracy for the Sun/Moon/visible planets in the modern era.
// This is a *mean Lahiri ayanamsa* approximation, not the official Indian
// Astronomical Ephemeris value, so results can be off by up to ~1 arcminute
// versus a paid Swiss-Ephemeris-based product. See ROADMAP.md for the
// upgrade path if you need certified precision (e.g. for professional
// publishing of dashas down to the day).

import julianModule from "astronomia/julian";
import baseModule from "astronomia/base";
import solarModule from "astronomia/solar";
import moonpositionModule from "astronomia/moonposition";
import planetpositionModule from "astronomia/planetposition";
import siderealModule from "astronomia/sidereal";

import vsop87Dearth from "astronomia/data/vsop87Dearth";
import vsop87Dmercury from "astronomia/data/vsop87Dmercury";
import vsop87Dvenus from "astronomia/data/vsop87Dvenus";
import vsop87Dmars from "astronomia/data/vsop87Dmars";
import vsop87Djupiter from "astronomia/data/vsop87Djupiter";
import vsop87Dsaturn from "astronomia/data/vsop87Dsaturn";

import {
  DASHA_SEQUENCE,
  DASHA_YEARS,
  NAKSHATRA_NAMES,
  PlanetKey,
  RASI_NAMES,
  nakshatraLord,
} from "./constants";

// astronomia ships dual CJS/ESM builds with no type declarations; under the
// CJS interop the real module ends up on `.default`. `any` is unavoidable
// here since the library is untyped.
/* eslint-disable @typescript-eslint/no-explicit-any */
const julian = (julianModule as any).default ?? julianModule;
const base = (baseModule as any).default ?? baseModule;
const solar = (solarModule as any).default ?? solarModule;
const moonposition = (moonpositionModule as any).default ?? moonpositionModule;
const planetposition = (planetpositionModule as any).default ?? planetpositionModule;
const sidereal = (siderealModule as any).default ?? siderealModule;
/* eslint-enable @typescript-eslint/no-explicit-any */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const AU_LIGHT_DAYS = 0.0057755183; // days of light travel time per AU

export function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function toJulianDay(utcDate: Date): number {
  const y = utcDate.getUTCFullYear();
  const m = utcDate.getUTCMonth() + 1;
  const dayFraction =
    utcDate.getUTCDate() +
    (utcDate.getUTCHours() +
      utcDate.getUTCMinutes() / 60 +
      utcDate.getUTCSeconds() / 3600) /
      24;
  return julian.CalendarGregorianToJD(y, m, dayFraction);
}

/**
 * Mean Lahiri ayanamsa in degrees at the given Julian Day.
 * Reference: ~23.8532deg at J2000.0, precessing at ~50.29"/year.
 */
export function lahiriAyanamsa(jd: number): number {
  const T = base.J2000Century(jd); // Julian centuries since J2000.0
  const AYANAMSA_AT_J2000_DEG = 23 + 51 / 60 + 11.7 / 3600;
  const PRECESSION_DEG_PER_CENTURY = 5029.0966 / 3600;
  return norm360(AYANAMSA_AT_J2000_DEG + PRECESSION_DEG_PER_CENTURY * T);
}

export function sunTropicalLongitudeDeg(jd: number): number {
  const T = base.J2000Century(jd);
  return norm360(solar.apparentLongitude(T) * R2D);
}

export function moonTropicalLongitudeDeg(jd: number): number {
  return norm360(moonposition.position(jd).lon * R2D);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const PLANET_DATA: Partial<Record<PlanetKey, unknown>> = {
  Mercury: (vsop87Dmercury as any).default ?? vsop87Dmercury,
  Venus: (vsop87Dvenus as any).default ?? vsop87Dvenus,
  Mars: (vsop87Dmars as any).default ?? vsop87Dmars,
  Jupiter: (vsop87Djupiter as any).default ?? vsop87Djupiter,
  Saturn: (vsop87Dsaturn as any).default ?? vsop87Dsaturn,
};
const EARTH_DATA = (vsop87Dearth as any).default ?? vsop87Dearth;

function helioRect(planetObj: any, jd: number) {
  const pos = planetObj.position(jd); // { lon, lat, range } radians/AU, ecliptic of date
  const x = pos.range * Math.cos(pos.lat) * Math.cos(pos.lon);
  const y = pos.range * Math.cos(pos.lat) * Math.sin(pos.lon);
  const z = pos.range * Math.sin(pos.lat);
  return { x, y, z };
}

/** Geocentric tropical ecliptic longitude (degrees) for an outer/inner VSOP87 planet, with light-time correction. */
function planetTropicalLongitudeDeg(key: PlanetKey, jd: number): number {
  const earth = new planetposition.Planet(EARTH_DATA);
  const planetObj = new planetposition.Planet(PLANET_DATA[key]);

  const earthPos = helioRect(earth, jd);

  let tau = 0;
  let lon = 0;
  for (let i = 0; i < 3; i++) {
    const p = helioRect(planetObj, jd - tau);
    const xi = p.x - earthPos.x;
    const eta = p.y - earthPos.y;
    const zeta = p.z - earthPos.z;
    const delta = Math.sqrt(xi * xi + eta * eta + zeta * zeta);
    tau = AU_LIGHT_DAYS * delta;
    lon = Math.atan2(eta, xi);
  }
  return norm360(lon * R2D);
}

function rahuTropicalLongitudeDeg(jd: number, useTrueNode: boolean): number {
  const nodeRad = useTrueNode ? moonposition.trueNode(jd) : moonposition.node(jd);
  return norm360(nodeRad * R2D);
}

/**
 * Ascendant (Lagna), tropical ecliptic longitude in degrees.
 *
 * Derivation: a point at ecliptic longitude λ (β=0) has equatorial unit
 * vector (cos λ, sin λ cos ε, sin λ sin ε). It's on the horizon exactly when
 * that vector is perpendicular to the zenith vector
 * (cos φ cos RAMC, cos φ sin RAMC, sin φ), which reduces to
 * cos λ cos(RAMC) + sin λ (cos ε sin RAMC + tan φ sin ε) = 0 — a line
 * through the origin in (cos λ, sin λ) with two opposite solutions 180°
 * apart (the ecliptic crosses the horizon at both the rising and setting
 * points). Physical test case (equator, RAMC=0, i.e. the vernal equinox
 * culminating) pins down which root is the riding one: λ = atan2(cos RAMC,
 * -(sin ε tan φ + cos ε sin RAMC)) gives 90° (Cancer 0°), the correct
 * ascendant; the other root is the descendant.
 */
function ascendantTropicalLongitudeDeg(
  jd: number,
  latitudeDeg: number,
  longitudeDeg: number
): number {
  const gstSeconds = sidereal.apparent(jd); // 0..86400
  const gstDeg = gstSeconds / 240; // 86400s = 360deg -> 240s/deg
  const ramcDeg = norm360(gstDeg + longitudeDeg); // east longitude positive

  // Mean obliquity of the ecliptic, good to a few arcseconds for any
  // birth date in the last few centuries.
  const T = base.J2000Century(jd);
  const oblDeg = base.horner(T, 23.4392911, -0.0130042, -1.64e-7, 5.04e-7);

  const ramc = ramcDeg * D2R;
  const lat = latitudeDeg * D2R;
  const obl = oblDeg * D2R;

  const y = Math.cos(ramc);
  const x = -(Math.sin(obl) * Math.tan(lat) + Math.cos(obl) * Math.sin(ramc));
  return norm360(Math.atan2(y, x) * R2D);
}

export interface GrahaPlacement {
  planet: PlanetKey;
  siderealLongitude: number; // 0-360
  rasiIndex: number; // 0-11
  rasiName: string;
  degreeInSign: number; // 0-30
  nakshatraIndex: number; // 0-26
  nakshatraName: string;
  pada: number; // 1-4
  navamsaRasiIndex: number; // 0-11
  navamsaRasiName: string;
}

export interface DashaPeriod {
  planet: PlanetKey;
  startDate: string; // ISO
  endDate: string; // ISO
  years: number;
  /** Antardashas (bhukti) within this period. Empty for antardasha-level entries themselves (no pratyantardasha yet). */
  antardashas: DashaPeriod[];
}

/**
 * One level of the classical six-fold Vimshottari subdivision:
 * Mahadasha (Dasa) -> Antardasha (Bhukti) -> Pratyantardasha (Antaram) ->
 * Sookshma dasha -> Prana dasha -> Deha dasha. Each level narrows to
 * year -> month -> week -> day -> hour -> minute scale respectively.
 */
export interface DashaChainLevel {
  level: number; // 0 = Mahadasha .. 5 = Deha dasha
  planet: PlanetKey;
  startDate: string; // ISO
  endDate: string; // ISO
}

export const DASHA_CHAIN_LEVEL_COUNT = 6;

export interface ChartData {
  ayanamsaUsed: number;
  ascendant: {
    siderealLongitude: number;
    rasiIndex: number;
    rasiName: string;
    degreeInSign: number;
  };
  planets: GrahaPlacement[];
  moonNakshatra: { name: string; pada: number };
  vimshottariDasha: DashaPeriod[];
}

export interface BirthInput {
  utcDate: Date; // birth instant, already converted to UTC
  latitude: number; // degrees, north positive
  longitude: number; // degrees, east positive
  /** Rahu/Ketu as the true (instantaneous) lunar node vs the mean node. Defaults to true. */
  useTrueNodes?: boolean;
}

function toPlacement(planet: PlanetKey, siderealLongitude: number): GrahaPlacement {
  const lon = norm360(siderealLongitude);
  const rasiIndex = Math.floor(lon / 30);
  const degreeInSign = lon - rasiIndex * 30;

  const nakWidth = 360 / 27; // 13deg20'
  const nakshatraIndex = Math.floor(lon / nakWidth);
  const posInNak = lon - nakshatraIndex * nakWidth;
  const pada = Math.floor(posInNak / (nakWidth / 4)) + 1;

  const navamsaPosition = Math.floor((lon % 30) / (30 / 9));
  const navamsaRasiIndex = (rasiIndex * 9 + navamsaPosition) % 12;

  return {
    planet,
    siderealLongitude: lon,
    rasiIndex,
    rasiName: RASI_NAMES[rasiIndex],
    degreeInSign,
    nakshatraIndex,
    nakshatraName: NAKSHATRA_NAMES[nakshatraIndex],
    pada,
    navamsaRasiIndex,
    navamsaRasiName: RASI_NAMES[navamsaRasiIndex],
  };
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Antardashas (bhukti) within one mahadasha, following the standard rule:
 * the sub-period sequence starts with the mahadasha's own lord and cycles
 * through DASHA_SEQUENCE, each lasting (mahadasha_years * lord_years / 120).
 *
 * `fullStartMs` is when the *full, untruncated* mahadasha nominally began
 * (which for the birth mahadasha is *before* birth), while `visibleStartMs`
 * is where the returned periods should actually begin (birth, for the first
 * mahadasha) — so the antardasha active at birth shows its correct
 * remaining balance instead of its full duration.
 */
function computeAntardashas(
  mahaLord: PlanetKey,
  mahaYears: number,
  fullStartMs: number,
  visibleStartMs: number
): DashaPeriod[] {
  const startIdx = DASHA_SEQUENCE.indexOf(mahaLord);
  const results: DashaPeriod[] = [];
  let cursorMs = fullStartMs;

  for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
    const lord = DASHA_SEQUENCE[(startIdx + i) % DASHA_SEQUENCE.length];
    const fullYears = (mahaYears * DASHA_YEARS[lord]) / 120;
    const fullStart = cursorMs;
    const fullEnd = cursorMs + fullYears * MS_PER_YEAR;
    cursorMs = fullEnd;

    if (fullEnd <= visibleStartMs) continue; // entirely elapsed before the visible window

    const clippedStartMs = Math.max(fullStart, visibleStartMs);
    results.push({
      planet: lord,
      startDate: new Date(clippedStartMs).toISOString(),
      endDate: new Date(fullEnd).toISOString(),
      years: (fullEnd - clippedStartMs) / MS_PER_YEAR,
      antardashas: [],
    });
  }
  return results;
}

function computeVimshottariDasha(
  birthUtc: Date,
  moonSiderealLongitude: number
): DashaPeriod[] {
  const nakWidth = 360 / 27;
  const nakshatraIndex = Math.floor(moonSiderealLongitude / nakWidth);
  const posInNak = moonSiderealLongitude - nakshatraIndex * nakWidth;
  const fractionElapsed = posInNak / nakWidth;
  const fractionRemaining = 1 - fractionElapsed;

  const startLord = nakshatraLord(nakshatraIndex);
  const startIndex = DASHA_SEQUENCE.indexOf(startLord);

  const periods: DashaPeriod[] = [];

  const birthMs = birthUtc.getTime();
  // The birth mahadasha's *full* span started before birth; back-compute that.
  const firstMahaFullYears = DASHA_YEARS[startLord];
  const firstMahaFullStartMs = birthMs - firstMahaFullYears * fractionElapsed * MS_PER_YEAR;
  const firstYears = firstMahaFullYears * fractionRemaining;

  let cursorMs = birthMs;

  for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
    const planet = DASHA_SEQUENCE[(startIndex + i) % DASHA_SEQUENCE.length];
    const years = i === 0 ? firstYears : DASHA_YEARS[planet];
    const startDate = new Date(cursorMs);
    const mahaFullStartMs = i === 0 ? firstMahaFullStartMs : cursorMs;
    cursorMs += years * MS_PER_YEAR;
    const endDate = new Date(cursorMs);
    periods.push({
      planet,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      years,
      antardashas: computeAntardashas(planet, DASHA_YEARS[planet], mahaFullStartMs, startDate.getTime()),
    });
  }
  return periods;
}

/**
 * Finds the currently-active period at every level of the classical
 * six-fold Vimshottari subdivision (Mahadasha/Antardasha/Pratyantardasha/
 * Sookshma/Prana/Deha) for a single instant, without expanding the full
 * 9^6 combinatorial tree — at each level we only descend into the one
 * sub-period that actually contains `atDate`.
 */
export function computeDashaChainAt(
  vimshottariDasha: DashaPeriod[],
  atDate: Date,
  levels: number = DASHA_CHAIN_LEVEL_COUNT
): DashaChainLevel[] {
  const atMs = atDate.getTime();
  const maha =
    vimshottariDasha.find((d) => atMs >= new Date(d.startDate).getTime() && atMs < new Date(d.endDate).getTime()) ??
    (atMs < new Date(vimshottariDasha[0].startDate).getTime() ? vimshottariDasha[0] : vimshottariDasha[vimshottariDasha.length - 1]);

  const chain: DashaChainLevel[] = [{ level: 0, planet: maha.planet, startDate: maha.startDate, endDate: maha.endDate }];
  // Sub-periods are computed against the true, continuous timeline, but a
  // sub-period straddling the birth mahadasha's truncation point (same as
  // the mahadasha itself) must have its *displayed* start floored there too.
  const floorMs = new Date(maha.startDate).getTime();

  // The Mahadasha's *full* (untruncated) span is derivable from its own end
  // date, since endDate is never truncated — only the birth mahadasha's
  // start is (its remaining balance is what's shown at the top level).
  let lord = maha.planet;
  let fullYears = DASHA_YEARS[lord];
  let fullStartMs = new Date(maha.endDate).getTime() - fullYears * MS_PER_YEAR;

  for (let level = 1; level < levels; level++) {
    const startIdx = DASHA_SEQUENCE.indexOf(lord);
    let cursorMs = fullStartMs;
    let matched: { lord: PlanetKey; startMs: number; endMs: number; years: number } | null = null;

    for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
      const subLord = DASHA_SEQUENCE[(startIdx + i) % DASHA_SEQUENCE.length];
      const subYears = (fullYears * DASHA_YEARS[subLord]) / 120;
      const subStart = cursorMs;
      const subEnd = cursorMs + subYears * MS_PER_YEAR;
      cursorMs = subEnd;
      if (atMs < subEnd || i === DASHA_SEQUENCE.length - 1) {
        matched = { lord: subLord, startMs: subStart, endMs: subEnd, years: subYears };
        break;
      }
    }
    if (!matched) break;

    chain.push({
      level,
      planet: matched.lord,
      startDate: new Date(Math.max(matched.startMs, floorMs)).toISOString(),
      endDate: new Date(matched.endMs).toISOString(),
    });
    lord = matched.lord;
    fullYears = matched.years;
    fullStartMs = matched.startMs;
  }

  return chain;
}

export function computeKundli(input: BirthInput): ChartData {
  const jd = toJulianDay(input.utcDate);
  const ayanamsa = lahiriAyanamsa(jd);

  const sunSidereal = norm360(sunTropicalLongitudeDeg(jd) - ayanamsa);
  const moonSidereal = norm360(moonTropicalLongitudeDeg(jd) - ayanamsa);
  const marsSidereal = norm360(planetTropicalLongitudeDeg("Mars", jd) - ayanamsa);
  const mercurySidereal = norm360(planetTropicalLongitudeDeg("Mercury", jd) - ayanamsa);
  const jupiterSidereal = norm360(planetTropicalLongitudeDeg("Jupiter", jd) - ayanamsa);
  const venusSidereal = norm360(planetTropicalLongitudeDeg("Venus", jd) - ayanamsa);
  const saturnSidereal = norm360(planetTropicalLongitudeDeg("Saturn", jd) - ayanamsa);
  const rahuSidereal = norm360(rahuTropicalLongitudeDeg(jd, input.useTrueNodes ?? true) - ayanamsa);
  const ketuSidereal = norm360(rahuSidereal + 180);

  const ascendantSidereal = norm360(
    ascendantTropicalLongitudeDeg(jd, input.latitude, input.longitude) - ayanamsa
  );

  const planets: GrahaPlacement[] = [
    toPlacement("Sun", sunSidereal),
    toPlacement("Moon", moonSidereal),
    toPlacement("Mars", marsSidereal),
    toPlacement("Mercury", mercurySidereal),
    toPlacement("Jupiter", jupiterSidereal),
    toPlacement("Venus", venusSidereal),
    toPlacement("Saturn", saturnSidereal),
    toPlacement("Rahu", rahuSidereal),
    toPlacement("Ketu", ketuSidereal),
  ];

  const ascRasiIndex = Math.floor(ascendantSidereal / 30);
  const moonPlacement = planets.find((p) => p.planet === "Moon")!;

  return {
    ayanamsaUsed: ayanamsa,
    ascendant: {
      siderealLongitude: ascendantSidereal,
      rasiIndex: ascRasiIndex,
      rasiName: RASI_NAMES[ascRasiIndex],
      degreeInSign: ascendantSidereal - ascRasiIndex * 30,
    },
    planets,
    moonNakshatra: {
      name: moonPlacement.nakshatraName,
      pada: moonPlacement.pada,
    },
    vimshottariDasha: computeVimshottariDasha(input.utcDate, moonSidereal),
  };
}

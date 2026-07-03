// Reference data tables used throughout the Vedic astrology engine.
// Sign/nakshatra indices are all 0-based internally, converted to
// human-friendly 1-based numbers only in the UI layer.

export const RASI_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const NAKSHATRA_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

export type PlanetKey =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu";

export const PLANET_KEYS: PlanetKey[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
];

// Vimshottari Dasha: 9 grahas, fixed order and duration in years (totals 120).
export const DASHA_SEQUENCE: PlanetKey[] = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

export const DASHA_YEARS: Record<PlanetKey, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

// Each nakshatra's ruling planet, cycling through DASHA_SEQUENCE every 9 nakshatras.
export function nakshatraLord(nakshatraIndex: number): PlanetKey {
  return DASHA_SEQUENCE[nakshatraIndex % 9];
}

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

// The 15 base tithi names, used for both Shukla (waxing) and Krishna
// (waning) paksha except the 15th, which is Purnima (full moon) in Shukla
// and Amavasya (new moon) in Krishna.
export const TITHI_BASE_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
] as const;

export const YOGA_NAMES = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shoola",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
] as const;

// 7 "movable" karanas repeat through most of the lunar month; Kimstughna,
// Shakuni, Chatushpada and Naga are "fixed" and occur once per month.
export const KARANA_MOVABLE_NAMES = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Gara",
  "Vanija",
  "Vishti",
] as const;
export const KARANA_FIXED_NAMES = ["Kimstughna", "Shakuni", "Chatushpada", "Naga"] as const;

/** Rahu Kalam / Yamagandam / Gulika Kalam each divide daylight into 8 equal
 * parts; which part (1-8, in sunrise->sunset order) is inauspicious depends
 * on the weekday. Index 0 = Sunday ... 6 = Saturday. */
export const RAHU_KALAM_PART_BY_WEEKDAY = [8, 2, 7, 5, 6, 4, 3];
export const YAMAGANDAM_PART_BY_WEEKDAY = [5, 4, 3, 2, 1, 7, 6];
export const GULIKA_KALAM_PART_BY_WEEKDAY = [7, 6, 5, 4, 3, 2, 1];

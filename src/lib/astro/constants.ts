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

// --- Jamakkol / Tamil jathakam presentation ---
// Traditional Tamil Nadu astrology ("Jamakkol") uses the same underlying
// sidereal (Lahiri) calculations as the rest of this app, presented with
// Tamil terminology and, conventionally, the South Indian fixed-grid chart
// style already used by RasiChartGrid.

export const TAMIL_RASI_NAMES = [
  "மேஷம்",
  "ரிஷபம்",
  "மிதுனம்",
  "கடகம்",
  "சிம்மம்",
  "கன்னி",
  "துலாம்",
  "விருச்சிகம்",
  "தனுசு",
  "மகரம்",
  "கும்பம்",
  "மீனம்",
] as const;

export const TAMIL_NAKSHATRA_NAMES = [
  "அசுவினி",
  "பரணி",
  "கார்த்திகை",
  "ரோகிணி",
  "மிருகசீரிடம்",
  "திருவாதிரை",
  "புனர்பூசம்",
  "பூசம்",
  "ஆயில்யம்",
  "மகம்",
  "பூரம்",
  "உத்திரம்",
  "அஸ்தம்",
  "சித்திரை",
  "சுவாதி",
  "விசாகம்",
  "அனுஷம்",
  "கேட்டை",
  "மூலம்",
  "பூராடம்",
  "உத்திராடம்",
  "திருவோணம்",
  "அவிட்டம்",
  "சதயம்",
  "பூரட்டாதி",
  "உத்திரட்டாதி",
  "ரேவதி",
] as const;

export const TAMIL_PLANET_NAMES: Record<PlanetKey, string> = {
  Sun: "சூரியன்",
  Moon: "சந்திரன்",
  Mars: "செவ்வாய்",
  Mercury: "புதன்",
  Jupiter: "குரு",
  Venus: "சுக்கிரன்",
  Saturn: "சனி",
  Rahu: "ராகு",
  Ketu: "கேது",
};

// Short 1-2 syllable forms for cramped chart grid cells.
export const TAMIL_PLANET_SHORT: Record<PlanetKey, string> = {
  Sun: "சூ",
  Moon: "சந்",
  Mars: "செ",
  Mercury: "பு",
  Jupiter: "கு",
  Venus: "சுக்",
  Saturn: "சனி",
  Rahu: "ரா",
  Ketu: "கே",
};

export const TAMIL_WEEKDAY_NAMES = [
  "ஞாயிறு",
  "திங்கள்",
  "செவ்வாய்",
  "புதன்",
  "வியாழன்",
  "வெள்ளி",
  "சனி",
] as const;

// Tamil solar months, in the order the Sun's sidereal (Lahiri) longitude
// passes through the corresponding rashi — Chithirai starts when the Sun
// enters Mesha (Aries), and so on. Index matches RASI_NAMES/TAMIL_RASI_NAMES.
export const TAMIL_MONTH_NAMES = [
  "சித்திரை",
  "வைகாசி",
  "ஆனி",
  "ஆடி",
  "ஆவணி",
  "புரட்டாசி",
  "ஐப்பசி",
  "கார்த்திகை",
  "மார்கழி",
  "தை",
  "மாசி",
  "பங்குனி",
] as const;

// --- Hindi (Devanagari) chart terminology, for the main chart display when
// the UI language is set to Hindi ---

export const HINDI_RASI_NAMES = [
  "मेष",
  "वृषभ",
  "मिथुन",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चिक",
  "धनु",
  "मकर",
  "कुम्भ",
  "मीन",
] as const;

export const HINDI_NAKSHATRA_NAMES = [
  "अश्विनी",
  "भरणी",
  "कृत्तिका",
  "रोहिणी",
  "मृगशिरा",
  "आर्द्रा",
  "पुनर्वसु",
  "पुष्य",
  "आश्लेषा",
  "मघा",
  "पूर्व फाल्गुनी",
  "उत्तर फाल्गुनी",
  "हस्त",
  "चित्रा",
  "स्वाति",
  "विशाखा",
  "अनुराधा",
  "ज्येष्ठा",
  "मूल",
  "पूर्वाषाढ़ा",
  "उत्तराषाढ़ा",
  "श्रवण",
  "धनिष्ठा",
  "शतभिषा",
  "पूर्वभाद्रपद",
  "उत्तरभाद्रपद",
  "रेवती",
] as const;

export const HINDI_PLANET_NAMES: Record<PlanetKey, string> = {
  Sun: "सूर्य",
  Moon: "चन्द्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "बृहस्पति",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
};

export const HINDI_PLANET_SHORT: Record<PlanetKey, string> = {
  Sun: "सू",
  Moon: "चं",
  Mars: "मं",
  Mercury: "बु",
  Jupiter: "गु",
  Venus: "शु",
  Saturn: "श",
  Rahu: "रा",
  Ketu: "के",
};

// --- Shared classical reference tables used by matchmaking, KP, Jaimini ---

export type Nadi = "Aadi" | "Madhya" | "Antya";

/** Each nakshatra's Nadi (used for Ashtakoot Nadi Koota and general Nadi classification). */
export const NADI_BY_NAKSHATRA: Nadi[] = [
  "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya", // 0-8
  "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", // 9-17
  "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya", // 18-26
];

/** Traditional (Rahu/Ketu excluded) rulership of each sign, used for Jaimini Arudha calculations. */
export const SIGN_LORDS: PlanetKey[] = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];

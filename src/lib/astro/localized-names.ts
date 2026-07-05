import type { Language } from "@/lib/i18n/config";
import {
  RASI_NAMES,
  NAKSHATRA_NAMES,
  TAMIL_RASI_NAMES,
  TAMIL_NAKSHATRA_NAMES,
  TAMIL_PLANET_NAMES,
  TAMIL_PLANET_SHORT,
  HINDI_RASI_NAMES,
  HINDI_NAKSHATRA_NAMES,
  HINDI_PLANET_NAMES,
  HINDI_PLANET_SHORT,
  type PlanetKey,
} from "./constants";

const ENGLISH_PLANET_NAMES: Record<PlanetKey, string> = {
  Sun: "Sun",
  Moon: "Moon",
  Mars: "Mars",
  Mercury: "Mercury",
  Jupiter: "Jupiter",
  Venus: "Venus",
  Saturn: "Saturn",
  Rahu: "Rahu",
  Ketu: "Ketu",
};

const ENGLISH_PLANET_SHORT: Record<PlanetKey, string> = {
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

export interface LocalizedChartNames {
  rasi: readonly string[];
  nakshatra: readonly string[];
  planet: Record<PlanetKey, string>;
  planetShort: Record<PlanetKey, string>;
  ascendantLabel: string;
}

/** Rasi/nakshatra/planet display names for the main chart view, matching the UI language. */
export function localizedChartNames(lang: Language): LocalizedChartNames {
  switch (lang) {
    case "ta":
      return {
        rasi: TAMIL_RASI_NAMES,
        nakshatra: TAMIL_NAKSHATRA_NAMES,
        planet: TAMIL_PLANET_NAMES,
        planetShort: TAMIL_PLANET_SHORT,
        ascendantLabel: "லக்னம்",
      };
    case "hi":
      return {
        rasi: HINDI_RASI_NAMES,
        nakshatra: HINDI_NAKSHATRA_NAMES,
        planet: HINDI_PLANET_NAMES,
        planetShort: HINDI_PLANET_SHORT,
        ascendantLabel: "लग्न",
      };
    default:
      return {
        rasi: RASI_NAMES,
        nakshatra: NAKSHATRA_NAMES,
        planet: ENGLISH_PLANET_NAMES,
        planetShort: ENGLISH_PLANET_SHORT,
        ascendantLabel: "Lagna",
      };
  }
}

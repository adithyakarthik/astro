// Divisional charts (Shodasavarga — the 16 classical vargas of Brihat
// Parashara Hora Shastra). Each varga subdivides every 30-degree sign into N
// equal (or, for D30, irregular) parts and remaps the planet into a "varga
// sign" used for that chart's specific area of life (career, marriage,
// wealth, etc). Only the resulting sign placement is computed — not
// varga-specific dashas or strength (Vimshopaka Bala), which are out of
// scope for now.

import { PlanetKey } from "./constants";
import type { ChartData } from "./engine";

export type VargaKey =
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D7"
  | "D9"
  | "D10"
  | "D12"
  | "D16"
  | "D20"
  | "D24"
  | "D27"
  | "D30"
  | "D40"
  | "D45"
  | "D60";

export const VARGA_KEYS: VargaKey[] = [
  "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
  "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60",
];

export const VARGA_LABELS: Record<VargaKey, string> = {
  D1: "Rasi (D1)",
  D2: "Hora (D2)",
  D3: "Drekkana (D3)",
  D4: "Chaturthamsha (D4)",
  D7: "Saptamsha (D7)",
  D9: "Navamsa (D9)",
  D10: "Dashamsha (D10)",
  D12: "Dwadashamsha (D12)",
  D16: "Shodashamsha (D16)",
  D20: "Vimshamsha (D20)",
  D24: "Chaturvimshamsha (D24)",
  D27: "Bhamsha (D27)",
  D30: "Trimshamsha (D30)",
  D40: "Khavedamsha (D40)",
  D45: "Akshavedamsha (D45)",
  D60: "Shashtiamsha (D60)",
};

export const VARGA_SIGNIFICANCE: Record<VargaKey, string> = {
  D1: "The birth chart itself — physical body and overall life.",
  D2: "Hora — wealth and financial resources.",
  D3: "Drekkana — siblings, courage and initiative.",
  D4: "Chaturthamsha — property, home, fortune.",
  D7: "Saptamsha — children and progeny.",
  D9: "Navamsa — spouse, marriage and dharma; refines the D1's promise.",
  D10: "Dashamsha — career, profession and public standing.",
  D12: "Dwadashamsha — parents and ancestry.",
  D16: "Shodashamsha — vehicles and general happiness.",
  D20: "Vimshamsha — spiritual life and practices.",
  D24: "Chaturvimshamsha — education and learning.",
  D27: "Bhamsha — inherent strengths and weaknesses.",
  D30: "Trimshamsha — misfortunes, troubles, and character weaknesses.",
  D40: "Khavedamsha — auspicious/inauspicious effects, maternal legacy.",
  D45: "Akshavedamsha — general character and paternal legacy.",
  D60: "Shashtiamsha — very fine-grained view of past karma; the most detailed varga.",
};

function isOddSign(rasiIndex: number): boolean {
  return rasiIndex % 2 === 0;
}

function elementOf(rasiIndex: number): 0 | 1 | 2 | 3 {
  return (rasiIndex % 4) as 0 | 1 | 2 | 3; // 0 fire, 1 earth, 2 air, 3 water
}

function modalityOf(rasiIndex: number): "movable" | "fixed" | "dual" {
  const m = rasiIndex % 3;
  return m === 0 ? "movable" : m === 1 ? "fixed" : "dual";
}

/**
 * Maps a planet's rasi (0-11) + degree-in-sign (0-30) into the sign (0-11)
 * it occupies in the given varga, per the standard Parashari rules.
 */
export function vargaRasiIndex(key: VargaKey, rasiIndex: number, degreeInSign: number): number {
  const odd = isOddSign(rasiIndex);
  const clampedDeg = Math.min(29.999999, Math.max(0, degreeInSign));

  switch (key) {
    case "D1":
      return rasiIndex;

    case "D2": {
      const firstHalf = clampedDeg < 15;
      if (odd) return firstHalf ? 4 : 3; // Leo : Cancer
      return firstHalf ? 3 : 4; // Cancer : Leo
    }

    case "D3": {
      const part = Math.floor(clampedDeg / 10); // 0-2
      return (rasiIndex + part * 4) % 12; // same, 5th, 9th
    }

    case "D4": {
      const part = Math.floor(clampedDeg / 7.5); // 0-3
      return (rasiIndex + part * 3) % 12; // same, 4th, 7th, 10th
    }

    case "D7": {
      const part = Math.floor(clampedDeg / (30 / 7)); // 0-6
      const start = odd ? rasiIndex : (rasiIndex + 6) % 12;
      return (start + part) % 12;
    }

    case "D9": {
      const part = Math.floor(clampedDeg / (30 / 9)); // 0-8
      return (rasiIndex * 9 + part) % 12;
    }

    case "D10": {
      const part = Math.floor(clampedDeg / 3); // 0-9
      const start = odd ? rasiIndex : (rasiIndex + 8) % 12;
      return (start + part) % 12;
    }

    case "D12": {
      const part = Math.floor(clampedDeg / 2.5); // 0-11
      return (rasiIndex + part) % 12;
    }

    case "D16": {
      const part = Math.floor(clampedDeg / 1.875); // 0-15
      const mod = modalityOf(rasiIndex);
      const start = mod === "movable" ? 0 : mod === "fixed" ? 4 : 8;
      return (start + part) % 12;
    }

    case "D20": {
      const part = Math.floor(clampedDeg / 1.5); // 0-19
      const mod = modalityOf(rasiIndex);
      const start = mod === "movable" ? 0 : mod === "fixed" ? 8 : 4;
      return (start + part) % 12;
    }

    case "D24": {
      const part = Math.floor(clampedDeg / 1.25); // 0-23
      const start = odd ? 4 : 3; // Leo : Cancer
      return (start + part) % 12;
    }

    case "D27": {
      const part = Math.floor(clampedDeg / (30 / 27)); // 0-26
      const el = elementOf(rasiIndex);
      const start = el === 0 ? 0 : el === 1 ? 3 : el === 2 ? 6 : 9;
      return (start + part) % 12;
    }

    case "D30": {
      if (odd) {
        if (clampedDeg < 5) return 0; // Mars / Aries
        if (clampedDeg < 10) return 10; // Saturn / Aquarius
        if (clampedDeg < 18) return 8; // Jupiter / Sagittarius
        if (clampedDeg < 25) return 2; // Mercury / Gemini
        return 6; // Venus / Libra
      }
      if (clampedDeg < 5) return 1; // Venus / Taurus
      if (clampedDeg < 12) return 5; // Mercury / Virgo
      if (clampedDeg < 20) return 11; // Jupiter / Pisces
      if (clampedDeg < 25) return 9; // Saturn / Capricorn
      return 7; // Mars / Scorpio
    }

    case "D40": {
      const part = Math.floor(clampedDeg / 0.75); // 0-39
      const start = odd ? 0 : 6; // Aries : Libra
      return (start + part) % 12;
    }

    case "D45": {
      const part = Math.floor(clampedDeg / (30 / 45)); // 0-44
      const mod = modalityOf(rasiIndex);
      const start = mod === "movable" ? 0 : mod === "fixed" ? 4 : 8;
      return (start + part) % 12;
    }

    case "D60": {
      const part = Math.floor(clampedDeg / 0.5); // 0-59
      return (rasiIndex + part) % 12;
    }
  }
}

export interface VargaChart {
  key: VargaKey;
  ascendantRasiIndex: number;
  planets: { planet: PlanetKey; rasiIndex: number }[];
}

export function computeVargaChart(key: VargaKey, chart: ChartData): VargaChart {
  return {
    key,
    ascendantRasiIndex: vargaRasiIndex(key, chart.ascendant.rasiIndex, chart.ascendant.degreeInSign),
    planets: chart.planets.map((p) => ({
      planet: p.planet,
      rasiIndex: vargaRasiIndex(key, p.rasiIndex, p.degreeInSign),
    })),
  };
}

export function groupVargaBySign(varga: VargaChart): Record<number, string[]> {
  const map: Record<number, string[]> = {};
  for (const p of varga.planets) {
    map[p.rasiIndex] = map[p.rasiIndex] ? [...map[p.rasiIndex], p.planet] : [p.planet];
  }
  return map;
}

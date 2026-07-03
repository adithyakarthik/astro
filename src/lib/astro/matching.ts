// Ashtakoot (8-koot) Guna Milan: the standard North-Indian marriage
// compatibility scoring system, out of 36 points, based purely on each
// person's Moon nakshatra and Moon rashi (sign) at birth.
//
// IMPORTANT: these are the widely-published *standard, simplified* rules
// used by most Panchang references and matchmaking software. A few koots
// (Vashya, Graha Maitri, Gana edge cases) have known minor variations
// between traditional schools/regional Panchangs. Treat this as a
// computational aid, not a final verdict — for an actual marriage decision,
// have a qualified astrologer verify the result, especially if the score is
// borderline or Nadi/Bhakoot dosha is flagged.

import { PlanetKey, RASI_NAMES } from "./constants";

export interface MoonPlacement {
  nakshatraIndex: number; // 0-26
  rasiIndex: number; // 0-11
}

export interface KootResult {
  name: string;
  maxPoints: number;
  points: number;
  note: string;
}

export interface MatchResult {
  totalPoints: number;
  maxPoints: 36;
  koots: KootResult[];
  hasNadiDosha: boolean;
  hasBhakootDosha: boolean;
  verdict: string;
}

// --- Varna (1 point): spiritual/social temperament, by Moon rashi ---
const VARNA_RANK: Record<number, number> = {
  // rashiIndex -> rank (higher = "senior"); Brahmin(4) > Kshatriya(3) > Vaishya(2) > Shudra(1)
  3: 4, 7: 4, 11: 4, // Cancer, Scorpio, Pisces -> Brahmin
  0: 3, 4: 3, 8: 3, // Aries, Leo, Sagittarius -> Kshatriya
  1: 2, 5: 2, 9: 2, // Taurus, Virgo, Capricorn -> Vaishya
  2: 1, 6: 1, 10: 1, // Gemini, Libra, Aquarius -> Shudra
};

// --- Vashya (2 points): mutual "control"/dominance grouping, by Moon rashi ---
type VashyaGroup = "Chatushpada" | "Dwipada" | "Jalachar" | "Vanachar" | "Keeta";
const VASHYA_GROUP: Record<number, VashyaGroup> = {
  0: "Chatushpada",
  1: "Chatushpada",
  2: "Dwipada",
  3: "Jalachar",
  4: "Vanachar",
  5: "Dwipada",
  6: "Dwipada",
  7: "Keeta",
  8: "Chatushpada",
  9: "Jalachar",
  10: "Dwipada",
  11: "Jalachar",
};
const VASHYA_SCORE: Record<string, number> = {
  "Chatushpada-Chatushpada": 2,
  "Dwipada-Dwipada": 2,
  "Jalachar-Jalachar": 2,
  "Vanachar-Vanachar": 2,
  "Keeta-Keeta": 2,
  "Dwipada-Chatushpada": 1,
  "Chatushpada-Dwipada": 1,
  "Dwipada-Jalachar": 1,
  "Jalachar-Dwipada": 1,
  "Chatushpada-Jalachar": 1,
  "Jalachar-Chatushpada": 1,
};

// --- Yoni (4 points): sexual/instinctive compatibility, by nakshatra animal ---
const YONI_ANIMAL: string[] = [
  "Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Sheep", "Cat", // 0-8
  "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer", // 9-17
  "Dog", "Monkey", "Mongoose", "Monkey", "Lion", "Horse", "Lion", "Cow", "Elephant", // 18-26
];
const YONI_ENEMY_PAIRS: [string, string][] = [
  ["Cow", "Tiger"],
  ["Horse", "Buffalo"],
  ["Dog", "Deer"],
  ["Serpent", "Mongoose"],
  ["Rat", "Cat"],
  ["Sheep", "Monkey"],
  ["Lion", "Elephant"],
];
function yoniScore(a: string, b: string): number {
  if (a === b) return 4;
  const isEnemy = YONI_ENEMY_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a)
  );
  return isEnemy ? 0 : 2;
}

// --- Graha Maitri (5 points): friendship of Moon-rashi lords ---
const RASI_LORD: PlanetKey[] = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];
const PLANET_FRIENDSHIP: Record<PlanetKey, { friends: PlanetKey[]; enemies: PlanetKey[] }> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
  Moon: { friends: ["Sun", "Mercury"], enemies: [] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] },
  Rahu: { friends: [], enemies: [] },
  Ketu: { friends: [], enemies: [] },
};
function relation(a: PlanetKey, b: PlanetKey): "friend" | "enemy" | "neutral" {
  if (PLANET_FRIENDSHIP[a].friends.includes(b)) return "friend";
  if (PLANET_FRIENDSHIP[a].enemies.includes(b)) return "enemy";
  return "neutral";
}
function grahaMaitriScore(lordA: PlanetKey, lordB: PlanetKey): number {
  if (lordA === lordB) return 5;
  const ab = relation(lordA, lordB);
  const ba = relation(lordB, lordA);
  if (ab === "friend" && ba === "friend") return 5;
  if (ab === "enemy" && ba === "enemy") return 0;
  if (ab === "friend" || ba === "friend") return 4;
  if (ab === "neutral" && ba === "neutral") return 3;
  return 1; // one enemy, one neutral
}

// --- Gana (6 points): temperament group, by nakshatra ---
type Gana = "Deva" | "Manushya" | "Rakshasa";
const GANA_BY_NAKSHATRA: Gana[] = [
  "Deva", "Manushya", "Rakshasa", "Manushya", "Deva", "Manushya", "Deva", "Deva", "Rakshasa", // 0-8
  "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Deva", "Rakshasa", "Deva", "Rakshasa", // 9-17
  "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", // 18-26
];
const GANA_SCORE: Record<Gana, Record<Gana, number>> = {
  Deva: { Deva: 6, Manushya: 6, Rakshasa: 1 },
  Manushya: { Deva: 5, Manushya: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 0, Manushya: 0, Rakshasa: 6 },
};

// --- Nadi (8 points, most important dosha): by nakshatra ---
type Nadi = "Aadi" | "Madhya" | "Antya";
const NADI_BY_NAKSHATRA: Nadi[] = [
  "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya", // 0-8
  "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", // 9-17
  "Aadi", "Madhya", "Antya", "Antya", "Madhya", "Aadi", "Aadi", "Madhya", "Antya", // 18-26
];

function tithiCountTara(fromNak: number, toNak: number): number {
  return ((toNak - fromNak + 27) % 27) + 1;
}
const INAUSPICIOUS_TARA_NUMBERS = new Set([1, 3, 5, 7]);
function taraDirectionScore(fromNak: number, toNak: number): number {
  const count = tithiCountTara(fromNak, toNak);
  const taraNumber = ((count - 1) % 9) + 1;
  return INAUSPICIOUS_TARA_NUMBERS.has(taraNumber) ? 0 : 1.5;
}

const BHAKOOT_BAD_DISTANCES = new Set([2, 12, 5, 9, 6, 8]);
function bhakootDistance(fromRasi: number, toRasi: number): number {
  return ((toRasi - fromRasi + 12) % 12) + 1;
}

export function computeAshtakootMilan(boy: MoonPlacement, girl: MoonPlacement): MatchResult {
  const koots: KootResult[] = [];

  // Varna
  const varnaBoy = VARNA_RANK[boy.rasiIndex];
  const varnaGirl = VARNA_RANK[girl.rasiIndex];
  const varnaPoints = varnaBoy >= varnaGirl ? 1 : 0;
  koots.push({
    name: "Varna",
    maxPoints: 1,
    points: varnaPoints,
    note: "Spiritual compatibility/temperament hierarchy.",
  });

  // Vashya
  const groupBoy = VASHYA_GROUP[boy.rasiIndex];
  const groupGirl = VASHYA_GROUP[girl.rasiIndex];
  const vashyaPoints = VASHYA_SCORE[`${groupBoy}-${groupGirl}`] ?? 0;
  koots.push({
    name: "Vashya",
    maxPoints: 2,
    points: vashyaPoints,
    note: "Mutual attraction/control between partners.",
  });

  // Tara
  const taraBoyToGirl = taraDirectionScore(boy.nakshatraIndex, girl.nakshatraIndex);
  const taraGirlToBoy = taraDirectionScore(girl.nakshatraIndex, boy.nakshatraIndex);
  koots.push({
    name: "Tara",
    maxPoints: 3,
    points: taraBoyToGirl + taraGirlToBoy,
    note: "Birth-star counting for general well-being and luck.",
  });

  // Yoni
  const yoniPoints = yoniScore(YONI_ANIMAL[boy.nakshatraIndex], YONI_ANIMAL[girl.nakshatraIndex]);
  koots.push({
    name: "Yoni",
    maxPoints: 4,
    points: yoniPoints,
    note: "Physical/sexual compatibility (by nakshatra symbolic animal).",
  });

  // Graha Maitri
  const lordBoy = RASI_LORD[boy.rasiIndex];
  const lordGirl = RASI_LORD[girl.rasiIndex];
  const maitriPoints = grahaMaitriScore(lordBoy, lordGirl);
  koots.push({
    name: "Graha Maitri",
    maxPoints: 5,
    points: maitriPoints,
    note: "Friendship between Moon-sign ruling planets — mental compatibility.",
  });

  // Gana
  const ganaPoints = GANA_SCORE[GANA_BY_NAKSHATRA[boy.nakshatraIndex]][GANA_BY_NAKSHATRA[girl.nakshatraIndex]];
  koots.push({
    name: "Gana",
    maxPoints: 6,
    points: ganaPoints,
    note: "Temperament group (Deva/Manushya/Rakshasa) — behavioural compatibility.",
  });

  // Bhakoot
  const distance = bhakootDistance(boy.rasiIndex, girl.rasiIndex);
  const hasBhakootDosha = BHAKOOT_BAD_DISTANCES.has(distance);
  const bhakootPoints = hasBhakootDosha ? 0 : 7;
  koots.push({
    name: "Bhakoot",
    maxPoints: 7,
    points: bhakootPoints,
    note: hasBhakootDosha
      ? "Bhakoot Dosha present (Moon-sign distance is inauspicious) — often examined further by an astrologer before ruling a match out."
      : "Moon-sign distance is favourable.",
  });

  // Nadi
  const hasNadiDosha = NADI_BY_NAKSHATRA[boy.nakshatraIndex] === NADI_BY_NAKSHATRA[girl.nakshatraIndex];
  const nadiPoints = hasNadiDosha ? 0 : 8;
  koots.push({
    name: "Nadi",
    maxPoints: 8,
    points: nadiPoints,
    note: hasNadiDosha
      ? "Nadi Dosha present (same Nadi) — traditionally the most significant dosha, said to affect health/progeny; commonly examined closely by astrologers."
      : "Different Nadi — no Nadi Dosha.",
  });

  const totalPoints = koots.reduce((sum, k) => sum + k.points, 0);

  let verdict: string;
  if (hasNadiDosha) verdict = "Nadi Dosha present — traditionally advised to consult an astrologer before proceeding.";
  else if (totalPoints >= 28) verdict = "Excellent compatibility by Ashtakoot score.";
  else if (totalPoints >= 18) verdict = "Good/acceptable compatibility by Ashtakoot score.";
  else verdict = "Below the commonly-used 18-point threshold — many astrologers recommend further review.";

  return {
    totalPoints,
    maxPoints: 36,
    koots,
    hasNadiDosha,
    hasBhakootDosha,
    verdict,
  };
}

export function rasiName(index: number): string {
  return RASI_NAMES[index];
}

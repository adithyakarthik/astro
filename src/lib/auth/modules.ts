// The subscribable feature modules of the app. Admins enable/disable these
// per user (User.enabledModules, a JSON-encoded array of these keys).

export const MODULE_KEYS = [
  "clients",
  "matchmaking",
  "muhurta",
  "transits",
  "prashna",
  "videos",
  "classes",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  clients: "Clients & Kundlis",
  matchmaking: "Match Making",
  muhurta: "Muhurta / Panchang",
  transits: "Transits (Gochar)",
  prashna: "Prashna (Horary)",
  videos: "Videos",
  classes: "Classes & Payments",
};

export const ALL_MODULES: ModuleKey[] = [...MODULE_KEYS];

export function parseEnabledModules(json: string): ModuleKey[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m): m is ModuleKey => (MODULE_KEYS as readonly string[]).includes(m));
  } catch {
    return [];
  }
}

export function serializeEnabledModules(modules: ModuleKey[]): string {
  return JSON.stringify(modules);
}

// Subscription tiers offered to astrologer-Users. Orthogonal to `role`
// (USER/ADMIN) — a tier is just the default module bundle an admin can
// quick-apply; the actual access control remains `enabledModules`.
export const TIER_KEYS = ["SILVER", "GOLD", "PLATINUM"] as const;
export type TierKey = (typeof TIER_KEYS)[number];

export const TIER_LABELS: Record<TierKey, string> = {
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
};

export const TIER_MODULE_PRESETS: Record<TierKey, ModuleKey[]> = {
  SILVER: ["clients", "muhurta"],
  GOLD: ["clients", "matchmaking", "muhurta", "transits", "videos"],
  PLATINUM: [...MODULE_KEYS],
};

// The subscribable feature modules of the app. Admins enable/disable these
// per user (User.enabledModules, a JSON-encoded array of these keys).

export const MODULE_KEYS = [
  "clients",
  "matchmaking",
  "muhurta",
  "transits",
  "videos",
  "classes",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  clients: "Clients & Kundlis",
  matchmaking: "Match Making",
  muhurta: "Muhurta / Panchang",
  transits: "Transits (Gochar)",
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

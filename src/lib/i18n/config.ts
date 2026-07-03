export const LANGUAGES = ["en", "ta", "hi"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  ta: "தமிழ்",
  hi: "हिन्दी",
};

export const LANG_COOKIE = "lang";
export const DEFAULT_LANGUAGE: Language = "en";

export function isLanguage(value: string | undefined): value is Language {
  return !!value && (LANGUAGES as readonly string[]).includes(value);
}

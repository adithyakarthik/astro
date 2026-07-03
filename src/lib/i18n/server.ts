import { cookies } from "next/headers";
import { dictionaries, type Dictionary } from "./dictionary";
import { DEFAULT_LANGUAGE, LANG_COOKIE, isLanguage, type Language } from "./config";

// Builds a union of dot-path strings for every leaf key in the Dictionary
// shape, e.g. "nav.dashboard" | "dashboard.title" | ... — gives type-checked
// translation keys without hand-maintaining a separate key list.
type Path<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Path<T[K]>}`;
}[keyof T & string];
export type TranslationKey = Path<Dictionary>;

function getByPath(obj: unknown, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
  return typeof value === "string" ? value : path;
}

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get(LANG_COOKIE)?.value;
  return isLanguage(lang) ? lang : DEFAULT_LANGUAGE;
}

export async function getTranslations() {
  const lang = await getLanguage();
  const dict = dictionaries[lang];
  return {
    lang,
    t: (key: TranslationKey) => getByPath(dict, key),
  };
}

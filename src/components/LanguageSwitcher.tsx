"use client";

import { useTransition } from "react";
import { setLanguageAction } from "@/lib/i18n/actions";
import { LANGUAGES, LANGUAGE_LABELS, type Language } from "@/lib/i18n/config";

export function LanguageSwitcher({ currentLang }: { currentLang: Language }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const formData = new FormData();
    formData.set("lang", e.target.value);
    startTransition(async () => {
      await setLanguageAction(formData);
      // A full reload (not a client-side router transition) guarantees every
      // server component re-renders with the new language cookie — Next's
      // client Router Cache can otherwise serve a stale render for the
      // current path after a same-URL Server Action.
      window.location.reload();
    });
  }

  return (
    <select
      name="lang"
      defaultValue={currentLang}
      disabled={isPending}
      onChange={handleChange}
      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {LANGUAGE_LABELS[lang]}
        </option>
      ))}
    </select>
  );
}

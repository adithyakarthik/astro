"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE, isLanguage } from "./config";

export async function setLanguageAction(formData: FormData) {
  const lang = String(formData.get("lang") ?? "");
  if (!isLanguage(lang)) throw new Error("Unknown language");

  const cookieStore = await cookies();
  cookieStore.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

"use client";

import { useEffect } from "react";

/**
 * The portal has no astrologer session (and Client has no stored theme
 * preference), so the root layout's `user.theme`-driven `dark` class never
 * applies here — portal pages render permanently light regardless of the
 * visiting client's system preference. This mirrors that system preference
 * onto <html> for portal routes only, without touching the astrologer
 * flow's explicit, persisted theme setting.
 */
export function PortalThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (isDark: boolean) => document.documentElement.classList.toggle("dark", isDark);
    apply(mq.matches);
    mq.addEventListener("change", (e) => apply(e.matches));
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return null;
}

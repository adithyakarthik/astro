import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser, hasModule } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import type { ModuleKey } from "@/lib/auth/modules";
import { getTranslations } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { TranslationKey } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JK Vedansh Astro",
  description: "Vedic astrology practice management: kundlis, clients, videos and classes.",
};

const NAV_LINKS: { href: string; key: TranslationKey; module?: ModuleKey }[] = [
  { href: "/", key: "nav.dashboard" },
  { href: "/clients", key: "nav.clients", module: "clients" },
  { href: "/matchmaking", key: "nav.matchmaking", module: "matchmaking" },
  { href: "/muhurta", key: "nav.muhurta", module: "muhurta" },
  { href: "/transits", key: "nav.transits", module: "transits" },
  { href: "/videos", key: "nav.videos", module: "videos" },
  { href: "/classes", key: "nav.classes", module: "classes" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const { t, lang } = await getTranslations();

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        {user && (
          <header className="border-b border-zinc-200 bg-white print:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                🕉️ JK Vedansh Astro
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
                {NAV_LINKS.filter((link) => !link.module || hasModule(user, link.module)).map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-zinc-950">
                    {t(link.key)}
                  </Link>
                ))}
                {user.role === "ADMIN" && (
                  <Link href="/admin/users" className="hover:text-zinc-950">
                    {t("nav.admin")}
                  </Link>
                )}
                <LanguageSwitcher currentLang={lang} />
                <span className="text-zinc-300">|</span>
                <span className="text-zinc-400">{user.email}</span>
                <form action={logoutAction}>
                  <button type="submit" className="hover:text-zinc-950">
                    {t("nav.signOut")}
                  </button>
                </form>
              </nav>
            </div>
          </header>
        )}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}

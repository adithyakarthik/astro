import Link from "next/link";
import { getCurrentPortalClient } from "@/lib/auth/portal-session";
import { portalLogoutAction } from "./actions";
import { getTranslations } from "@/lib/i18n/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await getCurrentPortalClient();
  const { t } = await getTranslations();

  if (!client) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white print:hidden dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/portal" className="text-lg font-semibold tracking-tight dark:text-zinc-100">
            🕉️ {t("portal.title")}
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-500">{client.name}</span>
            <form action={portalLogoutAction}>
              <button type="submit" className="hover:text-zinc-950 dark:hover:text-zinc-100">
                {t("nav.signOut")}
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

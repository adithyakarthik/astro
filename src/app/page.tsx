import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser, hasModule } from "@/lib/auth/session";
import { getTranslations } from "@/lib/i18n/server";

export default async function Home() {
  const user = await requireUser();
  const { t } = await getTranslations();

  const [clientCount, kundliCount, videoCount, classCount] = await Promise.all([
    prisma.client.count({ where: { userId: user.id } }),
    prisma.kundli.count({ where: { client: { userId: user.id } } }),
    prisma.videoContent.count({ where: { userId: user.id } }),
    prisma.classAnnouncement.count({ where: { userId: user.id } }),
  ]);

  const cards = [
    { module: "clients" as const, href: "/clients", label: t("dashboard.clients"), count: clientCount, blurb: t("dashboard.clientsBlurb") },
    { module: "clients" as const, href: "/clients", label: t("dashboard.kundlis"), count: kundliCount, blurb: t("dashboard.kundlisBlurb") },
    { module: "videos" as const, href: "/videos", label: t("dashboard.videosPublished"), count: videoCount, blurb: t("dashboard.videosBlurb") },
    { module: "classes" as const, href: "/classes", label: t("dashboard.classesAnnounced"), count: classCount, blurb: t("dashboard.classesBlurb") },
  ].filter((c) => hasModule(user, c.module));

  const tools = [
    {
      module: "matchmaking" as const,
      href: "/matchmaking",
      label: t("nav.matchmaking"),
      blurb: t("dashboard.matchmakingBlurb"),
    },
    {
      module: "muhurta" as const,
      href: "/muhurta",
      label: t("nav.muhurta"),
      blurb: t("dashboard.muhurtaBlurb"),
    },
    {
      module: "transits" as const,
      href: "/transits",
      label: t("nav.transits"),
      blurb: t("dashboard.transitsBlurb"),
    },
  ].filter((tool) => hasModule(user, tool.module));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("dashboard.subtitle")}</p>
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow dark:bg-zinc-900 dark:border-zinc-800"
            >
              <div className="text-3xl font-semibold">{card.count}</div>
              <div className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">{card.label}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{card.blurb}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {hasModule(user, "clients") && (
          <Link
            href="/clients/new"
            className="rounded-xl bg-amber-600 px-5 py-4 text-center font-medium text-white hover:bg-amber-700"
          >
            {t("dashboard.addClient")}
          </Link>
        )}
        {hasModule(user, "videos") && (
          <Link
            href="/videos/new"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-4 text-center font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {t("dashboard.publishVideo")}
          </Link>
        )}
        {hasModule(user, "classes") && (
          <Link
            href="/classes/new"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-4 text-center font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {t("dashboard.announceClass")}
          </Link>
        )}
      </div>

      {tools.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">{t("dashboard.toolsHeading")}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("dashboard.toolsSubtitle")}</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow dark:bg-zinc-900 dark:border-zinc-800"
              >
                <div className="font-medium text-zinc-800 dark:text-zinc-200">{tool.label}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{tool.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {user.role === "ADMIN" && (
        <Link
          href="/admin/users"
          className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-4 text-center font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {t("dashboard.adminLink")}
        </Link>
      )}
    </div>
  );
}

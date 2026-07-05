import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ActionForm } from "@/components/ActionForm";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { deleteVideoFolder, updateFolderAccess } from "@/app/videos/actions";
import { TIER_KEYS, TIER_LABELS, type TierKey } from "@/lib/auth/modules";

export default async function VideoFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!hasModule(user, "videos")) return <ModuleLocked moduleKey="videos" />;
  const { t } = await getTranslations();

  const { id } = await params;
  const folder = await prisma.videoFolder.findUnique({
    where: { id },
    include: {
      videos: { orderBy: { createdAt: "desc" } },
      access: true,
    },
  });
  if (!folder || folder.userId !== user.id) notFound();

  const eligibleClients = await prisma.client.findMany({
    where: { userId: user.id, portalAccessEnabled: true },
    orderBy: { name: "asc" },
  });
  const grantedClientIds = new Set(folder.access.map((a) => a.clientId));

  const updateThisFolderAccess = updateFolderAccess.bind(null, folder.id);
  const deleteThisFolder = deleteVideoFolder.bind(null, folder.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/videos" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          {t("videos.backToVideos")}
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{folder.name}</h1>
          <ConfirmSubmitForm
            action={deleteThisFolder}
            confirmMessage={t("videos.confirmDeleteFolder")}
            label={t("videos.deleteFolder")}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 dark:text-red-400"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">{t("videos.folderAccessTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("videos.folderAccessSubtitle")}</p>

        <ActionForm action={updateThisFolderAccess} className="mt-4 flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium">{t("videos.tierAccessHeading")}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{t("videos.tierAccessSubtitle")}</p>
            <div className="mt-2 flex flex-wrap gap-4">
              {TIER_KEYS.map((tier) => (
                <label key={tier} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`tier-${tier}`} defaultChecked={(folder.allowedTiers ?? []).includes(tier)} />
                  {TIER_LABELS[tier]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">{t("videos.manualOverrideHeading")}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{t("videos.manualOverrideSubtitle")}</p>
            {eligibleClients.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{t("videos.noEligibleClients")}</p>
            ) : (
              <div className="mt-2 flex flex-col gap-1.5">
                {eligibleClients.map((client) => (
                  <label key={client.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={`client-${client.id}`} defaultChecked={grantedClientIds.has(client.id)} />
                    {client.name}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">({TIER_LABELS[client.tier as TierKey] ?? client.tier})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-fit rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            {t("videos.saveAccess")}
          </button>
        </ActionForm>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">{t("videos.videosInFolder")}</h2>
        {folder.videos.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{t("videos.noVideosInFolder")}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {folder.videos.map((video) => (
              <li key={video.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                {video.title}
                <Link href={`/videos/${video.id}/edit`} className="text-xs text-zinc-500 hover:underline dark:text-zinc-400">
                  {t("kundli.edit")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

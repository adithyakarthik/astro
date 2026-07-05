import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteVideo, createVideoFolder } from "./actions";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { ActionForm } from "@/components/ActionForm";
import { hasModule, requireUser } from "@/lib/auth/session";
import { TIER_LABELS, type TierKey } from "@/lib/auth/modules";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

export default async function VideosPage() {
  const user = await requireUser();
  if (!hasModule(user, "videos")) return <ModuleLocked moduleKey="videos" />;
  const { t } = await getTranslations();

  const [videos, folders] = await Promise.all([
    prisma.videoContent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { access: true } } },
    }),
    prisma.videoFolder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { videos: true, access: true } } },
    }),
  ]);
  const folderNameById = new Map(folders.map((f) => [f.id, f.name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("videos.title")}</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("videos.subtitle")}</p>
        </div>
        <Link
          href="/videos/new"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("videos.publish")}
        </Link>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-white p-5 dark:bg-zinc-900 dark:border-indigo-900">
        <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-400">{t("videos.foldersHeading")}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("videos.foldersSubtitle")}</p>

        {folders.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
              >
                <div>
                  <span className="font-medium">{folder.name}</span>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {folder._count.videos} {t("videos.videosCountLabel")} · {folder._count.access} {t("videos.clientsGrantedLabel")}
                    {(folder.allowedTiers ?? []).length > 0 &&
                      ` · ${(folder.allowedTiers ?? []).map((tier) => TIER_LABELS[tier as TierKey] ?? tier).join(", ")}`}
                  </span>
                </div>
                <Link href={`/videos/folders/${folder.id}`} className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-500">
                  {t("videos.manageAccess")}
                </Link>
              </div>
            ))}
          </div>
        )}

        <ActionForm action={createVideoFolder} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("videos.newFolderName")}
            <input
              name="name"
              required
              className="w-56 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
            {t("videos.createFolder")}
          </button>
        </ActionForm>
      </div>

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:text-zinc-400">
          {t("videos.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div key={video.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{video.title}</h3>
                  <div className="flex shrink-0 gap-2 text-xs">
                    <Link href={`/videos/${video.id}/edit`} className="text-zinc-500 hover:underline dark:text-zinc-400">
                      {t("kundli.edit")}
                    </Link>
                    <ConfirmSubmitForm
                      action={deleteVideo.bind(null, video.id)}
                      confirmMessage={t("kundli.confirmDelete")}
                      label={t("common.remove")}
                      className="text-red-500 hover:underline dark:text-red-400"
                    />
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {video.category && (
                    <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400 dark:bg-zinc-800">
                      {video.category}
                    </span>
                  )}
                  {video.folderId && (
                    <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {folderNameById.get(video.folderId) ?? video.folderId}
                    </span>
                  )}
                  {(video.allowedTiers ?? []).map((tier) => (
                    <span key={tier} className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-950/50 dark:text-violet-400">
                      {TIER_LABELS[tier as TierKey] ?? tier}
                    </span>
                  ))}
                  {video._count.access > 0 && (
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                      {t("videos.directAccessBadge")} ({video._count.access})
                    </span>
                  )}
                  {!video.folderId && video._count.access === 0 && (video.allowedTiers ?? []).length === 0 && (
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950/50 dark:text-green-400">
                      {t("videos.publicBadge")}
                    </span>
                  )}
                </div>
                {video.description && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{video.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

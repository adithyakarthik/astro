import { prisma } from "@/lib/db";
import { requirePortalClient } from "@/lib/auth/portal-session";
import { getTranslations } from "@/lib/i18n/server";

export default async function PortalVideosPage() {
  const client = await requirePortalClient();
  const { t } = await getTranslations();

  // A video is public only when it has no folder AND no direct per-video
  // grants at all; otherwise it's visible only via a folder grant or a
  // direct grant for this specific client (either mechanism is sufficient).
  const videos = await prisma.videoContent.findMany({
    where: {
      userId: client.userId,
      OR: [
        { folderId: null, access: { none: {} } },
        { folder: { access: { some: { clientId: client.id } } } },
        { access: { some: { clientId: client.id } } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">{t("portal.videosTitle")}</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("portal.videosSubtitle")}</p>
      </div>

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {t("portal.noVideos")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                <h3 className="font-medium dark:text-zinc-100">{video.title}</h3>
                {video.description && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{video.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

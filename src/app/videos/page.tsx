import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteVideo } from "./actions";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

export default async function VideosPage() {
  const user = await requireUser();
  if (!hasModule(user, "videos")) return <ModuleLocked moduleKey="videos" />;
  const { t } = await getTranslations();

  const videos = await prisma.videoContent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("videos.title")}</h1>
          <p className="mt-1 text-zinc-600">{t("videos.subtitle")}</p>
        </div>
        <Link
          href="/videos/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("videos.publish")}
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          {t("videos.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div key={video.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
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
                    <Link href={`/videos/${video.id}/edit`} className="text-zinc-500 hover:underline">
                      {t("kundli.edit")}
                    </Link>
                    <ConfirmSubmitForm
                      action={deleteVideo.bind(null, video.id)}
                      confirmMessage={t("kundli.confirmDelete")}
                      label={t("common.remove")}
                      className="text-red-500 hover:underline"
                    />
                  </div>
                </div>
                {video.category && (
                  <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {video.category}
                  </span>
                )}
                {video.description && <p className="mt-2 text-sm text-zinc-600">{video.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

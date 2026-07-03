import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteVideo } from "./actions";

export default async function VideosPage() {
  const videos = await prisma.videoContent.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Videos</h1>
          <p className="mt-1 text-zinc-600">
            Publish videos you&apos;ve already uploaded to YouTube — paste the link and it shows up here embedded.
          </p>
        </div>
        <Link
          href="/videos/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Publish video
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          No videos published yet.
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
                  <form action={deleteVideo.bind(null, video.id)}>
                    <button type="submit" className="text-xs text-red-500 hover:underline">
                      Remove
                    </button>
                  </form>
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

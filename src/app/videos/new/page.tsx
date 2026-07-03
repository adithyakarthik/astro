import { createVideo } from "../actions";

export default function NewVideoPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Publish a video</h1>
      <p className="mt-1 text-zinc-600">
        Upload the video to YouTube first (public or unlisted), then paste its link here to list it on your site.
      </p>

      <form action={createVideo} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Title *
          <input name="title" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          YouTube URL *
          <input
            name="youtubeUrl"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Category
          <input
            name="category"
            placeholder="e.g. Dasha, Remedies, Q&A"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea name="description" rows={3} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Publish
        </button>
      </form>
    </div>
  );
}

import { createVideo } from "../actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

export default async function NewVideoPage() {
  const user = await requireUser();
  if (!hasModule(user, "videos")) return <ModuleLocked moduleKey="videos" />;
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("videos.newTitle")}</h1>
      <p className="mt-1 text-zinc-600">{t("videos.newSubtitle")}</p>

      <form action={createVideo} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.videoTitle")} *
          <input name="title" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.youtubeUrl")} *
          <input
            name="youtubeUrl"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.category")}
          <input
            name="category"
            placeholder="e.g. Dasha, Remedies, Q&A"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.description")}
          <textarea name="description" rows={3} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("videos.publishButton")}
        </button>
      </form>
    </div>
  );
}

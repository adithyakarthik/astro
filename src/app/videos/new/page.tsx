import { prisma } from "@/lib/db";
import { createVideo } from "../actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ActionForm } from "@/components/ActionForm";

export default async function NewVideoPage() {
  const user = await requireUser();
  if (!hasModule(user, "videos")) return <ModuleLocked moduleKey="videos" />;
  const { t } = await getTranslations();
  const folders = await prisma.videoFolder.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("videos.newTitle")}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("videos.newSubtitle")}</p>

      <ActionForm action={createVideo} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.videoTitle")} *
          <input name="title" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.youtubeUrl")} *
          <input
            name="youtubeUrl"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.category")}
          <input
            name="category"
            placeholder="e.g. Dasha, Remedies, Q&A"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.description")}
          <textarea name="description" rows={3} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("videos.folder")}
          <select name="folderId" defaultValue="" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            <option value="">{t("videos.noFolder")}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("videos.publishButton")}
        </button>
      </ActionForm>
    </div>
  );
}

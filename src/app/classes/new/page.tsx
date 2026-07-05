import { createClass } from "../actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ActionForm } from "@/components/ActionForm";

export default async function NewClassPage() {
  const user = await requireUser();
  if (!hasModule(user, "classes")) return <ModuleLocked moduleKey="classes" />;
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("classes.newTitle")}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("classes.newSubtitle")}</p>

      <ActionForm action={createClass} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.classTitle")} *
          <input name="title" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.description")}
          <textarea name="description" rows={2} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("classes.startsAt")} *
            <input
              name="startsAt"
              type="datetime-local"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("classes.endsAt")}
            <input name="endsAt" type="datetime-local" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.durationMins")}
          <input
            name="durationMins"
            type="number"
            defaultValue={60}
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">{t("classes.durationHint")}</span>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.fee")} *
          <input
            name="feeInRupees"
            type="number"
            step="1"
            min="0"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.upiId")} *
          <input
            name="upiId"
            required
            placeholder="yourname@okaxis"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.payeeName")} *
          <input name="payeeName" required className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.meetingLink")}
          <input name="meetingLink" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("classes.announceButton")}
        </button>
      </ActionForm>
    </div>
  );
}

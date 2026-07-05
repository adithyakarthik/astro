import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateClass } from "@/app/classes/actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ActionForm } from "@/components/ActionForm";

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "classes")) return <ModuleLocked moduleKey="classes" />;
  const { t } = await getTranslations();

  const { id } = await params;
  const cls = await prisma.classAnnouncement.findUnique({ where: { id } });
  if (!cls || cls.userId !== user.id) notFound();

  const updateThisClass = updateClass.bind(null, cls.id);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("classes.newTitle")}</h1>

      <ActionForm
        action={updateThisClass}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.classTitle")} *
          <input
            name="title"
            required
            defaultValue={cls.title}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.description")}
          <textarea
            name="description"
            rows={2}
            defaultValue={cls.description ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("classes.startsAt")} *
            <input
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocalValue(cls.startsAt)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("classes.endsAt")}
            <input
              name="endsAt"
              type="datetime-local"
              defaultValue={cls.endsAt ? toDatetimeLocalValue(cls.endsAt) : ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.durationMins")}
          <input
            name="durationMins"
            type="number"
            defaultValue={cls.durationMins}
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
            defaultValue={cls.feeInRupees}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.upiId")} *
          <input
            name="upiId"
            required
            defaultValue={cls.upiId}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.payeeName")} *
          <input
            name="payeeName"
            required
            defaultValue={cls.payeeName}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.meetingLink")}
          <input
            name="meetingLink"
            defaultValue={cls.meetingLink ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("kundli.save")}
        </button>
      </ActionForm>
    </div>
  );
}

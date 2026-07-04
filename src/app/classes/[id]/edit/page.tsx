import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateClass } from "@/app/classes/actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

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

      <form
        action={updateThisClass}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.classTitle")} *
          <input
            name="title"
            required
            defaultValue={cls.title}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.description")}
          <textarea
            name="description"
            rows={2}
            defaultValue={cls.description ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("classes.dateTime")} *
            <input
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocalValue(cls.startsAt)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("classes.durationMins")}
            <input
              name="durationMins"
              type="number"
              defaultValue={cls.durationMins}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.fee")} *
          <input
            name="feeInRupees"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={cls.feeInRupees}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.upiId")} *
          <input
            name="upiId"
            required
            defaultValue={cls.upiId}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.payeeName")} *
          <input
            name="payeeName"
            required
            defaultValue={cls.payeeName}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("classes.meetingLink")}
          <input
            name="meetingLink"
            defaultValue={cls.meetingLink ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("kundli.save")}
        </button>
      </form>
    </div>
  );
}

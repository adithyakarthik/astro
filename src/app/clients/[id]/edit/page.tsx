import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateClient } from "@/app/clients/actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t } = await getTranslations();

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.userId !== user.id) notFound();

  const updateThisClient = updateClient.bind(null, client.id);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("clients.editTitle")}</h1>

      <form
        action={updateThisClient}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("clients.fullName")} *
          <input
            name="name"
            required
            defaultValue={client.name}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.phone")}
          <input
            name="phone"
            defaultValue={client.phone ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.email")}
          <input
            name="email"
            type="email"
            defaultValue={client.email ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("common.notes")}
          <textarea
            name="notes"
            rows={3}
            defaultValue={client.notes ?? ""}
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

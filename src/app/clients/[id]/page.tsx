import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteClient, deleteKundli, updateClientPortalAccess } from "@/app/clients/actions";
import { isPortalAccessActive } from "@/lib/auth/portal-session";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!hasModule(user, "clients")) return <ModuleLocked moduleKey="clients" />;
  const { t } = await getTranslations();

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { kundlis: { orderBy: { createdAt: "desc" } } },
  });

  if (!client || client.userId !== user.id) notFound();

  const deleteThisClient = deleteClient.bind(null, client.id);
  const updatePortalAccessForClient = updateClientPortalAccess.bind(null, client.id);
  const portalActive = isPortalAccessActive(client);
  const expiresAtValue = client.portalAccessExpiresAt ? client.portalAccessExpiresAt.toISOString().slice(0, 10) : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/clients" className="text-sm text-zinc-500 hover:underline">
            ← All clients
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{client.name}</h1>
          <p className="text-zinc-600">
            {client.phone ?? "No phone"} · {client.email ?? "No email"}
          </p>
          {client.notes && <p className="mt-2 text-sm text-zinc-500">{client.notes}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          >
            {t("kundli.edit")}
          </Link>
          <ConfirmSubmitForm
            action={deleteThisClient}
            confirmMessage={t("kundli.confirmDelete")}
            label={t("kundli.delete")}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold">{t("clients.portalAccess")}</h2>
        {client.email ? (
          <>
            <p className="mb-3 text-sm text-zinc-500">
              {portalActive ? t("clients.portalActive") : t("clients.portalInactive")}
            </p>
            <form action={updatePortalAccessForClient} className="flex flex-wrap items-end gap-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="portalAccessEnabled" defaultChecked={client.portalAccessEnabled} />
                {t("clients.portalEnable")}
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                {t("clients.portalExpiresAt")}
                <input
                  name="portalAccessExpiresAt"
                  type="date"
                  defaultValue={expiresAtValue}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {t("kundli.save")}
              </button>
            </form>
            <p className="mt-3 text-xs text-zinc-400">{t("clients.portalNote")}</p>
          </>
        ) : (
          <p className="text-sm text-zinc-500">{t("clients.portalNeedsEmail")}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("clients.kundlisHeading")}</h2>
        <Link
          href={`/clients/${client.id}/kundli/new`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("clients.addKundli")}
        </Link>
      </div>

      {client.kundlis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          {t("clients.noKundlis")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {client.kundlis.map((k) => {
            const deleteThisKundli = deleteKundli.bind(null, k.id);
            return (
              <div
                key={k.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 hover:shadow"
              >
                <Link href={`/kundli/${k.id}`}>
                  <div className="font-medium">{k.name}</div>
                  <div className="text-sm text-zinc-500">
                    {new Date(k.birthDate).toUTCString()} · {k.birthPlace}
                  </div>
                </Link>
                <div className="flex gap-2 text-sm">
                  <Link href={`/kundli/${k.id}/edit`} className="text-zinc-600 hover:underline">
                    {t("kundli.edit")}
                  </Link>
                  <ConfirmSubmitForm
                    action={deleteThisKundli}
                    confirmMessage={t("kundli.confirmDelete")}
                    label={t("kundli.delete")}
                    className="text-red-600 hover:underline"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { ShareButton } from "@/components/ShareButton";
import { deleteFind } from "@/app/finds/actions";

export default async function FindDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!hasModule(user, "finds")) return <ModuleLocked moduleKey="finds" />;
  const { t } = await getTranslations();
  const { id } = await params;

  const find = await prisma.find.findUnique({
    where: { id },
    include: { photos: { orderBy: { createdAt: "asc" } } },
  });
  if (!find || find.userId !== user.id) notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${find.latitude},${find.longitude}`;
  const deleteThisFind = deleteFind.bind(null, find.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/finds" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        {t("finds.detailBack")}
      </Link>

      {find.photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {find.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.url} alt="" className="h-56 w-56 shrink-0 rounded-xl object-cover" />
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
            {find.heading}
          </span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{find.title}</h1>
          {find.shopName && <p className="text-zinc-600 dark:text-zinc-400">{find.shopName}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/finds/${find.id}/edit`}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {t("finds.edit")}
          </Link>
          <ConfirmSubmitForm
            action={deleteThisFind}
            confirmMessage={t("finds.confirmDelete")}
            label={t("finds.delete")}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 dark:text-red-400"
          />
        </div>
      </div>

      {find.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {find.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {tag}
            </span>
          ))}
        </div>
      )}

      {find.description && <p className="text-zinc-700 dark:text-zinc-300">{find.description}</p>}

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {find.address && <p className="text-sm text-zinc-700 dark:text-zinc-300">{find.address}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {t("finds.formOpenInMaps")} ↗
          </a>
          <ShareButton
            title={find.title}
            shopName={find.shopName}
            heading={find.heading}
            tags={find.tags}
            description={find.description}
            address={find.address}
            latitude={find.latitude}
            longitude={find.longitude}
            label={t("finds.share")}
          />
        </div>
      </div>
    </div>
  );
}

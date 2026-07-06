import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { updateFind } from "@/app/finds/actions";
import { FindForm } from "@/app/finds/FindForm";

export default async function EditFindPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!hasModule(user, "finds")) return <ModuleLocked moduleKey="finds" />;
  const { t } = await getTranslations();
  const { id } = await params;

  const find = await prisma.find.findUnique({
    where: { id },
    include: { photos: { orderBy: { createdAt: "asc" } } },
  });
  if (!find || find.userId !== user.id) notFound();

  const distinctHeadings = await prisma.find.findMany({
    where: { userId: user.id },
    select: { heading: true },
    distinct: ["heading"],
    orderBy: { heading: "asc" },
  });

  const updateThisFind = updateFind.bind(null, find.id);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("finds.editTitle")}</h1>

      <div className="mt-6">
        <FindForm
          action={updateThisFind}
          headingOptions={distinctHeadings.map((h) => h.heading)}
          defaultValues={{
            title: find.title,
            description: find.description ?? undefined,
            heading: find.heading,
            tags: find.tags,
            shopName: find.shopName ?? undefined,
            address: find.address ?? undefined,
            latitude: find.latitude,
            longitude: find.longitude,
          }}
          existingPhotos={find.photos.map((p) => ({ id: p.id, url: p.url }))}
          labels={{
            title: t("finds.formTitle"),
            description: t("finds.formDescription"),
            heading: t("finds.formHeading"),
            tags: t("finds.formTags"),
            tagsHint: t("finds.formTagsHint"),
            shopName: t("finds.formShopName"),
            address: t("finds.formAddress"),
            search: t("finds.formSearch"),
            useMyLocation: t("finds.formUseMyLocation"),
            locating: t("finds.formLocating"),
            lat: t("finds.formLat"),
            lon: t("finds.formLon"),
            openInMaps: t("finds.formOpenInMaps"),
            found: t("finds.formFound"),
            notFound: t("finds.formNotFound"),
            error: t("finds.formError"),
            locationError: t("finds.formLocationError"),
            photos: t("finds.formPhotos"),
            existingPhotos: t("finds.formExistingPhotos"),
            remove: t("finds.formRemove"),
            processingPhotos: t("finds.formProcessingPhotos"),
            save: t("finds.save"),
          }}
        />
      </div>
    </div>
  );
}

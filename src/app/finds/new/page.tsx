import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { createFind } from "@/app/finds/actions";
import { listFindHeadings } from "@/app/finds/queries";
import { FindForm } from "@/app/finds/FindForm";

export default async function NewFindPage() {
  const user = await requireUser();
  if (!hasModule(user, "finds")) return <ModuleLocked moduleKey="finds" />;
  const { t } = await getTranslations();

  const headingOptions = await listFindHeadings(user.id);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("finds.newTitle")}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("finds.newSubtitle")}</p>

      <div className="mt-6">
        <FindForm
          action={createFind}
          headingOptions={headingOptions}
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

import { MODULE_LABELS, type ModuleKey } from "@/lib/auth/modules";
import { getTranslations } from "@/lib/i18n/server";

export async function ModuleLocked({ moduleKey }: { moduleKey: ModuleKey }) {
  const { t } = await getTranslations();
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
      <div className="text-lg font-semibold text-zinc-700">
        {MODULE_LABELS[moduleKey]} {t("moduleLocked.notInPlan")}
      </div>
      <p className="mt-1 text-sm text-zinc-500">{t("moduleLocked.body")}</p>
    </div>
  );
}

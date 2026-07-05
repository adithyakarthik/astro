import { MODULE_LABELS, type ModuleKey } from "@/lib/auth/modules";
import { getTranslations } from "@/lib/i18n/server";

export async function ModuleLocked({ moduleKey }: { moduleKey: ModuleKey }) {
  const { t } = await getTranslations();
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
        {MODULE_LABELS[moduleKey]} {t("moduleLocked.notInPlan")}
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("moduleLocked.body")}</p>
    </div>
  );
}

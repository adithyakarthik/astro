import { requireUser } from "@/lib/auth/session";
import { getTranslations } from "@/lib/i18n/server";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>
      <p className="mt-1 text-zinc-600">{t("settings.subtitle")}</p>

      <div className="mt-6">
        <SettingsForm
          defaultTheme={user.theme}
          defaultChartStyle={user.chartStyle}
          defaultUseTrueNodes={user.useTrueNodes}
          labels={{
            theme: t("settings.theme"),
            themeLight: t("settings.themeLight"),
            themeDark: t("settings.themeDark"),
            chartStyle: t("settings.chartStyle"),
            chartStyleSouth: t("settings.chartStyleSouth"),
            chartStyleNorth: t("settings.chartStyleNorth"),
            nodeType: t("settings.nodeType"),
            nodeTrue: t("settings.nodeTrue"),
            nodeMean: t("settings.nodeMean"),
            save: t("kundli.save"),
          }}
        />
      </div>
      <p className="mt-4 text-xs text-zinc-400">{t("settings.languageNote")}</p>
    </div>
  );
}

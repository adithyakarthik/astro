import { requireUser } from "@/lib/auth/session";
import { getTranslations } from "@/lib/i18n/server";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("settings.subtitle")}</p>

      <div className="mt-6">
        <SettingsForm
          defaultTheme={user.theme}
          defaultChartStyle={user.chartStyle}
          defaultUseTrueNodes={user.useTrueNodes}
          defaultAyanamsa={user.ayanamsa}
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
            ayanamsa: t("settings.ayanamsa"),
            ayanamsaLahiri: t("settings.ayanamsaLahiri"),
            ayanamsaRaman: t("settings.ayanamsaRaman"),
            ayanamsaKrishnamurti: t("settings.ayanamsaKrishnamurti"),
            ayanamsaYukteshwar: t("settings.ayanamsaYukteshwar"),
            ayanamsaFaganBradley: t("settings.ayanamsaFaganBradley"),
            ayanamsaNote: t("settings.ayanamsaNote"),
            save: t("kundli.save"),
          }}
        />
      </div>
      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">{t("settings.languageNote")}</p>
    </div>
  );
}

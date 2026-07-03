import { requestOtp } from "./actions";
import { getTranslations } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/";
  const { t, lang } = await getTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-2 flex justify-end">
          <LanguageSwitcher currentLang={lang} />
        </div>
        <div className="mb-6 text-center">
          <div className="text-lg font-semibold tracking-tight">{t("login.title")}</div>
          <p className="mt-1 text-sm text-zinc-500">{t("login.signInSubtitle")}</p>
        </div>

        {params.error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{params.error}</p>
        )}

        <form action={requestOtp} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("login.emailLabel")}
            <input
              name="email"
              type="email"
              required
              autoFocus
              placeholder={t("login.emailPlaceholder")}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {t("login.sendCode")}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-400">{t("login.footerNote")}</p>
      </div>
    </div>
  );
}

import { resendPortalOtp, verifyPortalOtpAction } from "../actions";
import { getTranslations } from "@/lib/i18n/server";

export default async function PortalVerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";
  const { t } = await getTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-lg font-semibold tracking-tight dark:text-zinc-100">{t("portal.title")}</div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("login.verifySubtitlePrefix")} <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
          </p>
        </div>

        {params.devCode && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <strong>{t("login.devModeNotice")}</strong> <span className="font-mono text-base">{params.devCode}</span>
          </p>
        )}
        {params.notice && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {params.notice}
          </p>
        )}
        {params.error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {params.error}
          </p>
        )}

        <form
          action={verifyPortalOtpAction}
          className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input type="hidden" name="email" value={email} />
          <label className="flex flex-col gap-1 text-sm font-medium dark:text-zinc-200">
            {t("login.codeLabel")}
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-center text-lg tracking-widest dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            {t("login.verifyButton")}
          </button>
        </form>

        <form action={resendPortalOtp} className="mt-3 text-center">
          <input type="hidden" name="email" value={email} />
          <button type="submit" className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400">
            {t("login.resend")}
          </button>
        </form>
      </div>
    </div>
  );
}

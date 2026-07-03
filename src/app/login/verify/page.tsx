import { resendOtp, verifyOtpAction } from "../actions";
import { getTranslations } from "@/lib/i18n/server";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";
  const next = params.next ?? "/";
  const { t } = await getTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-lg font-semibold tracking-tight">{t("login.title")}</div>
          <p className="mt-1 text-sm text-zinc-500">
            {t("login.verifySubtitlePrefix")} <span className="font-medium text-zinc-700">{email}</span>
          </p>
        </div>

        {params.devCode && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <strong>{t("login.devModeNotice")}</strong>{" "}
            <span className="font-mono text-base">{params.devCode}</span>. Set <code>RESEND_API_KEY</code> and{" "}
            <code>RESEND_FROM_EMAIL</code> to send real emails.
          </p>
        )}
        {params.notice && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{params.notice}</p>}
        {params.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}

        <form action={verifyOtpAction} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("login.codeLabel")}
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-center text-lg tracking-widest"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {t("login.verifyButton")}
          </button>
        </form>

        <form action={resendOtp} className="mt-3 text-center">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="text-sm text-zinc-500 underline hover:text-zinc-700">
            {t("login.resend")}
          </button>
        </form>
      </div>
    </div>
  );
}

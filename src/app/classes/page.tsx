import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { buildUpiLink } from "@/lib/upi";
import { deleteClass } from "./actions";
import { hasModule, requireUser } from "@/lib/auth/session";
import { ModuleLocked } from "@/components/ModuleLocked";
import { getTranslations } from "@/lib/i18n/server";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";

export default async function ClassesPage() {
  const user = await requireUser();
  if (!hasModule(user, "classes")) return <ModuleLocked moduleKey="classes" />;
  const { t } = await getTranslations();

  const classes = await prisma.classAnnouncement.findMany({
    where: { userId: user.id },
    orderBy: { startsAt: "asc" },
  });

  const withPaymentInfo = await Promise.all(
    classes.map(async (c) => {
      const upiLink = buildUpiLink({
        upiId: c.upiId,
        payeeName: c.payeeName,
        amount: c.feeInRupees,
        note: `Class: ${c.title}`.slice(0, 50),
        referenceId: c.id,
      });
      const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 1, width: 220 });
      return { ...c, upiLink, qrDataUrl };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("classes.title")}</h1>
          <p className="mt-1 text-zinc-600">{t("classes.subtitle")}</p>
        </div>
        <Link
          href="/classes/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("classes.announce")}
        </Link>
      </div>

      {withPaymentInfo.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          {t("classes.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {withPaymentInfo.map((c) => (
            <div key={c.id} className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URI, no benefit from next/image optimization */}
              <img src={c.qrDataUrl} alt="UPI payment QR code" width={110} height={110} className="h-fit rounded-lg border border-zinc-100" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{c.title}</h3>
                  <div className="flex shrink-0 gap-2 text-xs">
                    <Link href={`/classes/${c.id}/edit`} className="text-zinc-500 hover:underline">
                      {t("kundli.edit")}
                    </Link>
                    <ConfirmSubmitForm
                      action={deleteClass.bind(null, c.id)}
                      confirmMessage={t("kundli.confirmDelete")}
                      label={t("common.remove")}
                      className="text-red-500 hover:underline"
                    />
                  </div>
                </div>
                <div className="text-sm text-zinc-600">
                  {new Date(c.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                  {c.durationMins} mins
                </div>
                <div className="text-lg font-semibold text-zinc-900">₹{c.feeInRupees.toFixed(0)}</div>
                {c.description && <p className="text-sm text-zinc-600">{c.description}</p>}
                {c.meetingLink && (
                  <a href={c.meetingLink} className="text-sm text-blue-600 hover:underline">
                    Meeting link
                  </a>
                )}
                <a
                  href={c.upiLink}
                  className="mt-2 inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {t("classes.payVia")}
                </a>
                <p className="mt-1 text-xs text-zinc-400">{t("classes.shareNote")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

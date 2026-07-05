import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { parseEnabledModules, TIER_LABELS, type TierKey } from "@/lib/auth/modules";
import { createUser, deleteUser, updateUserModules, updateUserRole } from "../actions";
import { getTranslations } from "@/lib/i18n/server";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { TierModulesForm } from "@/components/TierModulesForm";

export default async function AdminUsersPage() {
  const admin = await requireUser();
  if (admin.role !== "ADMIN") notFound();
  const { t } = await getTranslations();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { clients: true, videos: true, classes: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("admin.title")}</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("admin.subtitle")}</p>
        </div>
        <Link href="/admin/kundlis" className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-500">
          {t("admin.allKundlisLink")}
        </Link>
      </div>

      <form action={createUser} className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("admin.addUserEmail")}
          <input
            name="email"
            type="email"
            required
            placeholder="astrologer@example.com"
            className="w-72 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
          {t("admin.addUser")}
        </button>
        <p className="w-full text-xs text-zinc-400 dark:text-zinc-500">{t("admin.addUserNote")}</p>
      </form>

      <div className="flex flex-col gap-4">
        {users.map((u) => {
          const enabled = parseEnabledModules(u.enabledModules);
          return (
            <div key={u.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">
                    {u.email} {u.role === "ADMIN" && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-500">ADMIN</span>}
                    <span className="ml-1 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {TIER_LABELS[u.tier as TierKey] ?? u.tier}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("admin.joined")} {new Date(u.createdAt).toISOString().slice(0, 10)} · {u._count.clients} clients ·{" "}
                    {u._count.videos} videos · {u._count.classes} classes
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateUserRole.bind(null, u.id)} className="flex items-center gap-2">
                    <select name="role" defaultValue={u.role} className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button type="submit" className="rounded-lg border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                      {t("admin.updateRole")}
                    </button>
                  </form>
                  {u.id !== admin.id && (
                    <ConfirmSubmitForm
                      action={deleteUser.bind(null, u.id)}
                      confirmMessage={t("admin.confirmDeleteUser")}
                      label={t("kundli.delete")}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 dark:text-red-400"
                    />
                  )}
                </div>
              </div>

              <TierModulesForm
                action={updateUserModules.bind(null, u.id)}
                defaultTier={(u.tier as TierKey) ?? "SILVER"}
                enabledModules={enabled}
                disabled={u.role === "ADMIN"}
                labels={{ tier: t("admin.tier"), save: t("admin.saveModules") }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

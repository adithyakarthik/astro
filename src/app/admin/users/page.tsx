import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { ALL_MODULES, MODULE_LABELS, parseEnabledModules } from "@/lib/auth/modules";
import { updateUserModules, updateUserRole } from "../actions";
import { getTranslations } from "@/lib/i18n/server";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("admin.title")}</h1>
        <p className="mt-1 text-zinc-600">{t("admin.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4">
        {users.map((u) => {
          const enabled = parseEnabledModules(u.enabledModules);
          return (
            <div key={u.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">
                    {u.email} {u.role === "ADMIN" && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">ADMIN</span>}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {t("admin.joined")} {new Date(u.createdAt).toISOString().slice(0, 10)} · {u._count.clients} clients ·{" "}
                    {u._count.videos} videos · {u._count.classes} classes
                  </div>
                </div>
                <form action={updateUserRole.bind(null, u.id)} className="flex items-center gap-2">
                  <select name="role" defaultValue={u.role} className="rounded-lg border border-zinc-300 px-2 py-1 text-xs">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button type="submit" className="rounded-lg border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50">
                    {t("admin.updateRole")}
                  </button>
                </form>
              </div>

              <form action={updateUserModules.bind(null, u.id)} className="mt-3 flex flex-wrap items-center gap-4">
                {ALL_MODULES.map((moduleKey) => (
                  <label key={moduleKey} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      name={`module-${moduleKey}`}
                      defaultChecked={enabled.includes(moduleKey)}
                      disabled={u.role === "ADMIN"}
                    />
                    {MODULE_LABELS[moduleKey]}
                  </label>
                ))}
                <button
                  type="submit"
                  disabled={u.role === "ADMIN"}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
                >
                  {t("admin.saveModules")}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}

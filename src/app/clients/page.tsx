import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { kundlis: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <Link
          href="/clients/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Add client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          No clients yet. Add your first client to generate their kundli.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Kundlis</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium text-zinc-900 hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{client.email ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{client._count.kundlis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { kundlis: { orderBy: { createdAt: "desc" } } },
  });

  if (!client) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/clients" className="text-sm text-zinc-500 hover:underline">
          ← All clients
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{client.name}</h1>
        <p className="text-zinc-600">
          {client.phone ?? "No phone"} · {client.email ?? "No email"}
        </p>
        {client.notes && <p className="mt-2 text-sm text-zinc-500">{client.notes}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kundlis</h2>
        <Link
          href={`/clients/${client.id}/kundli/new`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Add kundli
        </Link>
      </div>

      {client.kundlis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          No kundlis yet for this client.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {client.kundlis.map((k) => (
            <Link
              key={k.id}
              href={`/kundli/${k.id}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 hover:shadow"
            >
              <div className="font-medium">{k.name}</div>
              <div className="text-sm text-zinc-500">
                {new Date(k.birthDate).toUTCString()} · {k.birthPlace}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

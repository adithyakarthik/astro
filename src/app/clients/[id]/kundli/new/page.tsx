import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { createKundli } from "@/app/clients/actions";
import { COMMON_TIMEZONES } from "@/lib/astro/birth-utils";

export default async function NewKundliPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  const createKundliForClient = createKundli.bind(null, client.id);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Add kundli for {client.name}</h1>
      <p className="mt-1 text-zinc-600">
        Enter exact birth date, time and place. Accuracy of the chart depends entirely on getting these right —
        especially birth time, which determines the Ascendant and house positions.
      </p>

      <form
        action={createKundliForClient}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Chart name *
          <input
            name="name"
            required
            placeholder={client.name}
            defaultValue={client.name}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Gender
          <select name="gender" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Birth date & time (local, as told by the client) *
          <input
            name="birthDateLocal"
            type="datetime-local"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Birth timezone *
          <select
            name="timezoneOffsetMinutes"
            required
            defaultValue={330}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.label} value={tz.offsetMinutes}>
                {tz.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Birth place (city, country) *
          <input
            name="birthPlace"
            required
            placeholder="e.g. Chennai, India"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Latitude *
            <input
              name="latitude"
              type="number"
              step="any"
              required
              placeholder="13.0827"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Longitude *
            <input
              name="longitude"
              type="number"
              step="any"
              required
              placeholder="80.2707"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <p className="-mt-2 text-xs text-zinc-500">
          Tip: search &ldquo;[city name] latitude longitude&rdquo; on any maps site to find these. Use positive
          longitude for East, negative for West.
        </p>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Generate kundli
        </button>
      </form>
    </div>
  );
}

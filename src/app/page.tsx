import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function Home() {
  const [clientCount, kundliCount, videoCount, classCount] = await Promise.all([
    prisma.client.count(),
    prisma.kundli.count(),
    prisma.videoContent.count(),
    prisma.classAnnouncement.count(),
  ]);

  const cards = [
    { href: "/clients", label: "Clients", count: clientCount, blurb: "People you've stored" },
    { href: "/clients", label: "Kundlis", count: kundliCount, blurb: "Charts generated" },
    { href: "/videos", label: "Videos published", count: videoCount, blurb: "YouTube content" },
    { href: "/classes", label: "Classes announced", count: classCount, blurb: "With payment links" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-zinc-600">
          Manage client kundlis, publish videos, and collect class payments via UPI — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <div className="text-3xl font-semibold">{card.count}</div>
            <div className="mt-1 font-medium text-zinc-800">{card.label}</div>
            <div className="text-sm text-zinc-500">{card.blurb}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/clients/new"
          className="rounded-xl bg-zinc-900 px-5 py-4 text-center font-medium text-white hover:bg-zinc-800"
        >
          + Add client & kundli
        </Link>
        <Link
          href="/videos/new"
          className="rounded-xl border border-zinc-300 bg-white px-5 py-4 text-center font-medium hover:bg-zinc-50"
        >
          + Publish a video
        </Link>
        <Link
          href="/classes/new"
          className="rounded-xl border border-zinc-300 bg-white px-5 py-4 text-center font-medium hover:bg-zinc-50"
        >
          + Announce a class
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Astrology tools</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Beyond the birth chart itself — the other everyday tools of a Vedic astrology practice.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/matchmaking"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <div className="font-medium text-zinc-800">Match Making</div>
            <div className="text-sm text-zinc-500">Ashtakoot Guna Milan (36-point) compatibility scoring</div>
          </Link>
          <Link
            href="/muhurta"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <div className="font-medium text-zinc-800">Muhurta / Panchang</div>
            <div className="text-sm text-zinc-500">Tithi, nakshatra, yoga, karana, Rahu Kalam & more for any date</div>
          </Link>
          <Link
            href="/transits"
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <div className="font-medium text-zinc-800">Transits (Gochar)</div>
            <div className="text-sm text-zinc-500">Current planetary positions against any client&apos;s chart</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

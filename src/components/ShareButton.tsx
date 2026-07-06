"use client";

export function ShareButton({
  title,
  shopName,
  heading,
  tags,
  description,
  address,
  latitude,
  longitude,
  label,
}: {
  title: string;
  shopName?: string | null;
  heading: string;
  tags: string[];
  description?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  label: string;
}) {
  function handleShare() {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const lines = [
      `📍 ${title}${shopName ? ` — ${shopName}` : ""}`,
      [heading, ...tags].filter(Boolean).join(" • "),
      description || null,
      address || null,
      mapsUrl,
    ].filter(Boolean);
    const text = lines.join("\n");

    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
    >
      {label}
    </button>
  );
}

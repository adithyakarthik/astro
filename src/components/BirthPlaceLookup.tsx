"use client";

import { useState, useTransition } from "react";
import { lookupPlaceAction } from "@/app/clients/geocode-action";

export function BirthPlaceLookup({
  defaultPlace = "",
  defaultLatitude,
  defaultLongitude,
  labels,
}: {
  defaultPlace?: string;
  defaultLatitude?: number;
  defaultLongitude?: number;
  labels?: { place?: string; lat?: string; lon?: string; find?: string; tip?: string };
}) {
  const [place, setPlace] = useState(defaultPlace);
  const [latitude, setLatitude] = useState(defaultLatitude !== undefined ? String(defaultLatitude) : "");
  const [longitude, setLongitude] = useState(defaultLongitude !== undefined ? String(defaultLongitude) : "");
  const [status, setStatus] = useState<"idle" | "found" | "notfound" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleLookup() {
    if (!place.trim()) return;
    startTransition(async () => {
      try {
        const result = await lookupPlaceAction(place);
        if (result) {
          setLatitude(result.latitude.toFixed(4));
          setLongitude(result.longitude.toFixed(4));
          setStatus("found");
        } else {
          setStatus("notfound");
        }
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels?.place ?? "Birth place (city, country)"} *
        <div className="flex gap-2">
          <input
            name="birthPlace"
            required
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. Chennai, India"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={isPending}
            className="whitespace-nowrap rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            {isPending ? "Finding…" : (labels?.find ?? "Find location")}
          </button>
        </div>
      </label>
      {status === "found" && (
        <p className="-mt-2 text-xs text-emerald-600">Found it — coordinates filled in below. Double check they look right.</p>
      )}
      {status === "notfound" && (
        <p className="-mt-2 text-xs text-amber-600">Couldn&apos;t find that place automatically — enter latitude/longitude manually below.</p>
      )}
      {status === "error" && (
        <p className="-mt-2 text-xs text-red-600">Lookup failed (network issue) — enter latitude/longitude manually below.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels?.lat ?? "Latitude"} *
          <input
            name="latitude"
            type="number"
            step="any"
            required
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="13.0827"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels?.lon ?? "Longitude"} *
          <input
            name="longitude"
            type="number"
            step="any"
            required
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="80.2707"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <p className="-mt-2 text-xs text-zinc-500">
        {labels?.tip ??
          'Click "Find location" to auto-fill coordinates, or search "[city name] latitude longitude" on any maps site. The correct timezone is detected automatically from these coordinates — no need to pick one manually.'}
      </p>
    </div>
  );
}

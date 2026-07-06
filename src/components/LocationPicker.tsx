"use client";

import { useState, useTransition } from "react";
import { lookupPlaceAction, reverseGeocodeAction } from "@/app/finds/geocode-actions";

export function LocationPicker({
  defaultAddress = "",
  defaultLatitude,
  defaultLongitude,
  labels,
}: {
  defaultAddress?: string;
  defaultLatitude?: number;
  defaultLongitude?: number;
  labels: {
    address: string;
    search: string;
    useMyLocation: string;
    locating: string;
    lat: string;
    lon: string;
    openInMaps: string;
    found: string;
    notFound: string;
    error: string;
    locationError: string;
  };
}) {
  const [address, setAddress] = useState(defaultAddress);
  const [latitude, setLatitude] = useState(defaultLatitude !== undefined ? String(defaultLatitude) : "");
  const [longitude, setLongitude] = useState(defaultLongitude !== undefined ? String(defaultLongitude) : "");
  const [status, setStatus] = useState<"idle" | "found" | "notfound" | "error" | "locating">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    if (!address.trim()) return;
    startTransition(async () => {
      try {
        const result = await lookupPlaceAction(address);
        if (result) {
          setLatitude(result.latitude.toFixed(6));
          setLongitude(result.longitude.toFixed(6));
          setAddress(result.displayName);
          setStatus("found");
        } else {
          setStatus("notfound");
        }
      } catch {
        setStatus("error");
      }
    });
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lon.toFixed(6));
        startTransition(async () => {
          try {
            const displayName = await reverseGeocodeAction(lat, lon);
            if (displayName) setAddress(displayName);
          } finally {
            // Coordinates are already filled in; even if reverse geocoding
            // fails we must clear the "locating" state so the button re-enables.
            setStatus("found");
          }
        });
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const mapsUrl = latitude && longitude ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : null;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        {labels.address}
        <div className="flex flex-wrap gap-2">
          <input
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Commercial Street, Bengaluru"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isPending}
            className="whitespace-nowrap rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {labels.search}
          </button>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={status === "locating"}
            className="whitespace-nowrap rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {status === "locating" ? labels.locating : labels.useMyLocation}
          </button>
        </div>
      </label>

      {status === "found" && <p className="-mt-2 text-xs text-emerald-600 dark:text-emerald-400">{labels.found}</p>}
      {status === "notfound" && <p className="-mt-2 text-xs text-amber-600 dark:text-amber-500">{labels.notFound}</p>}
      {status === "error" && <p className="-mt-2 text-xs text-red-600 dark:text-red-400">{labels.locationError}</p>}

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels.lat} *
          <input
            name="latitude"
            type="number"
            step="any"
            required
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {labels.lon} *
          <input
            name="longitude"
            type="number"
            step="any"
            required
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
      </div>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-sm font-medium text-amber-700 hover:underline dark:text-amber-500"
        >
          {labels.openInMaps} ↗
        </a>
      )}
    </div>
  );
}

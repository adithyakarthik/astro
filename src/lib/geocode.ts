// Free geocoding via OpenStreetMap's Nominatim — no API key needed. Per their
// usage policy we send a descriptive User-Agent and keep requests infrequent
// (this is only called when a user clicks "Find location", not on every
// keystroke).
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "JKVedanshAstro/1.0 (Vedic astrology practice management app)",
    },
  });
  if (!response.ok) return null;

  const results = (await response.json()) as { lat: string; lon: string; display_name: string }[];
  if (!Array.isArray(results) || results.length === 0) return null;

  const first = results[0];
  const latitude = parseFloat(first.lat);
  const longitude = parseFloat(first.lon);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  return { latitude, longitude, displayName: first.display_name };
}

export async function reverseGeocodePlace(latitude: number, longitude: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "JKVedanshAstro/1.0 (Vedic astrology practice management app)",
    },
  });
  if (!response.ok) return null;

  const result = (await response.json()) as { display_name?: string };
  return result.display_name ?? null;
}

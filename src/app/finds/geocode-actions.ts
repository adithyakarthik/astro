"use server";

import { requireUser } from "@/lib/auth/session";
import { geocodePlace, reverseGeocodePlace, type GeocodeResult } from "@/lib/geocode";

export async function lookupPlaceAction(query: string): Promise<GeocodeResult | null> {
  await requireUser();
  try {
    return await geocodePlace(query);
  } catch {
    return null;
  }
}

export async function reverseGeocodeAction(latitude: number, longitude: number): Promise<string | null> {
  await requireUser();
  try {
    return await reverseGeocodePlace(latitude, longitude);
  } catch {
    return null;
  }
}

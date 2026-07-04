"use server";

import { requireUser } from "@/lib/auth/session";
import { geocodePlace, type GeocodeResult } from "@/lib/geocode";

export async function lookupPlaceAction(query: string): Promise<GeocodeResult | null> {
  await requireUser();
  try {
    return await geocodePlace(query);
  } catch {
    return null;
  }
}

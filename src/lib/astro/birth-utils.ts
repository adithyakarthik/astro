import tzlookup from "tz-lookup";

/**
 * Converts a birth date/time entered in local (civil) time plus a timezone
 * offset into a UTC instant the astrology engine can consume.
 *
 * @param localDateTime - value from an `<input type="datetime-local">`, e.g. "1990-01-15T10:00"
 * @param timezoneOffsetMinutes - minutes EAST of UTC (e.g. IST = +330, PST = -480)
 */
export function localBirthToUtc(
  localDateTime: string,
  timezoneOffsetMinutes: number
): Date {
  const [datePart, timePart] = localDateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart ?? "00:00").split(":").map(Number);

  // Treat the entered numbers as a UTC instant first, then shift by the
  // offset so we land on the true UTC instant of birth.
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  return new Date(asIfUtc - timezoneOffsetMinutes * 60 * 1000);
}

/**
 * The historical UTC offset (in minutes, east positive) that `ianaZone` was
 * observing at `approxUtcInstant`. Works entirely offline via the JS Intl
 * API's bundled tzdata, which includes historical rule changes (DST,
 * governments redefining their zone, etc.) — not just the current offset.
 */
function utcOffsetMinutesForZoneAt(ianaZone: string, approxUtcInstant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(approxUtcInstant).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asIfUtc - approxUtcInstant.getTime()) / 60000);
}

export interface AutoTimezoneResult {
  utcDate: Date;
  timezoneOffsetMinutes: number;
  ianaZone: string;
}

/**
 * Converts a birth date/time entered in local (civil) time to UTC,
 * automatically determining the correct historical UTC offset from the
 * birth coordinates — no manual timezone selection needed, and no risk of
 * picking the wrong zone from a dropdown.
 */
export function localBirthToUtcAuto(
  localDateTime: string,
  latitude: number,
  longitude: number
): AutoTimezoneResult {
  const [datePart, timePart] = localDateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart ?? "00:00").split(":").map(Number);

  // First approximation: treat the entered wall-clock numbers as if they
  // were already UTC. This is only used to look up what offset the zone
  // had *around* that moment — accurate to within a day, which is all
  // that's needed since offsets essentially never change more than once
  // within 24 hours.
  const naiveAsUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  const ianaZone = tzlookup(latitude, longitude);
  const timezoneOffsetMinutes = utcOffsetMinutesForZoneAt(ianaZone, naiveAsUtc);
  const utcDate = new Date(naiveAsUtc.getTime() - timezoneOffsetMinutes * 60 * 1000);

  return { utcDate, timezoneOffsetMinutes, ianaZone };
}

/** Reconstructs the original local wall-clock time from a stored UTC instant + offset, for display. */
export function utcToLocalParts(utcDate: Date, timezoneOffsetMinutes: number) {
  const shifted = new Date(utcDate.getTime() + timezoneOffsetMinutes * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

export function formatOffset(timezoneOffsetMinutes: number): string {
  const sign = timezoneOffsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(timezoneOffsetMinutes);
  const hh = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const mm = (abs % 60).toString().padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

export const COMMON_TIMEZONES: { label: string; offsetMinutes: number }[] = [
  { label: "India Standard Time (UTC+5:30)", offsetMinutes: 330 },
  { label: "UTC (GMT+0:00)", offsetMinutes: 0 },
  { label: "US Eastern (UTC-5:00)", offsetMinutes: -300 },
  { label: "US Pacific (UTC-8:00)", offsetMinutes: -480 },
  { label: "UK (UTC+0:00)", offsetMinutes: 0 },
  { label: "UAE (UTC+4:00)", offsetMinutes: 240 },
  { label: "Singapore (UTC+8:00)", offsetMinutes: 480 },
  { label: "Australia Eastern (UTC+10:00)", offsetMinutes: 600 },
];

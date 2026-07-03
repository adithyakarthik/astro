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

import { computePanchang } from "@/lib/astro/panchang";
import { computeTamilCalendarDate } from "@/lib/astro/tamil-calendar";
import { COMMON_TIMEZONES } from "@/lib/astro/birth-utils";

function fmtTime(date: Date, tzOffsetMinutes: number) {
  const shifted = new Date(date.getTime() + tzOffsetMinutes * 60 * 1000);
  const hh = shifted.getUTCHours().toString().padStart(2, "0");
  const mm = shifted.getUTCMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export default async function MuhurtaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const date = params.date || today;
  const latitude = Number(params.latitude ?? 28.6139); // default: New Delhi
  const longitude = Number(params.longitude ?? 77.209);
  const tzOffsetMinutes = Number(params.tz ?? 330);

  const [year, month, day] = date.split("-").map(Number);
  const dateAtNoonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const panchang = computePanchang({ dateUtcNoon: dateAtNoonUtc, latitude, longitude });
  const tamilDate = computeTamilCalendarDate(dateAtNoonUtc);

  const windowRow = (label: string, w: { start: Date; end: Date }, tone: string) => (
    <tr className="border-t border-zinc-100">
      <td className="py-1.5 pr-4 font-medium">{label}</td>
      <td className={`py-1.5 pr-4 ${tone}`}>
        {fmtTime(w.start, tzOffsetMinutes)} – {fmtTime(w.end, tzOffsetMinutes)}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Muhurta / Panchang</h1>
        <p className="mt-1 text-zinc-600">
          Look up the Panchang (tithi, nakshatra, yoga, karana) and the standard auspicious/inauspicious time
          windows for any date and place — useful for picking a muhurta for classes, ceremonies, or new
          beginnings.
        </p>
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-5">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Date
          <input name="date" type="date" defaultValue={date} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Latitude
          <input name="latitude" type="number" step="any" defaultValue={latitude} className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Longitude
          <input name="longitude" type="number" step="any" defaultValue={longitude} className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Timezone
          <select name="tz" defaultValue={tzOffsetMinutes} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.label} value={tz.offsetMinutes}>
                {tz.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Look up
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold">Panchang for {date}</h2>
          <table className="w-full text-left text-sm">
            <tbody>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium">Weekday</td>
                <td className="py-1.5 pr-4">{panchang.weekday}</td>
              </tr>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium">Sunrise / Sunset</td>
                <td className="py-1.5 pr-4">
                  {fmtTime(panchang.sunrise, tzOffsetMinutes)} – {fmtTime(panchang.sunset, tzOffsetMinutes)}
                </td>
              </tr>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium">Tithi</td>
                <td className="py-1.5 pr-4">
                  {panchang.tithi.name} ({panchang.tithi.paksha} Paksha)
                </td>
              </tr>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium">Nakshatra</td>
                <td className="py-1.5 pr-4">{panchang.nakshatra.name}</td>
              </tr>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium">Yoga</td>
                <td className="py-1.5 pr-4">{panchang.yoga.name}</td>
              </tr>
              <tr className="border-t border-zinc-100">
                <td className="py-1.5 pr-4 font-medium">Karana</td>
                <td className="py-1.5 pr-4">{panchang.karana.name}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-zinc-400">
            Computed at sunrise, following standard Panchang convention. Timings shown in the selected timezone.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold">Time windows</h2>
          <table className="w-full text-left text-sm">
            <tbody>
              {windowRow("Rahu Kalam (avoid)", panchang.rahuKalam, "text-red-600")}
              {windowRow("Yamagandam (avoid)", panchang.yamagandam, "text-red-600")}
              {windowRow("Gulika Kalam (avoid)", panchang.gulikaKalam, "text-red-600")}
              {windowRow("Abhijit Muhurta (favourable)", panchang.abhijitMuhurta, "text-emerald-600")}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-zinc-400">
            Rahu Kalam/Yamagandam/Gulika Kalam are traditionally avoided for starting new ventures; Abhijit
            Muhurta (midday) is traditionally considered favourable on most days.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">தமிழ் நாள்காட்டி — Tamil Calendar (Jamakkol style)</h2>
          <table className="w-full max-w-md text-left text-sm">
            <tbody>
              <tr className="border-t border-zinc-200">
                <td className="py-1.5 pr-4 font-medium">தமிழ் மாதம் (Tamil month)</td>
                <td className="py-1.5 pr-4">{tamilDate.monthName}</td>
              </tr>
              <tr className="border-t border-zinc-200">
                <td className="py-1.5 pr-4 font-medium">தேதி (Day of month)</td>
                <td className="py-1.5 pr-4">{tamilDate.day}</td>
              </tr>
              <tr className="border-t border-zinc-200">
                <td className="py-1.5 pr-4 font-medium">கிழமை (Weekday)</td>
                <td className="py-1.5 pr-4">{tamilDate.weekdayName}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-zinc-500">
            The Tamil month is determined by the Sun&apos;s sidereal position (reliable). The day-of-month is
            approximate — it can be off by a day right at a month boundary, since exact traditional reckoning
            also depends on the time of day the month changed relative to sunrise. The 60-year Tamil year name
            is intentionally not shown, since it has known regional variations that need care to get right —
            see ROADMAP.md.
          </p>
        </div>
      </div>
    </div>
  );
}

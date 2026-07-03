// Quick manual smoke test for the astrology engine — not an automated test
// suite. Run with `npm run engine:demo`. Edit the birth details below to try
// your own chart from the command line.
import { computeKundli } from "../src/lib/astro/engine";

// Birth details in UTC. If you have a local time + timezone, convert to UTC
// first (e.g. IST is UTC+5:30, so subtract 5h30m).
const utcDate = new Date(Date.UTC(1990, 0, 15, 4, 30, 0));

const result = computeKundli({
  utcDate,
  latitude: 13.0827, // Chennai
  longitude: 80.2707,
});

console.log(JSON.stringify(result, null, 2));

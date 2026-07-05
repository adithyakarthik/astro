// Placidus house cusps — the house system KP (Krishnamurti Paddhati)
// practice specifically requires for cuspal sub-lords, as opposed to the
// whole-sign/equal-house convention used everywhere else in this app.
//
// Placidus divides each point's own diurnal/nocturnal semi-arc into thirds
// (giving houses 11/12 and 2/3 respectively), which makes it the one
// classical house system with no closed-form solution — the semi-arc of a
// candidate point depends on that same point's declination, so cusps 11,
// 12, 2, 3 require fixed-point iteration. Cusps 1 (Asc), 4 (IC), 7 (Desc),
// and 10 (MC) are closed-form; 5/6/8/9 are the exact antipodes of 11/12/2/3
// (a standard property of all quadrant house systems).
//
// Derivation was verified against the equator degenerate case (where every
// point's semi-diurnal arc is exactly 90°, giving closed-form 30°-spaced
// cusps we can check by hand) before being trusted — see
// scripts/verify-houses.ts for the checks run during development.

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Ecliptic longitude (deg) of the point with right ascension α (deg), given obliquity ε (rad). */
function eclipticLongitudeFromRa(alphaDeg: number, oblRad: number): number {
  return norm360(Math.atan2(Math.sin(alphaDeg * D2R), Math.cos(alphaDeg * D2R) * Math.cos(oblRad)) * R2D);
}

/**
 * Semi-diurnal arc (deg) for a point of ecliptic longitude λ, at latitude
 * φ (rad) and obliquity ε (rad). Returns null if the point is circumpolar
 * at this latitude (Placidus is undefined there — happens near/above the
 * polar circles for high-declination points).
 */
function semiDiurnalArcDeg(lambdaDeg: number, latRad: number, oblRad: number): number | null {
  const decRad = Math.asin(Math.sin(oblRad) * Math.sin(lambdaDeg * D2R));
  const arg = -Math.tan(latRad) * Math.tan(decRad);
  if (arg < -1 || arg > 1) return null;
  return Math.acos(arg) * R2D;
}

/**
 * Solves for the ecliptic longitude of a Placidus intermediate cusp via
 * fixed-point iteration: the cusp's right ascension equals `anchorRaDeg`
 * plus (or minus, for the nocturnal-arc cusps) `fraction` of its own
 * (diurnal or nocturnal) semi-arc.
 *
 * The sign differs between the two quadrants because houses increase in
 * the direction MC(10)->11->12->Asc(1)->2->3->IC(4): cusps 11/12 sit
 * *after* MC in that direction (RA = RAMC + fraction*SDA), while cusps
 * 2/3 sit *before* IC in that direction (RA = RA(IC) - fraction*NSA) —
 * confirmed against the equator degenerate case in scripts/verify-houses.ts,
 * which caught this sign being wrong for 2/3 during development.
 */
function solvePlacidusCusp(
  anchorRaDeg: number,
  fraction: number,
  useNocturnalArc: boolean,
  latRad: number,
  oblRad: number
): number | null {
  const sign = useNocturnalArc ? -1 : 1;
  let lambda = norm360(anchorRaDeg);
  for (let i = 0; i < 30; i++) {
    const sda = semiDiurnalArcDeg(lambda, latRad, oblRad);
    if (sda === null) return null;
    const arc = useNocturnalArc ? 180 - sda : sda;
    const alphaTarget = norm360(anchorRaDeg + sign * fraction * arc);
    const next = eclipticLongitudeFromRa(alphaTarget, oblRad);
    const delta = ((next - lambda + 540) % 360) - 180;
    lambda = next;
    if (Math.abs(delta) < 1e-8) break;
  }
  return norm360(lambda);
}

/**
 * Placidus house cusps, tropical ecliptic longitude in degrees.
 * Returns [cusp1(Asc), cusp2, ..., cusp12] or null if any intermediate
 * cusp is circumpolar-undefined at this latitude (caller should fall back
 * to another house system, e.g. whole-sign, in that case).
 *
 * `ascendantDeg` and `ramcDeg` are passed in rather than recomputed, so
 * this always agrees exactly with the rest of the app's (verified)
 * Ascendant — no risk of the two subtly diverging.
 */
export function placidusCuspsTropicalDeg(
  ramcDeg: number,
  ascendantDeg: number,
  latitudeDeg: number,
  obliquityDeg: number
): number[] | null {
  const latRad = latitudeDeg * D2R;
  const oblRad = obliquityDeg * D2R;

  const mcDeg = eclipticLongitudeFromRa(ramcDeg, oblRad);
  const icDeg = norm360(mcDeg + 180);
  const descDeg = norm360(ascendantDeg + 180);

  const cusp11 = solvePlacidusCusp(ramcDeg, 1 / 3, false, latRad, oblRad);
  const cusp12 = solvePlacidusCusp(ramcDeg, 2 / 3, false, latRad, oblRad);
  const cusp3 = solvePlacidusCusp(norm360(ramcDeg + 180), 1 / 3, true, latRad, oblRad);
  const cusp2 = solvePlacidusCusp(norm360(ramcDeg + 180), 2 / 3, true, latRad, oblRad);

  if (cusp11 === null || cusp12 === null || cusp3 === null || cusp2 === null) return null;

  const cusp5 = norm360(cusp11 + 180);
  const cusp6 = norm360(cusp12 + 180);
  const cusp8 = norm360(cusp2 + 180);
  const cusp9 = norm360(cusp3 + 180);

  return [ascendantDeg, cusp2, cusp3, icDeg, cusp5, cusp6, descDeg, cusp8, cusp9, mcDeg, cusp11, cusp12];
}

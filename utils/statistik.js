// Kumulative Standardnormalverteilung N(x) — wird sowohl von Black-Scholes
// (Aktienoptionen) als auch von Black-76 (Futures-Optionen) gebraucht.
// Näherungsformel nach Abramowitz & Stegun (26.2.17), Fehler < 1e-7.
export function normalCdf(x) {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228; // 1 / sqrt(2*pi)

  if (x < 0) {
    return 1 - normalCdf(-x);
  }

  const t = 1 / (1 + p * x);
  const polynom = t * (t * (t * (t * b5 + b4) + b3) + b2) + b1;
  return 1 - c * Math.exp((-x * x) / 2) * t * polynom;
}

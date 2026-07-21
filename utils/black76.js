import { normalCdf } from './statistik';

// Black-76 für europäische Optionen auf Futures (z. B. WTI Crude Oil an
// der NYMEX). F = Futures-Preis, K = Basispreis (Strike), T = Laufzeit in
// Jahren, r = risikofreier Zinssatz (z. B. 0.04 für 4 %), sigma =
// Volatilität des Futures (z. B. 0.35 für 35 %).
export function black76({ F, K, T, r, sigma }) {
  if (T <= 0 || sigma <= 0) {
    return {
      call: Math.max(F - K, 0),
      put: Math.max(K - F, 0),
      d1: 0,
      d2: 0,
    };
  }

  const d1 =
    (Math.log(F / K) + 0.5 * sigma * sigma * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const diskontfaktor = Math.exp(-r * T);

  const call = diskontfaktor * (F * normalCdf(d1) - K * normalCdf(d2));
  const put = diskontfaktor * (K * normalCdf(-d2) - F * normalCdf(-d1));

  return { call, put, d1, d2 };
}

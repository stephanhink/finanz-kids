import { normalCdf } from './statistik';

// Black-Scholes-Merton für europäische Aktienoptionen mit kontinuierlicher
// Dividendenrendite q. S = Aktienkurs, K = Basispreis (Strike), T = Laufzeit
// in Jahren, r = risikofreier Zinssatz (z. B. 0.03 für 3 %), sigma =
// Volatilität (z. B. 0.25 für 25 %).
export function blackScholes({ S, K, T, r, sigma, q = 0 }) {
  if (T <= 0 || sigma <= 0) {
    return {
      call: Math.max(S - K, 0),
      put: Math.max(K - S, 0),
      d1: 0,
      d2: 0,
    };
  }

  const d1 =
    (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) /
    (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const call =
    S * Math.exp(-q * T) * normalCdf(d1) - K * Math.exp(-r * T) * normalCdf(d2);
  const put =
    K * Math.exp(-r * T) * normalCdf(-d2) - S * Math.exp(-q * T) * normalCdf(-d1);

  return { call, put, d1, d2 };
}

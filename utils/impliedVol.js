import { binomialFuturesOption } from './binomialFutures';

// Löst per Bisektion nach σ auf, sodass der amerikanische Binomialbaum-
// Preis dem beobachteten Marktpreis entspricht ("Preis → σ" statt der
// üblichen Richtung "σ → Preis"). Bisektion statt Newton-Raphson, weil
// der Preis in σ streng monoton steigend, aber nicht überall differenzierbar
// ist (frühzeitige Ausübung) — Bisektion braucht dafür keine Ableitung und
// ist robust genug für unsere Zwecke.
export function impliziteVolatilitaet({ F, K, T, r, marktpreis, optionsTyp }) {
  if (T <= 0 || !(marktpreis > 0)) {
    return null;
  }

  const intrinsischerWert =
    optionsTyp === 'call' ? Math.max(F - K, 0) : Math.max(K - F, 0);
  if (marktpreis < intrinsischerWert) {
    return null; // arbitragefrei nicht erreichbar
  }

  const preisBeiSigma = (sigma) => {
    const { call, put } = binomialFuturesOption({ F, K, T, r, sigma });
    return optionsTyp === 'call' ? call : put;
  };

  let unten = 0.001; // 0,1 %
  let oben = 3; // 300 %
  if (marktpreis > preisBeiSigma(oben)) {
    return null; // Marktpreis unrealistisch hoch, außerhalb des Suchbereichs
  }

  for (let i = 0; i < 40; i++) {
    const mitte = (unten + oben) / 2;
    const preis = preisBeiSigma(mitte);
    if (preis < marktpreis) {
      unten = mitte;
    } else {
      oben = mitte;
    }
  }
  return (unten + oben) / 2;
}

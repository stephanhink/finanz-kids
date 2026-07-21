// CRR-Binomialbaum (Cox-Ross-Rubinstein) für amerikanische Optionen auf
// Futures — im Unterschied zu Black-76 darf hier an jedem Knoten vorzeitig
// ausgeübt werden, was bei echten NYMEX-WTI-Optionen (American-style)
// tatsächlich der Fall ist.
//
// Der Futures-Preis hat unter dem risikoneutralen Terminmaß keine Drift
// (anders als ein Aktienkurs), deshalb: u = e^(sigma*sqrt(dt)), d = 1/u,
// und die risikoneutrale Wahrscheinlichkeit p = (1-d)/(u-d), ganz ohne
// Zinsterm im Zähler. Diskontiert wird trotzdem mit e^(-r*dt) pro Schritt.
export function binomialFuturesOption({ F, K, T, r, sigma, schritte = 100 }) {
  if (T <= 0 || sigma <= 0) {
    return {
      call: Math.max(F - K, 0),
      put: Math.max(K - F, 0),
    };
  }

  return {
    call: preisBerechnen({ F, K, T, r, sigma, schritte, optionsTyp: 'call' }),
    put: preisBerechnen({ F, K, T, r, sigma, schritte, optionsTyp: 'put' }),
  };
}

function preisBerechnen({ F, K, T, r, sigma, schritte, optionsTyp }) {
  const dt = T / schritte;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const diskontProSchritt = Math.exp(-r * dt);
  const p = (1 - d) / (u - d);

  // Optionswerte am letzten Knoten (Verfall) für jeden möglichen Pfad
  const werte = new Array(schritte + 1);
  for (let j = 0; j <= schritte; j++) {
    const futuresPreis = F * Math.pow(u, j) * Math.pow(d, schritte - j);
    werte[j] = auszahlung(futuresPreis, K, optionsTyp);
  }

  // Rückwärts durch den Baum: an jedem Knoten Haltewert gegen sofortigen
  // Ausübungswert vergleichen — das Maximum gewinnt (vorzeitige Ausübung).
  for (let i = schritte - 1; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      const haltewert =
        diskontProSchritt * (p * werte[j + 1] + (1 - p) * werte[j]);
      const futuresPreis = F * Math.pow(u, j) * Math.pow(d, i - j);
      werte[j] = Math.max(haltewert, auszahlung(futuresPreis, K, optionsTyp));
    }
  }

  return werte[0];
}

function auszahlung(futuresPreis, K, optionsTyp) {
  return optionsTyp === 'call'
    ? Math.max(futuresPreis - K, 0)
    : Math.max(K - futuresPreis, 0);
}

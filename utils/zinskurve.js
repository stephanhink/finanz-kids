// Lädt die tägliche "Daily Par Yield Curve" direkt vom US-Finanzministerium.
// Im Gegensatz zu Yahoo Finance (nur 4 Ticker: 13 Wochen, 5, 10, 30 Jahre)
// liefert diese offizielle, kostenlose Quelle 14 Laufzeiten von 1 Monat bis
// 30 Jahre — wichtig für eine genaue Interpolation bei langlaufenden
// Optionen.
const TENOR_JAHRE = {
  '1 Mo': 1 / 12,
  '1.5 Month': 1.5 / 12,
  '2 Mo': 2 / 12,
  '3 Mo': 3 / 12,
  '4 Mo': 4 / 12,
  '6 Mo': 6 / 12,
  '1 Yr': 1,
  '2 Yr': 2,
  '3 Yr': 3,
  '5 Yr': 5,
  '7 Yr': 7,
  '10 Yr': 10,
  '20 Yr': 20,
  '30 Yr': 30,
};

function parseCsvZeile(zeile) {
  return zeile.split(',').map((feld) => feld.replace(/^"|"$/g, '').trim());
}

async function holeJahresCsv(jahr) {
  const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${jahr}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${jahr}&page&_format=csv`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    },
  });
  if (!response.ok) {
    throw new Error(`US-Finanzministerium antwortet mit Status ${response.status}`);
  }
  return response.text();
}

// Gibt die US-Zinskurve als aufsteigend sortierte Liste von
// { laufzeitJahre, zinssatzProzent } zurück, auf Basis der jeweils
// aktuellsten verfügbaren Handelstags-Zeile.
export async function holeUsZinskurve() {
  const heuteJahr = new Date().getFullYear();
  let text = await holeJahresCsv(heuteJahr);
  let zeilen = text.trim().split('\n');
  if (zeilen.length < 2) {
    // Am Jahresanfang gibt es für das neue Jahr evtl. noch keine Zeile.
    text = await holeJahresCsv(heuteJahr - 1);
    zeilen = text.trim().split('\n');
  }

  const kopfzeile = parseCsvZeile(zeilen[0]);
  const neuesteZeile = parseCsvZeile(zeilen[1]);

  const punkte = [];
  for (let i = 1; i < kopfzeile.length; i++) {
    const laufzeitJahre = TENOR_JAHRE[kopfzeile[i]];
    const zinssatzProzent = parseFloat(neuesteZeile[i]);
    if (laufzeitJahre !== undefined && !Number.isNaN(zinssatzProzent)) {
      punkte.push({ laufzeitJahre, zinssatzProzent });
    }
  }
  return punkte.sort((a, b) => a.laufzeitJahre - b.laufzeitJahre);
}

// Lineare Interpolation zwischen den Stützstellen der Zinskurve. Liegt
// die gesuchte Laufzeit außerhalb des Kurvenbereichs, wird der jeweils
// nächstliegende Randwert verwendet.
export function interpoliereZins(zinskurve, laufzeitJahre) {
  if (!zinskurve || zinskurve.length === 0) {
    return null;
  }
  if (laufzeitJahre <= zinskurve[0].laufzeitJahre) {
    return zinskurve[0].zinssatzProzent;
  }
  const letzter = zinskurve[zinskurve.length - 1];
  if (laufzeitJahre >= letzter.laufzeitJahre) {
    return letzter.zinssatzProzent;
  }
  for (let i = 0; i < zinskurve.length - 1; i++) {
    const a = zinskurve[i];
    const b = zinskurve[i + 1];
    if (laufzeitJahre >= a.laufzeitJahre && laufzeitJahre <= b.laufzeitJahre) {
      const anteil =
        (laufzeitJahre - a.laufzeitJahre) / (b.laufzeitJahre - a.laufzeitJahre);
      return a.zinssatzProzent + anteil * (b.zinssatzProzent - a.zinssatzProzent);
    }
  }
  return letzter.zinssatzProzent;
}

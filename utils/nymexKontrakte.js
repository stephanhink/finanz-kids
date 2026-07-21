// Berechnet die echten NYMEX-Kontraktmonate für WTI-Crude-Oil-Optionen:
// Verfallsdatum nach dem offiziellen NYMEX-Regelwerk (Chapter 200 für den
// Future, Chapter 310 für die Option) und den passenden Yahoo-Finance-
// Ticker für den monatsspezifischen Futures-Kontrakt (z. B. "CLZ26.NYM"
// für Dezember 2026).
//
// Wichtiger Hinweis zur Genauigkeit: Es gibt keine kostenlose, offizielle
// API für den exakten NYMEX-Handelskalender. Die Feiertage hier sind eine
// Nachbildung des üblichen US-Marktkalenders (wie NYSE/CME ihn im
// Regelfall verwenden) — für echte Handelsentscheidungen nicht
// verlässlich, für die didaktische Näherung hier aber ausreichend genau.

const MONATSCODES = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];

const MONATSNAMEN = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function neuesDatum(jahr, monat, tag) {
  return new Date(jahr, monat, tag);
}

function istWochenende(datum) {
  const tag = datum.getDay();
  return tag === 0 || tag === 6;
}

// Gauss'sche Osterformel (Gregorianischer Kalender)
function osterSonntag(jahr) {
  const a = jahr % 19;
  const b = Math.floor(jahr / 100);
  const c = jahr % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31); // 3 = März, 4 = April
  const tag = ((h + l - 7 * m + 114) % 31) + 1;
  return neuesDatum(jahr, monat - 1, tag);
}

function karfreitag(jahr) {
  const ostern = osterSonntag(jahr);
  return neuesDatum(jahr, ostern.getMonth(), ostern.getDate() - 2);
}

function nterWochentag(jahr, monat, wochentag, n) {
  let datum = neuesDatum(jahr, monat, 1);
  let gefunden = 0;
  while (true) {
    if (datum.getDay() === wochentag) {
      gefunden += 1;
      if (gefunden === n) return datum;
    }
    datum = neuesDatum(jahr, monat, datum.getDate() + 1);
  }
}

function letzterWochentag(jahr, monat, wochentag) {
  const naechsterMonat = neuesDatum(jahr, monat + 1, 1);
  let datum = neuesDatum(jahr, monat + 1, 0); // letzter Tag des Monats
  while (datum.getDay() !== wochentag) {
    datum = neuesDatum(datum.getFullYear(), datum.getMonth(), datum.getDate() - 1);
  }
  return datum;
}

// Verschiebt ein festes Datum (z. B. 4. Juli) auf den Freitag davor, wenn
// es auf einen Samstag fällt, bzw. auf den Montag danach bei einem Sonntag
// — üblich für US-Marktfeiertage.
function beobachtetesDatum(datum) {
  if (datum.getDay() === 6) return neuesDatum(datum.getFullYear(), datum.getMonth(), datum.getDate() - 1);
  if (datum.getDay() === 0) return neuesDatum(datum.getFullYear(), datum.getMonth(), datum.getDate() + 1);
  return datum;
}

function usMarktFeiertage(jahr) {
  return [
    beobachtetesDatum(neuesDatum(jahr, 0, 1)), // Neujahr
    nterWochentag(jahr, 0, 1, 3), // Martin Luther King Jr. Day
    nterWochentag(jahr, 1, 1, 3), // Presidents Day
    karfreitag(jahr),
    letzterWochentag(jahr, 4, 1), // Memorial Day
    beobachtetesDatum(neuesDatum(jahr, 5, 19)), // Juneteenth
    beobachtetesDatum(neuesDatum(jahr, 6, 4)), // Unabhängigkeitstag
    nterWochentag(jahr, 8, 1, 1), // Labor Day
    nterWochentag(jahr, 10, 4, 4), // Thanksgiving
    beobachtetesDatum(neuesDatum(jahr, 11, 25)), // Weihnachten
  ];
}

function istFeiertag(datum) {
  return usMarktFeiertage(datum.getFullYear()).some(
    (f) => f.getFullYear() === datum.getFullYear() && f.getMonth() === datum.getMonth() && f.getDate() === datum.getDate()
  );
}

function istGeschaeftstag(datum) {
  return !istWochenende(datum) && !istFeiertag(datum);
}

function vorherigerGeschaeftstag(datum) {
  let d = neuesDatum(datum.getFullYear(), datum.getMonth(), datum.getDate() - 1);
  while (!istGeschaeftstag(d)) {
    d = neuesDatum(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  }
  return d;
}

function geschaeftstageZurueck(datum, anzahl) {
  let d = datum;
  for (let i = 0; i < anzahl; i++) {
    d = vorherigerGeschaeftstag(d);
  }
  return d;
}

// Chapter 200.102.F: Termination of Trading für den Future.
// "the third business day prior to the twenty-fifth calendar day of the
// month preceding the delivery month" (bzw. vor dem letzten Geschäftstag
// davor, falls der 25. selbst kein Geschäftstag ist).
export function futuresVerfallsdatum(lieferMonat, lieferJahr) {
  let vormonat = lieferMonat - 1;
  let vormonatJahr = lieferJahr;
  if (vormonat < 0) {
    vormonat = 11;
    vormonatJahr -= 1;
  }
  let stichtag = neuesDatum(vormonatJahr, vormonat, 25);
  if (!istGeschaeftstag(stichtag)) {
    stichtag = vorherigerGeschaeftstag(neuesDatum(vormonatJahr, vormonat, 26));
  }
  return geschaeftstageZurueck(stichtag, 3);
}

// Chapter 310.101.E: Option verfällt 3 Geschäftstage vor dem Future.
export function optionsVerfallsdatum(lieferMonat, lieferJahr) {
  return geschaeftstageZurueck(futuresVerfallsdatum(lieferMonat, lieferJahr), 3);
}

export function yahooTicker(lieferMonat, lieferJahr) {
  const code = MONATSCODES[lieferMonat];
  const kurzJahr = String(lieferJahr).slice(-2);
  return `CL${code}${kurzJahr}.NYM`;
}

// Liste der nächsten `anzahl` NYMEX-WTI-Kontraktmonate, deren Options-
// Verfallsdatum noch in der Zukunft liegt, aufsteigend sortiert.
export function naechsteKontrakte(anzahl = 24) {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const kontrakte = [];
  let monat = heute.getMonth();
  let jahr = heute.getFullYear();

  // etwas weiter zurückstarten, falls der aktuelle Monat schon verfallen ist
  for (let i = -1; kontrakte.length < anzahl; i++) {
    let m = monat + i;
    let j = jahr;
    while (m < 0) {
      m += 12;
      j -= 1;
    }
    while (m > 11) {
      m -= 12;
      j += 1;
    }
    const verfallsdatum = optionsVerfallsdatum(m, j);
    if (verfallsdatum > heute) {
      kontrakte.push({
        monat: m,
        jahr: j,
        ticker: yahooTicker(m, j),
        verfallsdatum,
        label: `${MONATSNAMEN[m]} ${j}`,
      });
    }
  }
  return kontrakte;
}

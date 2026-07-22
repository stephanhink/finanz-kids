// Standard-Annuitätendarlehen-Berechnung, wie bei einer deutschen
// Baufinanzierung üblich: eine über die Zinsbindung konstante monatliche
// Rate aus Sollzins + anfänglicher Tilgung. Da die Rate konstant bleibt,
// verschiebt sich der Anteil von Zins zu Tilgung im Laufe der Zeit
// automatisch — anfangs viel Zins, später viel Tilgung.
export function monatlicheRate({ kreditbetrag, zinssatz, tilgungssatz }) {
  return (kreditbetrag * (zinssatz + tilgungssatz)) / 12;
}

// Restschuld nach einer bestimmten Anzahl Monate, bei monatlicher
// Zinsverrechnung.
export function restschuldNachMonaten({ kreditbetrag, zinssatz, rate }, monate) {
  const im = zinssatz / 12;
  if (im === 0) {
    return Math.max(kreditbetrag - rate * monate, 0);
  }
  const faktor = Math.pow(1 + im, monate);
  const restschuld = kreditbetrag * faktor - rate * ((faktor - 1) / im);
  return Math.max(restschuld, 0);
}

// Rechnerische Gesamtlaufzeit in Monaten, bis die Restschuld null erreicht
// (bei gleichbleibendem Zins und gleichbleibender Rate).
export function laufzeitInMonaten({ kreditbetrag, zinssatz, rate }) {
  const im = zinssatz / 12;
  if (im === 0) {
    return kreditbetrag / rate;
  }
  return -Math.log(1 - (kreditbetrag * im) / rate) / Math.log(1 + im);
}

// Jahresweiser Tilgungsplan für die angegebene Anzahl Jahre. Neben der
// Restschuld auch die bis dahin insgesamt gezahlten Zinsen und die
// insgesamt getilgte Summe — die getilgte Summe ergibt sich direkt aus
// dem Rückgang der Restschuld, der Rest der gezahlten Raten war Zins.
export function tilgungsplan({ kreditbetrag, zinssatz, rate }, jahre) {
  const plan = [];
  for (let jahr = 1; jahr <= jahre; jahr++) {
    const monate = jahr * 12;
    const restschuld = restschuldNachMonaten(
      { kreditbetrag, zinssatz, rate },
      monate
    );
    const kumulierteTilgung = kreditbetrag - restschuld;
    const kumulierteZinsen = rate * monate - kumulierteTilgung;
    plan.push({ jahr, restschuld, kumulierteZinsen, kumulierteTilgung });
  }
  return plan;
}

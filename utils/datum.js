// Anzahl ganzer Tage zwischen heute und einem Zieldatum (z. B. dem
// Verfallsdatum einer Option). Uhrzeiten werden ignoriert, damit z. B.
// "heute" immer 0 Tage ergibt, egal zu welcher Tageszeit gerechnet wird.
export function tageBisDatum(zieldatum) {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const ziel = new Date(zieldatum);
  ziel.setHours(0, 0, 0, 0);

  const millisekundenProTag = 24 * 60 * 60 * 1000;
  return Math.round((ziel.getTime() - heute.getTime()) / millisekundenProTag);
}

export function formatDatum(datum) {
  return datum.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

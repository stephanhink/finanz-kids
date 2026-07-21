// Gemeinsamer Zugriff auf die inoffizielle Yahoo-Finance-"Chart"-API.
// Wird sowohl für die Zinskurve (Treasury-Ticker) als auch für
// Futures-/Aktienkurse (z. B. "CL=F" für WTI Crude Oil) genutzt.
export async function holeKurs(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
  // Ohne einen "normalen" Browser-User-Agent antwortet Yahoo Finance
  // gelegentlich mit 429 (Too Many Requests), auch bei der ersten Anfrage.
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    },
  });
  if (!response.ok) {
    throw new Error(`Yahoo Finance antwortet mit Status ${response.status}`);
  }
  const daten = await response.json();
  const kurs = daten?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (typeof kurs !== 'number') {
    throw new Error(`Kein Kurs für ${symbol} in der Antwort gefunden`);
  }
  return kurs;
}

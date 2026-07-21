import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import KontraktAuswahl from '../components/KontraktAuswahl';
import { black76 } from '../utils/black76';
import { binomialFuturesOption } from '../utils/binomialFutures';
import { tageBisDatum } from '../utils/datum';
import { naechsteKontrakte } from '../utils/nymexKontrakte';
import { holeKurs } from '../utils/yahooFinance';
import { holeUsZinskurve, interpoliereZins } from '../utils/zinskurve';

function zahl(text) {
  return parseFloat(text.replace(',', '.')) || 0;
}

function formatUsd(zahl) {
  return zahl.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

export default function FuturesOptionScreen() {
  const [kontrakte] = useState(() => naechsteKontrakte(24));
  const [kontrakt, setKontrakt] = useState(kontrakte[0]);

  const [futuresPreis, setFuturesPreis] = useState('80');
  const [basispreis, setBasispreis] = useState('80');
  const [volatilitaet, setVolatilitaet] = useState('35');
  const [zinssatz, setZinssatz] = useState('4');
  const [optionsTyp, setOptionsTyp] = useState('call');

  const [zinskurve, setZinskurve] = useState(null);
  const [wtiLaedt, setWtiLaedt] = useState(false);
  const [wtiFehler, setWtiFehler] = useState(null);
  const [zinsLaedt, setZinsLaedt] = useState(false);
  const [zinsFehler, setZinsFehler] = useState(null);

  async function ladeWtiKurs(ticker) {
    setWtiLaedt(true);
    setWtiFehler(null);
    try {
      const kurs = await holeKurs(ticker);
      setFuturesPreis(kurs.toFixed(2));
    } catch (fehler) {
      setWtiFehler('Kurs konnte nicht geladen werden — bitte manuell eingeben.');
    } finally {
      setWtiLaedt(false);
    }
  }

  const tageBisVerfall = tageBisDatum(kontrakt.verfallsdatum);

  async function ladeZinskurve() {
    setZinsLaedt(true);
    setZinsFehler(null);
    try {
      const kurve = await holeUsZinskurve();
      setZinskurve(kurve);
      const interpoliert = interpoliereZins(kurve, tageBisVerfall / 365);
      if (interpoliert !== null) {
        setZinssatz(interpoliert.toFixed(2));
      }
    } catch (fehler) {
      setZinsFehler('Zinskurve konnte nicht geladen werden — bitte manuell eingeben.');
    } finally {
      setZinsLaedt(false);
    }
  }

  // Bei jedem Kontraktwechsel den passenden Kurs neu laden — der Preis
  // muss immer zum gewählten Liefermonat passen, sonst wäre die
  // Bewertung mit falschem Basiswert.
  useEffect(() => {
    ladeWtiKurs(kontrakt.ticker);
  }, [kontrakt]);

  useEffect(() => {
    ladeZinskurve();
  }, []);

  function zinsAusKurveUebernehmen() {
    const interpoliert = interpoliereZins(zinskurve, tageBisVerfall / 365);
    if (interpoliert !== null) {
      setZinssatz(interpoliert.toFixed(2));
    }
  }

  const F = zahl(futuresPreis);
  const K = zahl(basispreis);
  const T = tageBisVerfall / 365;
  const sigma = zahl(volatilitaet) / 100;
  const r = zahl(zinssatz) / 100;

  const { call: b76Call, put: b76Put, d1, d2 } = black76({ F, K, T, r, sigma });
  const { call: amCall, put: amPut } = binomialFuturesOption({
    F,
    K,
    T,
    r,
    sigma,
  });

  const preisAmerikanisch = optionsTyp === 'call' ? amCall : amPut;
  const preisEuropaeisch = optionsTyp === 'call' ? b76Call : b76Put;
  const fruehausuebungsPraemie = preisAmerikanisch - preisEuropaeisch;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titel}>Optionsbewertung Futures</Text>
        <Text style={styles.untertitel}>
          Amerikanische Option auf WTI Crude Oil (NYMEX), CRR-Binomialbaum
        </Text>

        <View style={styles.umschalter}>
          <Pressable
            style={[
              styles.umschalterButton,
              optionsTyp === 'call' && styles.umschalterButtonAktiv,
            ]}
            onPress={() => setOptionsTyp('call')}
          >
            <Text
              style={[
                styles.umschalterText,
                optionsTyp === 'call' && styles.umschalterTextAktiv,
              ]}
            >
              Call
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.umschalterButton,
              optionsTyp === 'put' && styles.umschalterButtonAktiv,
            ]}
            onPress={() => setOptionsTyp('put')}
          >
            <Text
              style={[
                styles.umschalterText,
                optionsTyp === 'put' && styles.umschalterTextAktiv,
              ]}
            >
              Put
            </Text>
          </Pressable>
        </View>

        <KontraktAuswahl
          label={`Kontraktmonat (${tageBisVerfall} Tage bis Options-Verfall)`}
          kontrakt={kontrakt}
          kontrakte={kontrakte}
          onAendern={setKontrakt}
        />

        <View style={styles.feld}>
          <View style={styles.labelZeile}>
            <Text style={styles.label}>Futures-Preis F (USD/Barrel)</Text>
            {wtiLaedt && <ActivityIndicator size="small" />}
          </View>
          <TextInput
            style={styles.input}
            value={futuresPreis}
            onChangeText={setFuturesPreis}
            keyboardType="decimal-pad"
          />
          {wtiFehler ? (
            <Text style={styles.hinweisFehler}>{wtiFehler}</Text>
          ) : (
            <Pressable onPress={() => ladeWtiKurs(kontrakt.ticker)}>
              <Text style={styles.hinweisLink}>
                aktuellen Kurs für {kontrakt.ticker} ({kontrakt.label}, Yahoo
                Finance) neu laden
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Basispreis / Strike K (USD)</Text>
          <TextInput
            style={styles.input}
            value={basispreis}
            onChangeText={setBasispreis}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Volatilität σ pro Jahr (%)</Text>
          <TextInput
            style={styles.input}
            value={volatilitaet}
            onChangeText={setVolatilitaet}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <View style={styles.labelZeile}>
            <Text style={styles.label}>Risikofreier Zinssatz r (%)</Text>
            {zinsLaedt && <ActivityIndicator size="small" />}
          </View>
          <TextInput
            style={styles.input}
            value={zinssatz}
            onChangeText={setZinssatz}
            keyboardType="decimal-pad"
          />
          {zinsFehler ? (
            <Text style={styles.hinweisFehler}>{zinsFehler}</Text>
          ) : (
            <Pressable onPress={zinsAusKurveUebernehmen}>
              <Text style={styles.hinweisLink}>
                aus US-Zinskurve (US-Finanzministerium) für {tageBisVerfall}{' '}
                Tage übernehmen
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.ergebnis}>
          <Text style={styles.ergebnisLabel}>
            {optionsTyp === 'call' ? 'Call' : 'Put'}-Preis (amerikanisch,
            Binomialbaum)
          </Text>
          <Text style={styles.ergebnisPreis}>
            {formatUsd(preisAmerikanisch)}
          </Text>
          <Text style={styles.ergebnisVergleich}>
            Black-76 (europäisch): {formatUsd(preisEuropaeisch)} · Prämie für
            vorzeitige Ausübung: {formatUsd(fruehausuebungsPraemie)}
          </Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.detailsTitel}>
            Binomialbaum (amerikanisch, 100 Schritte)
          </Text>
          <Text style={styles.detailsZeile}>
            Call-Preis: {formatUsd(amCall)}
          </Text>
          <Text style={styles.detailsZeile}>Put-Preis: {formatUsd(amPut)}</Text>

          <Text style={[styles.detailsTitel, styles.detailsTitelAbstand]}>
            Black-76 (europäisch, zum Vergleich)
          </Text>
          <Text style={styles.detailsZeile}>d1 = {d1.toFixed(4)}</Text>
          <Text style={styles.detailsZeile}>d2 = {d2.toFixed(4)}</Text>
          <Text style={styles.detailsZeile}>
            Call-Preis: {formatUsd(b76Call)}
          </Text>
          <Text style={styles.detailsZeile}>
            Put-Preis: {formatUsd(b76Put)}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  titel: {
    fontSize: 26,
    fontWeight: '700',
  },
  untertitel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  umschalter: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  umschalterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  umschalterButtonAktiv: {
    backgroundColor: '#0a7ea4',
  },
  umschalterText: {
    fontSize: 15,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  umschalterTextAktiv: {
    color: '#fff',
  },
  feld: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  labelZeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hinweisLink: {
    fontSize: 12,
    color: '#0a7ea4',
    marginTop: 6,
  },
  hinweisFehler: {
    fontSize: 12,
    color: '#b3261e',
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  ergebnis: {
    marginTop: 8,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#FDECEA',
    alignItems: 'center',
  },
  ergebnisLabel: {
    fontSize: 14,
    color: '#444',
  },
  ergebnisPreis: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  ergebnisVergleich: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  detailsTitelAbstand: {
    marginTop: 12,
  },
  details: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  detailsTitel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#444',
  },
  detailsZeile: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
});

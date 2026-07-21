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

import VerfallsdatumFeld from '../components/VerfallsdatumFeld';
import { blackScholes } from '../utils/blackScholes';
import { tageBisDatum } from '../utils/datum';
import { holeUsZinskurve, interpoliereZins } from '../utils/zinskurve';

function datumInTagen(tageAbHeute) {
  const datum = new Date();
  datum.setDate(datum.getDate() + tageAbHeute);
  return datum;
}

function zahl(text) {
  return parseFloat(text.replace(',', '.')) || 0;
}

function formatEuro(zahl) {
  return zahl.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  });
}

export default function AktienOptionScreen() {
  const [kurs, setKurs] = useState('100');
  const [basispreis, setBasispreis] = useState('100');
  const [verfallsdatum, setVerfallsdatum] = useState(datumInTagen(90));
  const [volatilitaet, setVolatilitaet] = useState('25');
  const [zinssatz, setZinssatz] = useState('3');
  const [dividendenrendite, setDividendenrendite] = useState('0');
  const [optionsTyp, setOptionsTyp] = useState('call');

  const [zinskurve, setZinskurve] = useState(null);
  const [zinskurveLaedt, setZinskurveLaedt] = useState(false);
  const [zinskurveFehler, setZinskurveFehler] = useState(null);

  const tageBisVerfall = tageBisDatum(verfallsdatum);

  async function ladeZinskurve() {
    setZinskurveLaedt(true);
    setZinskurveFehler(null);
    try {
      const kurve = await holeUsZinskurve();
      setZinskurve(kurve);
      const interpoliert = interpoliereZins(kurve, tageBisVerfall / 365);
      if (interpoliert !== null) {
        setZinssatz(interpoliert.toFixed(2));
      }
    } catch (fehler) {
      setZinskurveFehler(
        'Zinskurve konnte nicht geladen werden — bitte manuell eingeben.'
      );
    } finally {
      setZinskurveLaedt(false);
    }
  }

  useEffect(() => {
    ladeZinskurve();
  }, []);

  function zinsAusKurveUebernehmen() {
    const interpoliert = interpoliereZins(zinskurve, tageBisVerfall / 365);
    if (interpoliert !== null) {
      setZinssatz(interpoliert.toFixed(2));
    }
  }

  const S = zahl(kurs);
  const K = zahl(basispreis);
  const T = tageBisVerfall / 365;
  const sigma = zahl(volatilitaet) / 100;
  const r = zahl(zinssatz) / 100;
  const q = zahl(dividendenrendite) / 100;

  const { call, put, d1, d2 } = blackScholes({ S, K, T, r, sigma, q });
  const preis = optionsTyp === 'call' ? call : put;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titel}>Optionsbewertung Aktien</Text>
        <Text style={styles.untertitel}>
          Europäische Option, Black-Scholes-Merton
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

        <View style={styles.feld}>
          <Text style={styles.label}>Aktienkurs S (€)</Text>
          <TextInput
            style={styles.input}
            value={kurs}
            onChangeText={setKurs}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Basispreis / Strike K (€)</Text>
          <TextInput
            style={styles.input}
            value={basispreis}
            onChangeText={setBasispreis}
            keyboardType="decimal-pad"
          />
        </View>

        <VerfallsdatumFeld
          label={`Verfallsdatum (${tageBisVerfall} Tage)`}
          wert={verfallsdatum}
          onAendern={setVerfallsdatum}
        />

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
            {zinskurveLaedt && <ActivityIndicator size="small" />}
          </View>
          <TextInput
            style={styles.input}
            value={zinssatz}
            onChangeText={setZinssatz}
            keyboardType="decimal-pad"
          />
          {zinskurveFehler ? (
            <Text style={styles.zinskurveFehler}>{zinskurveFehler}</Text>
          ) : (
            <Pressable onPress={zinsAusKurveUebernehmen}>
              <Text style={styles.zinskurveHinweis}>
                aus US-Zinskurve (US-Finanzministerium) für {tageBisVerfall}{' '}
                Tage übernehmen
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Dividendenrendite q (%)</Text>
          <TextInput
            style={styles.input}
            value={dividendenrendite}
            onChangeText={setDividendenrendite}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.ergebnis}>
          <Text style={styles.ergebnisLabel}>
            {optionsTyp === 'call' ? 'Call' : 'Put'}-Preis
          </Text>
          <Text style={styles.ergebnisPreis}>{formatEuro(preis)}</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.detailsTitel}>Details</Text>
          <Text style={styles.detailsZeile}>d1 = {d1.toFixed(4)}</Text>
          <Text style={styles.detailsZeile}>d2 = {d2.toFixed(4)}</Text>
          <Text style={styles.detailsZeile}>
            Call-Preis: {formatEuro(call)}
          </Text>
          <Text style={styles.detailsZeile}>Put-Preis: {formatEuro(put)}</Text>
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
  zinskurveHinweis: {
    fontSize: 12,
    color: '#0a7ea4',
    marginTop: 6,
  },
  zinskurveFehler: {
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
    backgroundColor: '#E6F4FE',
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

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  laufzeitInMonaten,
  monatlicheRate,
  restschuldNachMonaten,
  tilgungsplan,
} from '../utils/hypothek';

function zahl(text) {
  return parseFloat(text.replace(',', '.')) || 0;
}

function formatEuro(zahl) {
  return zahl.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}

export default function HypothekenScreen() {
  const [kreditbetrag, setKreditbetrag] = useState('300000');
  const [zinssatz, setZinssatz] = useState('4');
  const [tilgungssatz, setTilgungssatz] = useState('2');
  const [zinsbindung, setZinsbindung] = useState('10');
  const [neuerZinssatz, setNeuerZinssatz] = useState('6');

  const K0 = zahl(kreditbetrag);
  const zins = zahl(zinssatz) / 100;
  const tilgung = zahl(tilgungssatz) / 100;
  const zinsbindungJahre = Math.round(zahl(zinsbindung));
  const neuerZins = zahl(neuerZinssatz) / 100;

  const rate = monatlicheRate({ kreditbetrag: K0, zinssatz: zins, tilgungssatz: tilgung });

  const ersterMonatZins = K0 * (zins / 12);
  const ersterMonatTilgung = rate - ersterMonatZins;

  const restschuldEndeZinsbindung = restschuldNachMonaten(
    { kreditbetrag: K0, zinssatz: zins, rate },
    zinsbindungJahre * 12
  );

  const gesamtlaufzeitJahre =
    laufzeitInMonaten({ kreditbetrag: K0, zinssatz: zins, rate }) / 12;

  const plan = tilgungsplan(
    { kreditbetrag: K0, zinssatz: zins, rate },
    Math.min(zinsbindungJahre, 40)
  );

  // Anschlussfinanzierung: gleiche Tilgungsrate wie bisher, aber zum
  // neuen (z. B. gestiegenen) Zinssatz — zeigt die reine Auswirkung der
  // Zinsänderung, unabhängig von neuen Verhandlungen zur Tilgungshöhe.
  const neueRateNachZinsbindung = monatlicheRate({
    kreditbetrag: restschuldEndeZinsbindung,
    zinssatz: neuerZins,
    tilgungssatz: tilgung,
  });
  const ratenDifferenz = neueRateNachZinsbindung - rate;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titel}>Hypothekenrechner</Text>
        <Text style={styles.untertitel}>
          Annuitätendarlehen mit Zinsbindung, wie bei einer Baufinanzierung
        </Text>

        <View style={styles.feld}>
          <Text style={styles.label}>Kreditbetrag (€)</Text>
          <TextInput
            style={styles.input}
            value={kreditbetrag}
            onChangeText={setKreditbetrag}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Sollzins pro Jahr (%)</Text>
          <TextInput
            style={styles.input}
            value={zinssatz}
            onChangeText={setZinssatz}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Anfängliche Tilgung pro Jahr (%)</Text>
          <TextInput
            style={styles.input}
            value={tilgungssatz}
            onChangeText={setTilgungssatz}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Zinsbindung (Jahre)</Text>
          <TextInput
            style={styles.input}
            value={zinsbindung}
            onChangeText={setZinsbindung}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.ergebnis}>
          <Text style={styles.ergebnisLabel}>Monatliche Rate</Text>
          <Text style={styles.ergebnisPreis}>{formatEuro(rate)}</Text>
          <Text style={styles.ergebnisVergleich}>
            davon anfangs {formatEuro(ersterMonatZins)} Zinsen und{' '}
            {formatEuro(ersterMonatTilgung)} Tilgung
          </Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.detailsTitel}>
            Nach {zinsbindungJahre} Jahren Zinsbindung
          </Text>
          <Text style={styles.detailsZeile}>
            Restschuld: {formatEuro(restschuldEndeZinsbindung)}
          </Text>
          <Text style={styles.detailsZeile}>
            Bereits getilgt: {formatEuro(K0 - restschuldEndeZinsbindung)}
          </Text>
          <Text style={styles.detailsZeile}>
            Gesamtlaufzeit bei gleichbleibendem Zins: ca.{' '}
            {gesamtlaufzeitJahre.toFixed(1)} Jahre
          </Text>
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>
            Zinssatz nach Zinsbindung, z. B. bei einer Zinssteigerung (%)
          </Text>
          <TextInput
            style={styles.input}
            value={neuerZinssatz}
            onChangeText={setNeuerZinssatz}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.ergebnisWarnung}>
          <Text style={styles.ergebnisLabel}>
            Neue Monatsrate ab Jahr {zinsbindungJahre + 1}
          </Text>
          <Text style={styles.ergebnisPreis}>
            {formatEuro(neueRateNachZinsbindung)}
          </Text>
          <Text style={styles.ergebnisVergleich}>
            {ratenDifferenz >= 0 ? '+' : ''}
            {formatEuro(ratenDifferenz)} pro Monat gegenüber vorher, bei
            gleichbleibender Tilgungshöhe
          </Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.detailsTitel}>
            Restschuld im Zeitverlauf (während der Zinsbindung)
          </Text>
          <View style={styles.tabelleKopf}>
            <Text style={styles.tabelleKopfZelle}>Jahr</Text>
            <Text style={styles.tabelleKopfZelle}>Restschuld</Text>
          </View>
          {plan.map((eintrag) => (
            <View key={eintrag.jahr} style={styles.tabelleZeile}>
              <Text style={styles.tabelleZelle}>{eintrag.jahr}</Text>
              <Text style={styles.tabelleZelle}>
                {formatEuro(eintrag.restschuld)}
              </Text>
            </View>
          ))}
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
  feld: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
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
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
  },
  ergebnisWarnung: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#FDECEA',
    alignItems: 'center',
  },
  ergebnisLabel: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
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
  details: {
    marginBottom: 16,
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
  tabelleKopf: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 6,
    marginBottom: 4,
  },
  tabelleKopfZelle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  tabelleZeile: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tabelleZelle: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
});

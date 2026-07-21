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

// Rechnet den Zinseszins mit monatlicher Sparrate und monatlicher
// Zinsgutschrift aus. p = Startkapital, rate = monatliche Sparrate,
// zinssatzProJahr = z. B. 5 für 5 %, jahre = Laufzeit in Jahren.
function berechneEndkapital(p, rate, zinssatzProJahr, jahre) {
  const monatlicherZins = zinssatzProJahr / 100 / 12;
  const anzahlMonate = jahre * 12;

  if (monatlicherZins === 0) {
    return p + rate * anzahlMonate;
  }

  const zinsfaktor = Math.pow(1 + monatlicherZins, anzahlMonate);
  const ausStartkapital = p * zinsfaktor;
  const ausSparrate = rate * ((zinsfaktor - 1) / monatlicherZins);
  return ausStartkapital + ausSparrate;
}

function formatEuro(zahl) {
  return zahl.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  });
}

export default function ZinsRechnerScreen() {
  const [startkapital, setStartkapital] = useState('1000');
  const [sparrate, setSparrate] = useState('20');
  const [zinssatz, setZinssatz] = useState('5');
  const [laufzeit, setLaufzeit] = useState('10');

  // parseFloat gibt NaN zurück, wenn das Feld leer ist oder Buchstaben
  // enthält. Damit die Berechnung nicht abstürzt, fangen wir das mit
  // "|| 0" ab, d. h. ein ungültiges Feld zählt als 0.
  const p = parseFloat(startkapital.replace(',', '.')) || 0;
  const rate = parseFloat(sparrate.replace(',', '.')) || 0;
  const zins = parseFloat(zinssatz.replace(',', '.')) || 0;
  const jahre = parseFloat(laufzeit.replace(',', '.')) || 0;

  const endkapital = berechneEndkapital(p, rate, zins, jahre);
  const eingezahlt = p + rate * jahre * 12;
  const zinsgewinn = endkapital - eingezahlt;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titel}>Zinseszins-Rechner</Text>

        <View style={styles.feld}>
          <Text style={styles.label}>Startkapital (€)</Text>
          <TextInput
            style={styles.input}
            value={startkapital}
            onChangeText={setStartkapital}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Monatliche Sparrate (€)</Text>
          <TextInput
            style={styles.input}
            value={sparrate}
            onChangeText={setSparrate}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Zinssatz pro Jahr (%)</Text>
          <TextInput
            style={styles.input}
            value={zinssatz}
            onChangeText={setZinssatz}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.feld}>
          <Text style={styles.label}>Laufzeit (Jahre)</Text>
          <TextInput
            style={styles.input}
            value={laufzeit}
            onChangeText={setLaufzeit}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.ergebnis}>
          <Text style={styles.ergebnisZeile}>
            Eingezahlt: {formatEuro(eingezahlt)}
          </Text>
          <Text style={styles.ergebnisZeile}>
            Zinsgewinn: {formatEuro(zinsgewinn)}
          </Text>
          <Text style={styles.endkapital}>
            Endkapital: {formatEuro(endkapital)}
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
    paddingTop: 24,
  },
  titel: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
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
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#E6F4FE',
  },
  ergebnisZeile: {
    fontSize: 16,
    marginBottom: 4,
  },
  endkapital: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
});

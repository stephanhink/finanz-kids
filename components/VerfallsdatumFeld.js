import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { formatDatum } from '../utils/datum';

// Wiederverwendbares Eingabefeld für ein Verfallsdatum, genutzt von
// AktienOptionScreen und FuturesOptionScreen. Öffnet den systemeigenen
// Datums-Picker; auf iOS bleibt er offen, bis "Fertig" gedrückt wird, auf
// Android schließt er sich automatisch nach der Auswahl.
export default function VerfallsdatumFeld({ label, wert, onAendern }) {
  const [offen, setOffen] = useState(false);

  return (
    <View style={styles.feld}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setOffen(true)}>
        <Text style={styles.datumText}>{formatDatum(wert)}</Text>
      </Pressable>
      {offen && (
        <DateTimePicker
          value={wert}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, ausgewaehltesDatum) => {
            setOffen(Platform.OS === 'ios');
            if (event.type !== 'dismissed' && ausgewaehltesDatum) {
              onAendern(ausgewaehltesDatum);
            }
          }}
        />
      )}
      {Platform.OS === 'ios' && offen && (
        <Pressable onPress={() => setOffen(false)}>
          <Text style={styles.fertig}>Fertig</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  datumText: {
    fontSize: 16,
  },
  fertig: {
    fontSize: 13,
    color: '#0a7ea4',
    marginTop: 6,
    textAlign: 'right',
  },
});

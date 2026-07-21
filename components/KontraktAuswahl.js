import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDatum } from '../utils/datum';

// Dropdown-artige Auswahl für einen NYMEX-Kontraktmonat. `kontrakte` ist
// die Liste aus utils/nymexKontrakte.js, `kontrakt` der aktuell gewählte
// Eintrag. Öffnet beim Antippen ein Blatt von unten mit der vollständigen
// Liste, wie ein natives Dropdown/ActionSheet.
export default function KontraktAuswahl({ label, kontrakt, kontrakte, onAendern }) {
  const [offen, setOffen] = useState(false);

  return (
    <View style={styles.feld}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setOffen(true)}>
        <Text style={styles.wert}>
          {kontrakt.label} ({kontrakt.ticker})
        </Text>
        <Text style={styles.pfeil}>▾</Text>
      </Pressable>
      <Text style={styles.hinweis}>Verfall {formatDatum(kontrakt.verfallsdatum)}</Text>

      <Modal
        visible={offen}
        animationType="slide"
        transparent
        onRequestClose={() => setOffen(false)}
      >
        <Pressable style={styles.hintergrund} onPress={() => setOffen(false)}>
          <View style={styles.blatt}>
            <Text style={styles.blattTitel}>Kontraktmonat wählen</Text>
            <FlatList
              data={kontrakte}
              keyExtractor={(item) => item.ticker}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.zeile,
                    item.ticker === kontrakt.ticker && styles.zeileAktiv,
                  ]}
                  onPress={() => {
                    onAendern(item);
                    setOffen(false);
                  }}
                >
                  <Text style={styles.zeileLabel}>{item.label}</Text>
                  <Text style={styles.zeileDetails}>
                    {item.ticker} · Verfall {formatDatum(item.verfallsdatum)}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wert: {
    fontSize: 16,
  },
  pfeil: {
    fontSize: 14,
    color: '#888',
  },
  hinweis: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  hintergrund: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  blatt: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  blattTitel: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  zeile: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  zeileAktiv: {
    backgroundColor: '#E6F4FE',
  },
  zeileLabel: {
    fontSize: 16,
  },
  zeileDetails: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

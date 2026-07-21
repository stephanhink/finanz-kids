import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import ZinsRechnerScreen from './screens/ZinsRechnerScreen';
import AktienOptionScreen from './screens/AktienOptionScreen';
import FuturesOptionScreen from './screens/FuturesOptionScreen';

// Jeder Tab bekommt einen Schlüssel, ein Label für die Tab-Leiste und
// die Screen-Komponente, die angezeigt wird. Ein neuer Rechner
// (z. B. Zertifikate oder ETFs) bedeutet: neue Screen-Datei bauen und
// hier einen Eintrag hinzufügen — mehr nicht.
const TABS = [
  { key: 'zinsen', label: 'Zinsen', Screen: ZinsRechnerScreen },
  { key: 'aktienoptionen', label: 'Aktienoptionen', Screen: AktienOptionScreen },
  { key: 'futures', label: 'Futures', Screen: FuturesOptionScreen },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const ActiveScreen = TABS.find((tab) => tab.key === activeTab).Screen;

  return (
    <SafeAreaView style={styles.flex}>
      <StatusBar style="auto" />
      <View style={styles.inhalt}>
        <ActiveScreen />
      </View>
      <View style={styles.tabLeiste}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                tab.key === activeTab && styles.tabTextAktiv,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inhalt: {
    flex: 1,
  },
  tabLeiste: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    color: '#888',
  },
  tabTextAktiv: {
    color: '#0a7ea4',
    fontWeight: '700',
  },
});

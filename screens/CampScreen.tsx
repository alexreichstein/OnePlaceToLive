// screens/CampScreen.tsx
// Insidan av lägret — visar byggbara stationer
// Navigeras till från WorldScreen när man klickar på lägret
// Stationer byggs upp över tid och låser upp ny funktionalitet

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorldStackParamList } from '../navigation';

type NavigationProp = StackNavigationProp<WorldStackParamList, 'Camp'>;

// Definition av en station i lägret
type CampStation = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  status: 'locked' | 'buildable' | 'built';
};

// Stationerna som kan byggas i lägret
const CAMP_STATIONS: CampStation[] = [
  {
    id: 'sleeping_area',
    name: 'Sleeping Area',
    emoji: '🛏️',
    description: 'Rest and recover HP overnight.',
    status: 'buildable',
  },
  {
    id: 'storage',
    name: 'Storage',
    emoji: '🪣',
    description: 'Store more resources and expand your inventory.',
    status: 'buildable',
  },
  {
    id: 'cooking_area',
    name: 'Cooking Area',
    emoji: '🍳',
    description: 'Cook meals to restore hunger more effectively.',
    status: 'buildable',
  },
  {
    id: 'research_table',
    name: 'Research Table',
    emoji: '🔬',
    description: 'Study materials to unlock new crafting recipes.',
    status: 'locked',
  },
  {
    id: 'smithy',
    name: 'Smithy',
    emoji: '⚒️',
    description: 'Forge tools and weapons from metal and stone.',
    status: 'locked',
  },
];

export default function CampScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>

      {/* Header med tillbaka-knapp */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏠 Camp</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      {/* Interiör-illustration */}
      <View style={styles.interior}>
        <Text style={styles.interiorText}>🌿  🪵  🔥  🪵  🌿</Text>
        <Text style={styles.interiorSubText}>Your camp — build it up over time</Text>
      </View>

      {/* Stations-lista */}
      <ScrollView
        style={styles.stationList}
        contentContainerStyle={styles.stationListContent}
        showsVerticalScrollIndicator={false}
      >
        {CAMP_STATIONS.map((station) => (
          <View
            key={station.id}
            style={[
              styles.stationCard,
              station.status === 'built' && styles.stationCardBuilt,
              station.status === 'locked' && styles.stationCardLocked,
            ]}
          >
            {/* Emoji och namn */}
            <View style={styles.stationHeader}>
              <Text style={styles.stationEmoji}>{station.emoji}</Text>
              <View style={styles.stationInfo}>
                <Text style={[
                  styles.stationName,
                  station.status === 'locked' && styles.stationNameLocked,
                ]}>
                  {station.name}
                </Text>
                <Text style={styles.stationDescription}>{station.description}</Text>
              </View>
              {/* Status-badge */}
              <View style={[
                styles.statusBadge,
                station.status === 'built' && styles.statusBadgeBuilt,
                station.status === 'locked' && styles.statusBadgeLocked,
              ]}>
                <Text style={styles.statusText}>
                  {station.status === 'built' ? '✓ Built'
                    : station.status === 'buildable' ? 'Build'
                    : '🔒'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Info-text längst ner */}
        <Text style={styles.comingSoonText}>
          More stations coming soon...
        </Text>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1209',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A2810',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3A2810',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#D4A843',
    fontWeight: '700',
    fontSize: 14,
  },
  backBtnPlaceholder: {
    width: 70,
  },
  title: {
    color: '#FFF8DC',
    fontSize: 20,
    fontWeight: '700',
  },

  // Interiör-illustration
  interior: {
    backgroundColor: '#2A1A0A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A2810',
  },
  interiorText: {
    fontSize: 32,
    letterSpacing: 8,
    marginBottom: 8,
  },
  interiorSubText: {
    color: '#8B7355',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Station-lista
  stationList: {
    flex: 1,
    marginTop: 16,
  },
  stationListContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  stationCard: {
    backgroundColor: '#2A1A0A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A2810',
  },
  stationCardBuilt: {
    borderColor: '#4A7C59',
    backgroundColor: '#1A2A1A',
  },
  stationCardLocked: {
    opacity: 0.5,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stationEmoji: {
    fontSize: 32,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    color: '#FFF8DC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  stationNameLocked: {
    color: '#666',
  },
  stationDescription: {
    color: '#8B7355',
    fontSize: 13,
    lineHeight: 18,
  },

  // Status-badge
  statusBadge: {
    backgroundColor: '#D4A843',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeBuilt: {
    backgroundColor: '#4A7C59',
  },
  statusBadgeLocked: {
    backgroundColor: '#333',
  },
  statusText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '700',
  },

  comingSoonText: {
    color: '#555',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
    fontStyle: 'italic',
  },
});

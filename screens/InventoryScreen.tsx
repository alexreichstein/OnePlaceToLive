// screens/InventoryScreen.tsx
// Skärm för att visa spelarens inventarie och resurser
// Visar alla resurser spelaren äger med mängd och emoji
// Visar också världsobjekt som spelaren har byggt

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCharacter from '../hooks/useCharacter';
import useResources from '../hooks/useResources';
import {
  RESOURCE_NAMES,
  RESOURCE_EMOJIS,
  WORLD_ITEM_NAMES,
} from '../constants';
import { ResourceType, WorldItemType } from '../types';

// Temporärt hårdkodat userId — i framtiden kopplat till inloggning
const USER_ID = 'player_alex';

export default function InventoryScreen() {
  const { character } = useCharacter(USER_ID);
  const { inventory, loading } = useResources(USER_ID);

  // Laddningsskärm medan Firebase hämtar data
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Laddar...</Text>
      </View>
    );
  }

  // Filtrerar ut resurser som spelaren äger (mängd > 0)
  const ownedResources = Object.entries(inventory).filter(
    ([_, amount]) => (amount ?? 0) > 0
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎒 Inventarie</Text>
        {character && (
          <Text style={styles.playerName}>{character.name}</Text>
        )}
      </View>

      <ScrollView style={styles.scrollView}>

        {/* ─── Resurser ───────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Resurser</Text>

        {ownedResources.length === 0 ? (
          // Visas om spelaren inte har några resurser än
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyText}>
              Inga resurser än — börja samla i skogen!
            </Text>
          </View>
        ) : (
          // Rutnät med resurser
          <View style={styles.resourceGrid}>
            {ownedResources.map(([resource, amount]) => (
              <View key={resource} style={styles.resourceCard}>
                {/* Resursemoji */}
                <Text style={styles.resourceEmoji}>
                  {RESOURCE_EMOJIS[resource] ?? '📦'}
                </Text>
                {/* Mängd */}
                <Text style={styles.resourceAmount}>{amount}</Text>
                {/* Resursnamn */}
                <Text style={styles.resourceName}>
                  {RESOURCE_NAMES[resource] ?? resource}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ─── Alla resurser (även de med 0) ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Alla resurser</Text>
        <View style={styles.allResourcesContainer}>
          {(Object.keys(RESOURCE_NAMES) as ResourceType[]).map((resource) => {
            const amount = inventory[resource] ?? 0;
            return (
              <View
                key={resource}
                style={[
                  styles.allResourceRow,
                  // Nedtonad om spelaren inte har något av resursen
                  amount === 0 && styles.allResourceRowEmpty,
                ]}
              >
                <Text style={styles.allResourceEmoji}>
                  {RESOURCE_EMOJIS[resource] ?? '📦'}
                </Text>
                <Text style={[
                  styles.allResourceName,
                  amount === 0 && styles.allResourceNameEmpty,
                ]}>
                  {RESOURCE_NAMES[resource]}
                </Text>
                <Text style={[
                  styles.allResourceAmount,
                  amount === 0 && styles.allResourceAmountEmpty,
                ]}>
                  {amount}
                </Text>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Huvudbehållare — mörk bakgrund
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  // Centrerad vy för laddningsskärmen
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  centerText: {
    color: '#aaa',
    fontSize: 16,
  },

  // Header med titel och spelarnamn
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  playerName: {
    fontSize: 14,
    color: '#4A7C59',
    fontWeight: '600',
  },

  // ScrollView för innehållet
  scrollView: {
    flex: 1,
    padding: 16,
  },

  // Sektionsrubrik
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#aaa',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Tom state — inga resurser
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },

  // Rutnät med resurskort
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },

  // Enskilt resurskort
  resourceCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },

  // Resursemoji i kortet
  resourceEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },

  // Mängd i kortet
  resourceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },

  // Resursnamn i kortet
  resourceName: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },

  // Behållare för alla resurser
  allResourcesContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },

  // Rad för en resurs i listan
  allResourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    gap: 12,
  },

  // Nedtonad rad om spelaren inte har något
  allResourceRowEmpty: {
    opacity: 0.4,
  },

  // Emoji i listan
  allResourceEmoji: {
    fontSize: 20,
  },

  // Resursnamn i listan
  allResourceName: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  allResourceNameEmpty: {
    color: '#666',
  },

  // Mängd i listan
  allResourceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A7C59',
    minWidth: 30,
    textAlign: 'right',
  },
  allResourceAmountEmpty: {
    color: '#444',
  },
});
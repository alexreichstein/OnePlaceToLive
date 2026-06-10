// components/TaskCard.tsx
// Kort som visar information om en task
// Visar namn, beskrivning, tid, krav och belöningar
// Grå och inaktiv om spelaren inte uppfyller kraven

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { TaskDefinition, Inventory, WorldItemType } from '../types';
import { RESOURCE_NAMES, RESOURCE_EMOJIS, WORLD_ITEM_NAMES } from '../constants';
import { formatTimeRemaining } from '../gameData/tasks';

type Props = {
  task: TaskDefinition;           // Task-definitionen som ska visas
  inventory: Inventory;           // Spelarens inventarie för att visa tillgängliga resurser
  worldItems: WorldItemType[];    // Spelarens världsobjekt för att visa krav
  available: boolean;             // Om tasken kan startas just nu
  onPress: () => void;            // Callback när spelaren trycker på kortet
};

export default function TaskCard({
  task,
  inventory,
  worldItems,
  available,
  onPress,
}: Props) {
  // Formaterar varaktigheten till läsbar text
  const duration = formatTimeRemaining(task.durationMinutes * 60);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        // Inaktiv stil om tasken inte kan startas
        !available && styles.cardDisabled,
      ]}
      onPress={onPress}
      disabled={!available}
    >
      {/* Rubrikrad med namn och tid */}
      <View style={styles.header}>
        <Text style={[styles.taskName, !available && styles.textDisabled]}>
          {task.name}
        </Text>
        <Text style={styles.duration}>⏱ {duration}</Text>
      </View>

      {/* Beskrivning */}
      <Text style={[styles.description, !available && styles.textDisabled]}>
        {task.description}
      </Text>

      {/* Krav — resurser som behövs */}
      {Object.keys(task.requires).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kräver:</Text>
          <View style={styles.resourceRow}>
            {Object.entries(task.requires).map(([resource, amount]) => {
              // Kontrollerar om spelaren har tillräckligt av resursen
              const playerAmount = inventory[resource as keyof Inventory] ?? 0;
              const hasEnough = playerAmount >= (amount ?? 0);
              return (
                <View key={resource} style={styles.resourceChip}>
                  <Text style={styles.resourceEmoji}>
                    {RESOURCE_EMOJIS[resource] ?? '📦'}
                  </Text>
                  <Text style={[
                    styles.resourceText,
                    // Röd text om spelaren inte har tillräckligt
                    !hasEnough && styles.resourceNotEnough,
                  ]}>
                    {amount} {RESOURCE_NAMES[resource] ?? resource}
                  </Text>
                  {/* Visar hur mycket spelaren har */}
                  <Text style={styles.resourceOwned}>
                    ({playerAmount})
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Kräver världsobjekt */}
      {task.requiresWorldItem && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kräver byggd:</Text>
          <View style={styles.resourceChip}>
            <Text style={[
              styles.resourceText,
              // Röd text om objektet inte finns
              !worldItems.includes(task.requiresWorldItem) && styles.resourceNotEnough,
            ]}>
              {WORLD_ITEM_NAMES[task.requiresWorldItem] ?? task.requiresWorldItem}
              {worldItems.includes(task.requiresWorldItem) ? ' ✓' : ' ✗'}
            </Text>
          </View>
        </View>
      )}

      {/* Belöningar — resurser som ges */}
      {Object.keys(task.rewards).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Belöning:</Text>
          <View style={styles.resourceRow}>
            {Object.entries(task.rewards).map(([resource, amount]) => (
              <View key={resource} style={styles.rewardChip}>
                <Text style={styles.resourceEmoji}>
                  {RESOURCE_EMOJIS[resource] ?? '📦'}
                </Text>
                <Text style={styles.rewardText}>
                  +{amount} {RESOURCE_NAMES[resource] ?? resource}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skapar världsobjekt */}
      {task.createsWorldItem && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Skapar:</Text>
          <View style={styles.rewardChip}>
            <Text style={styles.rewardText}>
              🏕️ {WORLD_ITEM_NAMES[task.createsWorldItem] ?? task.createsWorldItem}
            </Text>
          </View>
        </View>
      )}

      {/* Erfarenhetsbelöning */}
      <Text style={styles.xpReward}>+{task.experienceReward} XP</Text>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Kortets grundstil — mörk bakgrund
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },

  // Inaktiv stil — mörkare och mer nedtonad
  cardDisabled: {
    backgroundColor: '#222',
    borderColor: '#2a2a2a',
    opacity: 0.6,
  },

  // Rubrikrad med namn och tid
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  // Task-namn
  taskName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },

  // Inaktiv text
  textDisabled: {
    color: '#666',
  },

  // Varaktighet
  duration: {
    fontSize: 13,
    color: '#4A7C59',
    fontWeight: '600',
  },

  // Beskrivning
  description: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 8,
  },

  // Sektion med etikett
  section: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  // Rad med resurser
  resourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  // Enskild resurschip — krav
  resourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  // Resursemoji
  resourceEmoji: {
    fontSize: 14,
  },

  // Resurstext
  resourceText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '500',
  },

  // Röd text om spelaren inte har tillräckligt
  resourceNotEnough: {
    color: '#e53935',
  },

  // Visar hur mycket spelaren har av resursen
  resourceOwned: {
    fontSize: 11,
    color: '#666',
  },

  // Enskild belöningschip
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  // Belöningstext
  rewardText: {
    fontSize: 12,
    color: '#4A7C59',
    fontWeight: '600',
  },

  // Erfarenhetsbelöning längst ner
  xpReward: {
    fontSize: 11,
    color: '#D4A843',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'right',
  },
});
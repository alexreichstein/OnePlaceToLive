// components/WorldItemModal.tsx
// Modal som visas när spelaren klickar på ett världsobjekt i scenen
// Visar alla tasks som är kopplade till objektet via interactsWith

import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { WorldItemType, Inventory } from '../types';
import { TASK_DEFINITIONS, WORLD_ITEM_NAMES, WORLD_ITEM_EMOJIS, RESOURCE_NAMES, RESOURCE_EMOJIS } from '../constants';
import { canAffordTask } from '../gameData/tasks';

type Props = {
  visible: boolean;
  worldItem: WorldItemType | null;
  inventory: Inventory;
  onClose: () => void;
  onSelectTask: (taskId: any) => void;
};

export default function WorldItemModal({
  visible,
  worldItem,
  inventory,
  onClose,
  onSelectTask,
}: Props) {
  // Hämta tasks för valt worlditem — tomt array om inget är valt
  const tasks = worldItem
    ? Object.values(TASK_DEFINITIONS).filter((task) => task.interactsWith === worldItem)
    : [];

  const itemName = worldItem ? (WORLD_ITEM_NAMES[worldItem] ?? worldItem) : '';
  const itemEmoji = worldItem ? (WORLD_ITEM_EMOJIS[worldItem] ?? '🏕️') : '';

  // Renderar alltid Modal så visible-prop fungerar korrekt
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{itemEmoji} {itemName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
            {tasks.length === 0 ? (
              <Text style={styles.emptyText}>No interactions available yet.</Text>
            ) : (
              tasks.map((task) => {
                const canAfford = canAffordTask(task, inventory);

                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.taskCard, !canAfford && styles.taskCardDisabled]}
                    onPress={() => {
                      if (canAfford) {
                        onSelectTask(task.id);
                        onClose();
                      }
                    }}
                    disabled={!canAfford}
                  >
                    {/* Task-namn och tid */}
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskName}>{task.name}</Text>
                      <Text style={styles.taskDuration}>{task.durationMinutes}m</Text>
                    </View>

                    {/* Beskrivning */}
                    <Text style={styles.taskDescription}>{task.description}</Text>

                    {/* Krav */}
                    {Object.keys(task.requires).length > 0 && (
                      <View style={styles.requiresRow}>
                        <Text style={styles.requiresLabel}>Requires: </Text>
                        {Object.entries(task.requires).map(([res, amt]) => {
                          const hasEnough = (inventory[res as keyof Inventory] ?? 0) >= (amt ?? 0);
                          return (
                            <Text
                              key={res}
                              style={[styles.requireItem, !hasEnough && styles.requireItemMissing]}
                            >
                              {RESOURCE_EMOJIS[res] ?? ''}{amt} {RESOURCE_NAMES[res] ?? res}{'  '}
                            </Text>
                          );
                        })}
                      </View>
                    )}

                    {/* Belöningar */}
                    <View style={styles.rewardsRow}>
                      {Object.entries(task.rewards).map(([res, amt]) => (
                        <Text key={res} style={styles.rewardItem}>
                          {RESOURCE_EMOJIS[res] ?? ''}+{amt} {RESOURCE_NAMES[res] ?? res}{'  '}
                        </Text>
                      ))}
                      {task.restoresVitals && Object.entries(task.restoresVitals).map(([vital, amt]) => {
                        const vitalEmojis: Record<string, string> = { health: '❤️', hunger: '🍖', thirst: '💧' };
                        return (
                          <Text key={vital} style={styles.rewardItem}>
                            {vitalEmojis[vital] ?? '✨'}+{amt}{'  '}
                          </Text>
                        );
                      })}
                      <Text style={styles.rewardItem}>⭐+{task.experienceReward} XP</Text>
                    </View>

                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#888',
    fontSize: 18,
  },
  taskList: {
    flex: 1,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  taskCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  taskCardDisabled: {
    opacity: 0.5,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  taskDuration: {
    color: '#4A7C59',
    fontSize: 14,
    fontWeight: '600',
  },
  taskDescription: {
    color: '#999',
    fontSize: 13,
    marginBottom: 8,
  },
  requiresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },
  requiresLabel: {
    color: '#888',
    fontSize: 12,
  },
  requireItem: {
    color: '#aaa',
    fontSize: 12,
  },
  requireItemMissing: {
    color: '#e53935',
  },
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rewardItem: {
    color: '#4A7C59',
    fontSize: 12,
    fontWeight: '600',
  },
});

// components/TaskListModal.tsx
// Modal som visar alla tillgängliga tasks spelaren kan starta
// Filtrerar tasks baserat på nivå, resurser och världsobjekt
// Varje task visas som ett TaskCard med krav och belöningar

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import TaskCard from './TaskCard';
import { TaskDefinition, Inventory, WorldItemType, TaskType } from '../types';
import { isTaskAvailable } from '../gameData/tasks';

type Props = {
  visible: boolean;                    // Styr om modalen är synlig
  onClose: () => void;                 // Callback när modalen stängs
  tasks: TaskDefinition[];             // Tillgängliga tasks att visa
  inventory: Inventory;                // Spelarens inventarie
  worldItems: WorldItemType[];         // Spelarens byggda världsobjekt
  characterLevel: number;              // Spelarens nivå för att filtrera tasks
  onSelectTask: (taskId: TaskType) => void; // Callback när en task väljs
};

export default function TaskListModal({
  visible,
  onClose,
  tasks,
  inventory,
  worldItems,
  characterLevel,
  onSelectTask,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* Rubrikrad med titel och stängknapp */}
          <View style={styles.header}>
            <Text style={styles.title}>Välj en task</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Lista med tasks — scrollbar om det finns många */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {tasks.length === 0 ? (
              // Visas om inga tasks är tillgängliga för spelaren
              <Text style={styles.empty}>Inga tasks tillgängliga ännu.</Text>
            ) : (
              tasks.map((task) => {
                // Kontrollerar om tasken kan startas just nu
                const available = isTaskAvailable(
                  task,
                  characterLevel,
                  inventory,
                  worldItems
                );
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    inventory={inventory}
                    worldItems={worldItems}
                    available={available}
                    onPress={() => onSelectTask(task.id)}
                  />
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
  // Halvtransparent overlay bakom modalen
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },

  // Modalboxen — mörk bakgrund, rundade övre hörn
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },

  // Rubrikrad med titel och stängknapp
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    color: '#888',
    fontSize: 18,
    padding: 4,
  },

  // Text när inga tasks finns
  empty: {
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});
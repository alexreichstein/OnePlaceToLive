// screens/WorldScreen.tsx
// Huvudskärmen för spelet — visar skogsmiljön och aktiv task
// Spelaren ser sin karaktär i skogen och kan starta tasks
// Världen uppdateras visuellt när nya objekt skapas (brasa, vindskydd etc)

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Rect, Circle, Ellipse, Path, G } from 'react-native-svg';
import useCharacter from '../hooks/useCharacter';
import useResources from '../hooks/useResources';
import useTasks from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import CharacterSVG from '../components/CharacterSVG';
import {
  TASK_DEFINITIONS,
  RESOURCE_NAMES,
  RESOURCE_EMOJIS,
} from '../constants';
import {
  getAvailableTasks,
  isTaskAvailable,
  formatTimeRemaining,
} from '../gameData/tasks';
import { TaskType, WorldItemType } from '../types';

// Temporärt hårdkodat userId — i framtiden kopplat till inloggning
const USER_ID = 'player_alex';

export default function WorldScreen() {
  const { character } = useCharacter(USER_ID);
  const { inventory, addResources, consumeResources } = useResources(USER_ID);

  // Håller världsobjekten i lokalt state — synkas med Firebase via useTasks
  const [worldItems, setWorldItems] = useState<WorldItemType[]>([]);

  // Styr om task-listan är synlig
  const [showTaskList, setShowTaskList] = useState(false);

  // Hanterar när en task är klar
  const handleTaskCompleted = async (taskId: TaskType) => {
    const task = TASK_DEFINITIONS[taskId];
    if (!task) return;

    try {
      // Lägg till belöningar i inventariet
      if (Object.keys(task.rewards).length > 0) {
        await addResources(task.rewards);
      }

      // Skapa världsobjekt om tasken skapar ett
      if (task.createsWorldItem) {
        await tasksHook.addWorldItem(task.createsWorldItem);
        setWorldItems((prev) => [...prev, task.createsWorldItem!]);
      }

      // Rensa den avklarade tasken
      await tasksHook.clearActiveTask();

      // Visa belöningsmeddelande
      const rewardText = Object.entries(task.rewards)
        .map(([res, amt]) => `${amt} ${RESOURCE_NAMES[res] ?? res}`)
        .join(', ');

      Alert.alert(
        '✅ Task klar!',
        task.createsWorldItem
          ? `Du har byggt ${task.name}!`
          : rewardText
          ? `Du fick: ${rewardText}`
          : `${task.name} är klar!`
      );
    } catch (e) {
      console.error('Fel vid task-avslutning:', e);
    }
  };

  // Initierar useTasks-hooken med callback
  const tasksHook = useTasks(USER_ID, inventory, worldItems, handleTaskCompleted);
  const { activeTask, secondsRemaining, startTask } = tasksHook;

  // Startar en task efter att ha förbrukat resurser
  const handleStartTask = async (taskId: TaskType) => {
    const task = TASK_DEFINITIONS[taskId];
    if (!task) return;

    try {
      // Förbruka resurser om tasken kräver det
      if (Object.keys(task.requires).length > 0) {
        await consumeResources(task.requires);
      }

      // Starta tasken
      await startTask(taskId);
      setShowTaskList(false);
    } catch (e) {
      Alert.alert('Fel', 'Kunde inte starta tasken. Kontrollera att du har tillräckligt med resurser.');
    }
  };

  if (!character) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Skapa din karaktär först!</Text>
      </View>
    );
  }

  // Hämtar tillgängliga tasks baserat på nivå
  const availableTasks = getAvailableTasks(character.level);

  return (
    <SafeAreaView style={styles.container}>

      {/* ─── Skogsvyn ─────────────────────────────────────────────────────── */}
      <View style={styles.worldContainer}>
        <ForestScene worldItems={worldItems} />

        {/* Karaktären i scenen */}
        <View style={styles.characterInWorld}>
          <CharacterSVG appearance={character.appearance} size={80} />
        </View>
      </View>

      {/* ─── Aktiv task ───────────────────────────────────────────────────── */}
      {activeTask ? (
        <View style={styles.activeTaskContainer}>
          <Text style={styles.activeTaskLabel}>Pågående task:</Text>
          <Text style={styles.activeTaskName}>
            {TASK_DEFINITIONS[activeTask.taskId]?.name ?? activeTask.taskId}
          </Text>
          <Text style={styles.activeTaskTimer}>
            ⏱ {formatTimeRemaining(secondsRemaining)}
          </Text>
        </View>
      ) : (
        // Knapp för att öppna task-listan om ingen task pågår
        <TouchableOpacity
          style={styles.startTaskBtn}
          onPress={() => setShowTaskList(true)}
        >
          <Text style={styles.startTaskBtnText}>⚔️ Välj task</Text>
        </TouchableOpacity>
      )}

      {/* ─── Task-lista modal ─────────────────────────────────────────────── */}
      <Modal visible={showTaskList} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>

            {/* Rubrik och stängknapp */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Välj en task</Text>
              <TouchableOpacity onPress={() => setShowTaskList(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Lista med tillgängliga tasks */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableTasks.map((task) => {
                const available = isTaskAvailable(
                  task,
                  character.level,
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
                    onPress={() => handleStartTask(task.id)}
                  />
                );
              })}
            </ScrollView>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Skogsvyn SVG ─────────────────────────────────────────────────────────────
// Ritar skogsmiljön med träd, himmel och mark
// Uppdateras när nya världsobjekt skapas
type ForestSceneProps = {
  worldItems: WorldItemType[];
};

function ForestScene({ worldItems }: ForestSceneProps) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 300">

      {/* Himmel */}
      <Rect x="0" y="0" width="400" height="200" fill="#2C4A6B" />

      {/* Måne */}
      <Circle cx="340" cy="40" r="25" fill="#E8D5A0" />
      <Circle cx="350" cy="32" r="20" fill="#2C4A6B" />

      {/* Stjärnor */}
      <Circle cx="50" cy="30" r="2" fill="#fff" />
      <Circle cx="120" cy="15" r="1.5" fill="#fff" />
      <Circle cx="200" cy="25" r="2" fill="#fff" />
      <Circle cx="280" cy="10" r="1.5" fill="#fff" />
      <Circle cx="160" cy="50" r="1" fill="#fff" />

      {/* Mark */}
      <Rect x="0" y="200" width="400" height="100" fill="#2D4A1E" />

      {/* Gräs */}
      <Ellipse cx="200" cy="200" rx="200" ry="15" fill="#3A5C28" />

      {/* Bakre träd — vänster */}
      <Rect x="30" y="120" width="12" height="90" fill="#4A2E14" />
      <Ellipse cx="36" cy="110" rx="28" ry="35" fill="#1E3A14" />

      {/* Bakre träd — höger */}
      <Rect x="340" y="130" width="12" height="80" fill="#4A2E14" />
      <Ellipse cx="346" cy="120" rx="25" ry="32" fill="#1E3A14" />

      {/* Framre träd — vänster */}
      <Rect x="60" y="140" width="16" height="70" fill="#5C3A1E" />
      <Ellipse cx="68" cy="128" rx="34" ry="40" fill="#2A4A1E" />

      {/* Framre träd — höger */}
      <Rect x="310" y="150" width="16" height="60" fill="#5C3A1E" />
      <Ellipse cx="318" cy="138" rx="30" ry="36" fill="#2A4A1E" />

      {/* Buskar */}
      <Ellipse cx="150" cy="205" rx="20" ry="12" fill="#2A4A1E" />
      <Ellipse cx="260" cy="208" rx="18" ry="10" fill="#2A4A1E" />

      {/* ─── Världsobjekt ─────────────────────────────────────────────────── */}

      {/* Brasa — visas om campfire finns i worldItems */}
      {worldItems.includes('campfire') && (
        <G>
          {/* Stenar runt brasan */}
          <Ellipse cx="200" cy="225" rx="22" ry="8" fill="#555" />
          {/* Ved */}
          <Rect x="188" y="215" width="24" height="6" rx="2" fill="#5C3A1E" />
          {/* Lågor */}
          <Ellipse cx="200" cy="210" rx="8" ry="12" fill="#FF6B00" />
          <Ellipse cx="196" cy="208" rx="5" ry="10" fill="#FF9500" />
          <Ellipse cx="204" cy="209" rx="5" ry="9" fill="#FF9500" />
          <Ellipse cx="200" cy="206" rx="4" ry="7" fill="#FFD700" />
        </G>
      )}

      {/* Vindskydd — visas om shelter finns i worldItems */}
      {worldItems.includes('shelter') && (
        <G>
          {/* Stöttepinnar */}
          <Rect x="100" y="175" width="5" height="35" rx="2" fill="#5C3A1E" />
          <Rect x="135" y="175" width="5" height="35" rx="2" fill="#5C3A1E" />
          {/* Tak av grenar */}
          <Path d="M95 175 L140 175 L145 210 L90 210 Z" fill="#2A4A1E" />
          <Path d="M95 175 L140 175 L145 210 L90 210 Z"
            fill="none" stroke="#1E3A14" strokeWidth="2" />
        </G>
      )}

      {/* Läger — visas om camp finns i worldItems */}
      {worldItems.includes('camp') && (
        <G>
          {/* Förbättrat vindskydd */}
          <Rect x="85" y="165" width="6" height="45" rx="2" fill="#4A2E14" />
          <Rect x="145" y="165" width="6" height="45" rx="2" fill="#4A2E14" />
          <Path d="M80 165 L155 165 L160 210 L75 210 Z" fill="#3A5C28" />
          {/* Ingång */}
          <Rect x="108" y="190" width="20" height="20" rx="2" fill="#1a1a1a" />
        </G>
      )}

      {/* Spjut — visas om spear finns i worldItems */}
      {worldItems.includes('spear') && (
        <G>
          {/* Spjutets skaft */}
          <Rect x="238" y="190" width="4" height="30" rx="1"
            fill="#5C3A1E" transform="rotate(-15 240 205)" />
          {/* Spjutspets */}
          <Path d="M242 188 L246 195 L238 195 Z" fill="#888" />
        </G>
      )}

    </Svg>
  );
}

const styles = StyleSheet.create({
  // Huvudbehållare — mörk bakgrund
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  // Centrerad vy för felmeddelanden
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

  // Skogsvyn — tar upp övre delen av skärmen
  worldContainer: {
    flex: 1,
    position: 'relative',
  },

  // Karaktären placerad i scenen
  characterInWorld: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -40 }],
  },

  // Aktiv task-behållare
  activeTaskContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A7C59',
    alignItems: 'center',
  },
  activeTaskLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  activeTaskName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  activeTaskTimer: {
    color: '#4A7C59',
    fontSize: 24,
    fontWeight: '700',
  },

  // Knapp för att öppna task-listan
  startTaskBtn: {
    backgroundColor: '#4A7C59',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startTaskBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  // Modal-overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },

  // Modalboxen
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },

  // Modalens rubrikrad
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    color: '#888',
    fontSize: 18,
    padding: 4,
  },
});
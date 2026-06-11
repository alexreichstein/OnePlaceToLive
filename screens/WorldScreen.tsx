// screens/WorldScreen.tsx
// Huvudskärmen för spelet — visar skogsmiljön och aktiv task
// Spelaren ser sin karaktär i skogen och kan starta tasks
// Världen uppdateras visuellt när nya objekt skapas (brasa, vindskydd etc)
// Fix: worldItems läses från Firebase via useWorld — finns kvar efter omstart
// Fix: animationseffekt för karaktären när task pågår
// Fix: vindskydd och koja har brun färg

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Rect, Circle, Ellipse, Path, G } from 'react-native-svg';
import useCharacter from '../hooks/useCharacter';
import useResources from '../hooks/useResources';
import useTasks from '../hooks/useTasks';
import useWorld from '../hooks/useWorld';
import TaskCard from '../components/TaskCard';
import CharacterSVG from '../components/CharacterSVG';
import {
  TASK_DEFINITIONS,
  RESOURCE_NAMES,
} from '../constants';
import {
  getAvailableTasks,
  isTaskAvailable,
  formatTimeRemaining,
} from '../gameData/tasks';
import { TaskType } from '../types';

// Temporärt hårdkodat userId — i framtiden kopplat till inloggning
const USER_ID = 'player_alex';

export default function WorldScreen() {
  const { character, addExperience } = useCharacter(USER_ID);
  const { inventory, addResources, consumeResources } = useResources(USER_ID);

  // worldItems läses från Firebase via useWorld — finns kvar efter omstart
  const { worldItems, addWorldItem } = useWorld(USER_ID);

  // Styr om task-listan är synlig
  const [showTaskList, setShowTaskList] = useState(false);

  // Animationsvärde för karaktärens rörelse — pendlar fram och tillbaka
  const walkAnim = useRef(new Animated.Value(0)).current;

  // Hanterar när en task är klar
  const handleTaskCompleted = async (taskId: TaskType) => {
    const task = TASK_DEFINITIONS[taskId];
    if (!task) return;

    try {
      // Lägg till resurser om tasken ger belöningar
      if (Object.keys(task.rewards).length > 0) {
        await addResources(task.rewards);
      }

      // Lägg till erfarenhet
      await addExperience(task.experienceReward);

      // Skapa världsobjekt om tasken skapar ett
      if (task.createsWorldItem) {
        await addWorldItem(task.createsWorldItem);
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
          ? `Du har byggt ${task.name}!\n+${task.experienceReward} XP`
          : rewardText
          ? `Du fick: ${rewardText}\n+${task.experienceReward} XP`
          : `${task.name} är klar!\n+${task.experienceReward} XP`
      );
    } catch (e) {
      console.error('Fel vid task-avslutning:', e);
    }
  };

  // Initierar useTasks-hooken med callback
  // Definieras före animationseffekten så activeTask är tillgänglig
  const tasksHook = useTasks(USER_ID, inventory, worldItems, handleTaskCompleted);
  const { activeTask, secondsRemaining, startTask } = tasksHook;

  // Startar gånganimationen när en task pågår
  // Definieras EFTER tasksHook så activeTask är tillgänglig
  useEffect(() => {
    if (activeTask) {
      // Loopande pendel-animation — simulerar gångrörelse
      Animated.loop(
        Animated.sequence([
          Animated.timing(walkAnim, {
            toValue: 10,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(walkAnim, {
            toValue: -10,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stoppar animationen och återställer positionen
      walkAnim.stopAnimation();
      Animated.timing(walkAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [activeTask]);

  // Startar en task efter att ha förbrukat resurser
  const handleStartTask = async (taskId: TaskType) => {
    const task = TASK_DEFINITIONS[taskId];
    if (!task) return;

    try {
      if (Object.keys(task.requires).length > 0) {
        await consumeResources(task.requires);
      }
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

  const availableTasks = getAvailableTasks(character.level);

  // Hämtar vitals med standardvärden om de saknas
  const vitals = character.vitals ?? { health: 100, hunger: 100, thirst: 100 };

  return (
    <SafeAreaView style={styles.container}>

      {/* ─── Vitals-rad ───────────────────────────────────────────────────── */}
      <View style={styles.vitalsRow}>

        {/* Hälsa — röd stapel */}
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>❤️ Hälsa</Text>
          <View style={styles.vitalBar}>
            <View style={[
              styles.vitalFill,
              { width: `${vitals.health}%`, backgroundColor: '#e53935' },
            ]} />
          </View>
          <Text style={styles.vitalValue}>{Math.round(vitals.health)}</Text>
        </View>

        {/* Hunger — orange stapel */}
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>🍖 Hunger</Text>
          <View style={styles.vitalBar}>
            <View style={[
              styles.vitalFill,
              { width: `${vitals.hunger}%`, backgroundColor: '#F57C00' },
            ]} />
          </View>
          <Text style={styles.vitalValue}>{Math.round(vitals.hunger)}</Text>
        </View>

        {/* Törst — blå stapel */}
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>💧 Törst</Text>
          <View style={styles.vitalBar}>
            <View style={[
              styles.vitalFill,
              { width: `${vitals.thirst}%`, backgroundColor: '#1976D2' },
            ]} />
          </View>
          <Text style={styles.vitalValue}>{Math.round(vitals.thirst)}</Text>
        </View>

      </View>

      {/* ─── Skogsvyn ─────────────────────────────────────────────────────── */}
      <View style={styles.worldContainer}>
        <ForestScene worldItems={worldItems} />

        {/* Karaktären — animeras horisontellt när task pågår */}
        <Animated.View
          style={[
            styles.characterInWorld,
            { transform: [{ translateX: walkAnim }] },
          ]}
        >
          <CharacterSVG appearance={character.appearance} size={80} />
        </Animated.View>
      </View>

      {/* ─── Aktiv task ───────────────────────────────────────────────────── */}
      {activeTask ? (
        <View style={styles.activeTaskContainer}>

          {/* Övre rad — task-namn och finish-knapp */}
          <View style={styles.activeTaskRow}>
            <View style={styles.activeTaskInfo}>
              <Text style={styles.activeTaskLabel}>Pågående task:</Text>
              <Text style={styles.activeTaskName}>
                {TASK_DEFINITIONS[activeTask.taskId]?.name ?? activeTask.taskId}
              </Text>
            </View>

            {/* Finish-knapp för testning */}
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={() => tasksHook.finishTaskNow()}
            >
              <Text style={styles.finishBtnText}>⚡ Finish</Text>
            </TouchableOpacity>
          </View>

          {/* Nedräkningstimer */}
          <Text style={styles.activeTaskTimer}>
            ⏱ {formatTimeRemaining(secondsRemaining)}
          </Text>

        </View>
      ) : (
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Välj en task</Text>
              <TouchableOpacity onPress={() => setShowTaskList(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
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
type ForestSceneProps = {
  worldItems: string[];
};

function ForestScene({ worldItems }: ForestSceneProps) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 320">

      {/* Himmel */}
      <Rect x="0" y="0" width="400" height="210" fill="#1A2D40" />

      {/* Måne */}
      <Circle cx="340" cy="45" r="28" fill="#E8D5A0" />
      <Circle cx="352" cy="36" r="22" fill="#1A2D40" />

      {/* Stjärnor */}
      <Circle cx="30" cy="20" r="1.5" fill="#fff" />
      <Circle cx="80" cy="35" r="1" fill="#fff" />
      <Circle cx="140" cy="15" r="2" fill="#fff" />
      <Circle cx="190" cy="40" r="1" fill="#fff" />
      <Circle cx="240" cy="20" r="1.5" fill="#fff" />
      <Circle cx="290" cy="55" r="1" fill="#fff" />
      <Circle cx="160" cy="60" r="1" fill="#fff" />
      <Circle cx="60" cy="55" r="1.5" fill="#fff" />

      {/* Bakre skog */}
      <Rect x="10" y="100" width="10" height="120" fill="#2A1A0A" />
      <Ellipse cx="15" cy="88" rx="22" ry="28" fill="#122108" />
      <Rect x="370" y="110" width="10" height="110" fill="#2A1A0A" />
      <Ellipse cx="375" cy="98" rx="20" ry="26" fill="#122108" />
      <Rect x="180" y="90" width="8" height="130" fill="#2A1A0A" />
      <Ellipse cx="184" cy="78" rx="18" ry="24" fill="#122108" />

      {/* Mark */}
      <Rect x="0" y="210" width="400" height="110" fill="#1E3010" />

      {/* Gräs */}
      <Ellipse cx="200" cy="210" rx="200" ry="18" fill="#2A4A18" />

      {/* Framre träd — vänster */}
      <Rect x="40" y="130" width="18" height="90" fill="#3A2010" />
      <Ellipse cx="49" cy="116" rx="38" ry="44" fill="#1A3010" />
      <Ellipse cx="49" cy="100" rx="28" ry="32" fill="#224014" />

      {/* Framre träd — höger */}
      <Rect x="330" y="140" width="18" height="80" fill="#3A2010" />
      <Ellipse cx="339" cy="126" rx="36" ry="42" fill="#1A3010" />
      <Ellipse cx="339" cy="110" rx="26" ry="30" fill="#224014" />

      {/* Buskar */}
      <Ellipse cx="120" cy="215" rx="25" ry="14" fill="#1A3010" />
      <Ellipse cx="280" cy="218" rx="22" ry="12" fill="#1A3010" />
      <Ellipse cx="200" cy="220" rx="18" ry="10" fill="#1A3010" />

      {/* ─── Världsobjekt ─────────────────────────────────────────────────── */}

      {/* Brasa */}
      {worldItems.includes('campfire') && (
        <G>
          <Ellipse cx="200" cy="232" rx="24" ry="9" fill="#444" />
          <Rect x="186" y="220" width="28" height="8" rx="3" fill="#3A2010" />
          <Rect x="192" y="218" width="6" height="12" rx="2"
            fill="#3A2010" transform="rotate(20 195 224)" />
          <Ellipse cx="200" cy="214" rx="9" ry="14" fill="#CC4400" />
          <Ellipse cx="196" cy="212" rx="6" ry="11" fill="#FF6600" />
          <Ellipse cx="204" cy="213" rx="6" ry="10" fill="#FF6600" />
          <Ellipse cx="200" cy="209" rx="4" ry="8" fill="#FFB300" />
          <Ellipse cx="200" cy="206" rx="2" ry="5" fill="#FFE066" />
        </G>
      )}

      {/* Vindskydd — brun färg */}
      {worldItems.includes('shelter') && (
        <G>
          {/* Stöttepinnar */}
          <Rect x="95" y="168" width="6" height="42" rx="2" fill="#3A2010" />
          <Rect x="133" y="168" width="6" height="42" rx="2" fill="#3A2010" />
          {/* Tak — brun färg */}
          <Path d="M88 168 L144 168 L150 210 L82 210 Z" fill="#5C3A1E" />
          <Path d="M88 168 L144 168 L150 210 L82 210 Z"
            fill="none" stroke="#3A2010" strokeWidth="2" />
          {/* Grenar på taket */}
          <Path d="M90 175 L148 175" stroke="#4A2E14" strokeWidth="2" />
          <Path d="M88 183 L149 183" stroke="#4A2E14" strokeWidth="2" />
          <Path d="M88 191 L149 191" stroke="#4A2E14" strokeWidth="2" />
        </G>
      )}

      {/* Läger/Koja — brun färg */}
      {worldItems.includes('camp') && (
        <G>
          {/* Stöttepinnar */}
          <Rect x="78" y="158" width="7" height="52" rx="2" fill="#2A1A0A" />
          <Rect x="149" y="158" width="7" height="52" rx="2" fill="#2A1A0A" />
          {/* Tak — brun färg */}
          <Path d="M72 158 L160 158 L166 210 L66 210 Z" fill="#6B4423" />
          <Path d="M72 158 L160 158 L166 210 L66 210 Z"
            fill="none" stroke="#3A2010" strokeWidth="2" />
          {/* Ingång */}
          <Rect x="106" y="185" width="22" height="25" rx="2" fill="#111" />
          {/* Grenar på taket */}
          <Path d="M74 166 L164 166" stroke="#4A2E14" strokeWidth="2" />
          <Path d="M72 176 L165 176" stroke="#4A2E14" strokeWidth="2" />
        </G>
      )}

      {/* Spjut */}
      {worldItems.includes('spear') && (
        <G>
          <Rect x="245" y="185" width="5" height="36" rx="1"
            fill="#3A2010" transform="rotate(-20 247 203)" />
          <Path d="M248 182 L254 191 L242 191 Z" fill="#777" />
          <Path d="M246 192 Q250 195 246 198" stroke="#8B6914"
            strokeWidth="1.5" fill="none" />
        </G>
      )}

    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
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

  // Vitals-rad överst
  vitalsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  vitalItem: {
    flex: 1,
    gap: 2,
  },
  vitalLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },
  vitalBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  vitalFill: {
    height: '100%',
    borderRadius: 3,
  },
  vitalValue: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },

  // Skogsvyn
  worldContainer: {
    flex: 1,
    position: 'relative',
  },
  characterInWorld: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -40 }],
  },

  // Aktiv task
  activeTaskContainer: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A7C59',
  },
  activeTaskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeTaskInfo: {
    flex: 1,
  },
  activeTaskLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 2,
  },
  activeTaskName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  finishBtn: {
    backgroundColor: '#D4A843',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  finishBtnText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 13,
  },
  activeTaskTimer: {
    color: '#4A7C59',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Välj task-knapp
  startTaskBtn: {
    backgroundColor: '#4A7C59',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startTaskBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
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
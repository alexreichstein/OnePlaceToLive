// screens/WorldScreen.tsx
// Huvudskärmen för spelet — visar skogsmiljön och aktiv task
// Koordinerar alla hooks och skickar data till underkomponenter
// Logiken är kvar här men renderingen är uppdelad i egna komponenter

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCharacter from '../hooks/useCharacter';
import useResources from '../hooks/useResources';
import useTasks from '../hooks/useTasks';
import useWorld from '../hooks/useWorld';
import useDayNight from '../hooks/useDayNight';
import ForestScene from '../components/ForestScene';
import VitalsBar from '../components/VitalsBar';
import ActiveTaskBar from '../components/ActiveTaskBar';
import TaskListModal from '../components/TaskListModal';
import CharacterSVG from '../components/CharacterSVG';
import { TASK_DEFINITIONS, RESOURCE_NAMES } from '../constants';
import { getAvailableTasks } from '../gameData/tasks';
import { TaskType } from '../types';

// Temporärt hårdkodat userId — i framtiden kopplat till inloggning
const USER_ID = 'player_alex';

export default function WorldScreen() {
  const { character, addExperience } = useCharacter(USER_ID);
  const { inventory, addResources, consumeResources } = useResources(USER_ID);
  const { worldItems, addWorldItem } = useWorld(USER_ID);
  const { timeOfDay, currentTime, colors, showSun } = useDayNight();

  // Styr om task-listan är synlig
  const [showTaskList, setShowTaskList] = useState(false);

  // Animationsvärde för karaktärens rörelse
  const walkAnim = useRef(new Animated.Value(0)).current;

  // Hanterar när en task är klar
  // Delar ut belöningar, XP och skapar eventuella världsobjekt
  const handleTaskCompleted = async (taskId: TaskType) => {
    const task = TASK_DEFINITIONS[taskId];
    if (!task) return;

    try {
      // Lägg till resurser om tasken ger belöningar
      if (Object.keys(task.rewards).length > 0) {
        await addResources(task.rewards);
      }

      // Lägg till erfarenhet — uppdaterar nivån automatiskt
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

  // Initierar useTasks efter handleTaskCompleted är definierad
  const tasksHook = useTasks(USER_ID, inventory, worldItems, handleTaskCompleted);
  const { activeTask, secondsRemaining, startTask } = tasksHook;

  // Startar gånganimation när task pågår, stoppar när ingen task är aktiv
  useEffect(() => {
    if (activeTask) {
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

  // Hämtar tillgängliga tasks baserat på nivå
  const availableTasks = getAvailableTasks(character.level);

  // Hämtar vitals med standardvärden om de saknas
  const vitals = character.vitals ?? { health: 100, hunger: 100, thirst: 100 };

  return (
    <SafeAreaView style={styles.container}>

      {/* Vitals-rad med hälsa, hunger, törst och klocka */}
      <VitalsBar
        vitals={vitals}
        currentTime={currentTime}
        timeOfDay={timeOfDay}
      />

      {/* Skogsvyn — uppdateras med dag/natt-färger och världsobjekt */}
      <View style={styles.worldContainer}>
        <ForestScene
          worldItems={worldItems}
          colors={colors}
          showSun={showSun}
          timeOfDay={timeOfDay}
        />

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

      {/* Aktiv task eller välj task-knapp */}
      {activeTask ? (
        <ActiveTaskBar
          activeTask={activeTask}
          secondsRemaining={secondsRemaining}
          onFinishNow={() => tasksHook.finishTaskNow()}
        />
      ) : (
        <TouchableOpacity
          style={styles.startTaskBtn}
          onPress={() => setShowTaskList(true)}
        >
          <Text style={styles.startTaskBtnText}>⚔️ Välj task</Text>
        </TouchableOpacity>
      )}

      {/* Task-lista modal */}
      <TaskListModal
        visible={showTaskList}
        onClose={() => setShowTaskList(false)}
        tasks={availableTasks}
        inventory={inventory}
        worldItems={worldItems}
        characterLevel={character.level}
        onSelectTask={handleStartTask}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Huvudbehållare
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

  // Skogsvyn — tar upp majoriteten av skärmen
  worldContainer: {
    flex: 1,
    position: 'relative',
  },

  // Karaktären placerad i scenen
  characterInWorld: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -40 }],
  },

  // Knapp för att öppna task-listan
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
});
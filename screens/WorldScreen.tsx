// screens/WorldScreen.tsx
// Huvudskärmen för spelet — visar skogsmiljön och aktiv task
// Koordinerar alla hooks och skickar data till underkomponenter
// Karaktären ritas nu direkt inuti ForestScene för naturlig djupkänsla

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

  // Animationsvärde för karaktärens horisontella rörelse
  const walkAnim = useRef(new Animated.Value(0)).current;

  // Håller det aktuella walk-offset-värdet som skickas till ForestScene
  const [walkOffset, setWalkOffset] = useState(0);

  // Hanterar när en task är klar
  const handleTaskCompleted = async (taskId: TaskType) => {
    const task = TASK_DEFINITIONS[taskId];
    if (!task) return;

    try {
      if (Object.keys(task.rewards).length > 0) {
        await addResources(task.rewards);
      }
      await addExperience(task.experienceReward);
      if (task.createsWorldItem) {
        await addWorldItem(task.createsWorldItem);
      }
      await tasksHook.clearActiveTask();

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

  const tasksHook = useTasks(USER_ID, inventory, worldItems, handleTaskCompleted);
  const { activeTask, secondsRemaining, startTask } = tasksHook;

  // Startar gånganimation och lyssnar på värdeändringar
  // Skickar walkOffset till ForestScene som ritar karaktären på rätt position
  useEffect(() => {
    if (activeTask) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(walkAnim, {
            toValue: 12,
            duration: 400,
            useNativeDriver: false, // Måste vara false för att kunna läsa värdet
          }),
          Animated.timing(walkAnim, {
            toValue: -12,
            duration: 400,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();

      // Lyssnar på animationsvärdet och uppdaterar walkOffset
      const listener = walkAnim.addListener(({ value }) => {
        setWalkOffset(value);
      });

      return () => {
        animation.stop();
        walkAnim.removeListener(listener);
      };
    } else {
      // Återställer positionen när ingen task pågår
      walkAnim.setValue(0);
      setWalkOffset(0);
    }
  }, [activeTask]);

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
      Alert.alert('Fel', 'Kunde inte starta tasken.');
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
  const vitals = character.vitals ?? { health: 100, hunger: 100, thirst: 100 };

  return (
    <SafeAreaView style={styles.container}>

      {/* Vitals-rad */}
      <VitalsBar
        vitals={vitals}
        currentTime={currentTime}
        timeOfDay={timeOfDay}
      />

      {/* Skogsvyn med karaktären integrerad */}
      <View style={styles.worldContainer}>
        <ForestScene
          worldItems={worldItems}
          colors={colors}
          showSun={showSun}
          timeOfDay={timeOfDay}
          appearance={character.appearance}
          isWalking={!!activeTask}
          walkOffset={walkOffset}
        />
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
  worldContainer: {
    flex: 1,
  },
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
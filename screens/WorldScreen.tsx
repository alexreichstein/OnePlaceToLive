// screens/WorldScreen.tsx
// Huvudskärmen för spelet — visar skogsmiljön och aktiv task
// Koordinerar alla hooks och skickar data till underkomponenter
// Karaktären animeras ut/in ur bild när tasks startar/slutar
// Belöningar visas som flyande ikoner istället för alert

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCharacter from '../hooks/useCharacter';
import useResources from '../hooks/useResources';
import useTasks from '../hooks/useTasks';
import useWorld from '../hooks/useWorld';
import useDayNight from '../hooks/useDayNight';
import useVitals from '../hooks/useVitals';
import ForestScene from '../components/ForestScene';
import VitalsBar from '../components/VitalsBar';
import ActiveTaskBar from '../components/ActiveTaskBar';
import TaskListModal from '../components/TaskListModal';
import { TASK_DEFINITIONS, RESOURCE_NAMES, RESOURCE_EMOJIS } from '../constants';
import { getAvailableTasks } from '../gameData/tasks';
import { TaskType } from '../types';

// Temporärt hårdkodat userId — i framtiden kopplat till inloggning
const USER_ID = 'player_alex';

// Karaktärens startposition i mitten av scenen
const CHAR_CENTER_X = 0;

// Offset för att gå ut ur bild till höger
const CHAR_OFFSCREEN_X = 450;

// Typ för en flyande belönings-ikon
type FloatingReward = {
  id: number;
  label: string;
  anim: Animated.Value; // Vertikal position
  opacity: Animated.Value;
};

export default function WorldScreen() {
  const { character, addExperience, updateVitals } = useCharacter(USER_ID);
  const { inventory, addResources, consumeResources } = useResources(USER_ID);
  const { worldItems, addWorldItem } = useWorld(USER_ID);
  const { timeOfDay, currentTime, colors, showSun } = useDayNight();

  // Kör vitals-förfall i bakgrunden
  useVitals(USER_ID, character);

  // Styr om task-listan är synlig
  const [showTaskList, setShowTaskList] = useState(false);

  // Animationsvärde för karaktärens horisontella offset
  const walkAnim = useRef(new Animated.Value(CHAR_CENTER_X)).current;

  // Håller det aktuella walk-offset-värdet som skickas till ForestScene
  const [walkOffset, setWalkOffset] = useState(CHAR_CENTER_X);

  // Lista med flyande belönings-ikoner som visas när en task är klar
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);

  // Räknare för att ge unika ID:n till flyande ikoner
  const rewardCounterRef = useRef(0);

  // Ref för att hålla koll på om karaktären är ute ur bild
  const isOffscreenRef = useRef(false);

  // Lyssnar på animationsvärdet och uppdaterar walkOffset i state
  useEffect(() => {
    const listener = walkAnim.addListener(({ value }) => {
      setWalkOffset(value);
    });
    return () => walkAnim.removeListener(listener);
  }, []);

  // Animerar karaktären ut ur bild till höger på 3 sekunder
  const walkOffscreen = () => {
    return new Promise<void>((resolve) => {
      Animated.timing(walkAnim, {
        toValue: CHAR_OFFSCREEN_X,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => {
        isOffscreenRef.current = true;
        resolve();
      });
    });
  };

  // Animerar karaktären in från höger till mitten på 3 sekunder
  const walkOnscreen = () => {
    return new Promise<void>((resolve) => {
      walkAnim.setValue(CHAR_OFFSCREEN_X);
      Animated.timing(walkAnim, {
        toValue: CHAR_CENTER_X,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => {
        isOffscreenRef.current = false;
        resolve();
      });
    });
  };

  // Visar en flyande ikon med text som flödar uppåt och tonas ut
  const spawnFloatingReward = (label: string) => {
    const id = rewardCounterRef.current++;
    const anim = new Animated.Value(0);
    const opacity = new Animated.Value(1);

    setFloatingRewards((prev) => [...prev, { id, label, anim, opacity }]);

    // Animerar uppåt och tonar ut på 1.5 sekunder
    Animated.parallel([
      Animated.timing(anim, {
        toValue: -80,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Ta bort ikonen ur listan när animationen är klar
      setFloatingRewards((prev) => prev.filter((r) => r.id !== id));
    });
  };

  // Hanterar när en task är klar
  // Karaktären kommer tillbaka, belöningar visas som flyande ikoner
  const handleTaskCompleted = async (taskId: TaskType) => {
    const task = TASK_DEFINITIONS[taskId];
    if (!task) return;

    try {
      // Animera karaktären tillbaka in i bild
      await walkOnscreen();

      // Lägg till resursbelöningar
      if (Object.keys(task.rewards).length > 0) {
        await addResources(task.rewards);
        // Spawn en ikon per resurstyp
        Object.entries(task.rewards).forEach(([res, amt]) => {
          const emoji = RESOURCE_EMOJIS[res] ?? '📦';
          spawnFloatingReward(`${emoji} +${amt} ${RESOURCE_NAMES[res] ?? res}`);
        });
      }

      // Återställ vitals om tasken har restoresVitals
      if (task.restoresVitals) {
        await updateVitals(task.restoresVitals);
        // Spawn ikoner för varje vital som återställs
        const vitalEmojis: Record<string, string> = {
          health: '❤️',
          hunger: '🍖',
          thirst: '💧',
        };
        Object.entries(task.restoresVitals).forEach(([vital, amt]) => {
          spawnFloatingReward(`${vitalEmojis[vital] ?? '✨'} +${amt}`);
        });
      }

      // Lägg till erfarenhet och spawn XP-ikon
      await addExperience(task.experienceReward);
      spawnFloatingReward(`⭐ +${task.experienceReward} XP`);

      // Skapa världsobjekt om tasken skapar ett
      if (task.createsWorldItem) {
        await addWorldItem(task.createsWorldItem);
        spawnFloatingReward(`🏗️ ${task.name} built!`);
      }

      await tasksHook.clearActiveTask();
    } catch (e) {
      console.error('Fel vid task-avslutning:', e);
    }
  };

  const tasksHook = useTasks(USER_ID, inventory, worldItems, handleTaskCompleted);
  const { activeTask, secondsRemaining, startTask } = tasksHook;

  // Hanterar animation baserat på om en task är aktiv
  useEffect(() => {
    if (activeTask && !isOffscreenRef.current) {
      // Ny task startad — animera karaktären ut ur bild
      walkOffscreen();
    } else if (!activeTask && isOffscreenRef.current) {
      // Task avslutades externt — ta tillbaka karaktären
      walkOnscreen();
    } else if (!activeTask) {
      // Ingen aktiv task — säkerställ korrekt position
      walkAnim.setValue(CHAR_CENTER_X);
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
      // Visa inget alert — task-listan hanterar felbeskrivning
      console.error('Kunde inte starta task:', e);
    }
  };

  if (!character) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Create your character first!</Text>
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

      {/* Skogsvyn med karaktären */}
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

        {/* Flyande belönings-ikoner — ritas ovanpå scenen */}
        {floatingRewards.map((reward) => (
          <Animated.Text
            key={reward.id}
            style={[
              styles.floatingReward,
              {
                transform: [{ translateY: reward.anim }],
                opacity: reward.opacity,
              },
            ]}
          >
            {reward.label}
          </Animated.Text>
        ))}
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
          <Text style={styles.startTaskBtnText}>⚔️ Choose task</Text>
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
  // Flyande belönings-ikon — centrerad i scenen
  floatingReward: {
    position: 'absolute',
    bottom: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

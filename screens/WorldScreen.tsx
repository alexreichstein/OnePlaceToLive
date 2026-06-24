// screens/WorldScreen.tsx
// Huvudskärmen för spelet — visar skogsmiljön och aktiv task
// SVG-scenen fyller hela skärmen mellan VitalsBar och bottom tabs
// Skylten och Choose task-knappen är inbyggda i scenen

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
import WorldItemModal from '../components/WorldItemModal';
import { TASK_DEFINITIONS, RESOURCE_NAMES, RESOURCE_EMOJIS } from '../constants';
import { getAvailableTasks } from '../gameData/tasks';
import { TaskType, WorldItemType } from '../types';
import { WorldStackParamList } from '../navigation';

type NavigationProp = StackNavigationProp<WorldStackParamList, 'WorldMain'>;

const USER_ID = 'player_alex';
const CHAR_CENTER_X = 0;
const CHAR_OFFSCREEN_X = 450;

type FloatingReward = {
  id: number;
  label: string;
  anim: Animated.Value;
  opacity: Animated.Value;
  bottomPos: number;
};

export default function WorldScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { character, addExperience, updateVitals } = useCharacter(USER_ID);
  const { inventory, addResources, consumeResources } = useResources(USER_ID);
  const { worldItems, addWorldItem } = useWorld(USER_ID);
  const { timeOfDay, currentTime, colors, showSun } = useDayNight();

  useVitals(USER_ID, character);

  const [showTaskList, setShowTaskList] = useState(false);
  const [selectedWorldItem, setSelectedWorldItem] = useState<WorldItemType | null>(null);

  const walkAnim = useRef(new Animated.Value(CHAR_CENTER_X)).current;
  const [walkOffset, setWalkOffset] = useState(CHAR_CENTER_X);
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);
  const rewardCounterRef = useRef(0);
  const isHandlingCompletionRef = useRef(false);
  const prevActiveTaskRef = useRef<typeof activeTask>(null);

  useEffect(() => {
    const listener = walkAnim.addListener(({ value }) => setWalkOffset(value));
    return () => walkAnim.removeListener(listener);
  }, []);

  const walkOffscreen = (): Promise<void> => {
    return new Promise((resolve) => {
      Animated.timing(walkAnim, {
        toValue: CHAR_OFFSCREEN_X,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => resolve());
    });
  };

  const walkOnscreen = (): Promise<void> => {
    return new Promise((resolve) => {
      walkAnim.setValue(CHAR_OFFSCREEN_X);
      Animated.timing(walkAnim, {
        toValue: CHAR_CENTER_X,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => resolve());
    });
  };

  const spawnFloatingReward = (label: string, index: number) => {
    const id = rewardCounterRef.current++;
    const anim = new Animated.Value(0);
    const opacity = new Animated.Value(0);
    const bottomPos = 100 + index * 60;
    const delay = index * 400;

    setFloatingRewards((prev) => [...prev, { id, label, anim, opacity, bottomPos }]);

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: -60, duration: 1600, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setFloatingRewards((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const handleTaskCompleted = async (taskId: TaskType) => {
    if (isHandlingCompletionRef.current) return;
    isHandlingCompletionRef.current = true;

    const task = TASK_DEFINITIONS[taskId];
    if (!task) {
      isHandlingCompletionRef.current = false;
      return;
    }

    try {
      await walkOnscreen();
      let iconIndex = 0;

      if (Object.keys(task.rewards).length > 0) {
        await addResources(task.rewards);
        Object.entries(task.rewards).forEach(([res, amt]) => {
          const emoji = RESOURCE_EMOJIS[res] ?? '📦';
          spawnFloatingReward(`${emoji} +${amt} ${RESOURCE_NAMES[res] ?? res}`, iconIndex++);
        });
      }

      if (task.restoresVitals) {
        await updateVitals(task.restoresVitals);
        const vitalEmojis: Record<string, string> = { health: '❤️', hunger: '🍖', thirst: '💧' };
        Object.entries(task.restoresVitals).forEach(([vital, amt]) => {
          spawnFloatingReward(`${vitalEmojis[vital] ?? '✨'} +${amt}`, iconIndex++);
        });
      }

      await addExperience(task.experienceReward);
      spawnFloatingReward(`⭐ +${task.experienceReward} XP`, iconIndex++);

      if (task.createsWorldItem) {
        await addWorldItem(task.createsWorldItem);
        spawnFloatingReward(`🏗️ ${task.name} built!`, iconIndex++);
      }

      await tasksHook.clearActiveTask();
    } catch (e) {
      console.error('Fel vid task-avslutning:', e);
    } finally {
      isHandlingCompletionRef.current = false;
    }
  };

  const tasksHook = useTasks(USER_ID, inventory, worldItems, handleTaskCompleted);
  const { activeTask, secondsRemaining, startTask } = tasksHook;

  useEffect(() => {
    const wasNull = prevActiveTaskRef.current === null;
    const isNowSet = activeTask !== null;
    if (wasNull && isNowSet) walkOffscreen();
    prevActiveTaskRef.current = activeTask;
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
      setSelectedWorldItem(null);
    } catch (e) {
      console.error('Kunde inte starta task:', e);
    }
  };

  const handleWorldItemPress = (item: WorldItemType) => {
    if (activeTask) return;
    // Lägret navigerar till CampScreen istället för popup
    if (item === 'camp') {
      navigation.navigate('Camp');
      return;
    }
    setSelectedWorldItem(item);
  };

  if (!character) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Create your character first!</Text>
      </View>
    );
  }

  const availableTasks = getAvailableTasks(character.level).filter(
    (task) => !task.interactsWith
  );
  const vitals = character.vitals ?? { health: 100, hunger: 100, thirst: 100 };

  return (
    <SafeAreaView style={styles.container}>

      {/* Vitals-rad längst upp */}
      <VitalsBar vitals={vitals} currentTime={currentTime} timeOfDay={timeOfDay} />

      {/* Scenen fyller allt utrymme mellan VitalsBar och bottom tabs */}
      <View style={styles.worldContainer}>
        <ForestScene
          worldItems={worldItems}
          colors={colors}
          showSun={showSun}
          timeOfDay={timeOfDay}
          appearance={character.appearance}
          isWalking={!!activeTask}
          walkOffset={walkOffset}
          onWorldItemPress={handleWorldItemPress}
        />

        {/* Träskylt — placerad inuti scenen längs stigen, nedre halvan */}
        {!activeTask && (
          <TouchableOpacity
            style={styles.signPost}
            onPress={() => navigation.navigate('Combat')}
            activeOpacity={0.8}
          >
            <View style={styles.signBoard}>
              <Text style={styles.signText}>→ South</Text>
            </View>
            <View style={styles.signPole} />
          </TouchableOpacity>
        )}

        {/* Choose task — inuti scenen längst ner */}
        {!activeTask && (
          <TouchableOpacity
            style={styles.chooseTaskBtn}
            onPress={() => setShowTaskList(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.chooseTaskText}>⚔️ Choose task</Text>
          </TouchableOpacity>
        )}

        {/* Active task bar — inuti scenen när task pågår */}
        {activeTask && (
          <View style={styles.activeTaskContainer}>
            <ActiveTaskBar
              activeTask={activeTask}
              secondsRemaining={secondsRemaining}
              onFinishNow={() => tasksHook.finishTaskNow()}
            />
          </View>
        )}

        {/* Flyande belönings-ikoner */}
        {floatingRewards.map((reward) => (
          <Animated.Text
            key={reward.id}
            style={[
              styles.floatingReward,
              {
                bottom: reward.bottomPos,
                transform: [{ translateY: reward.anim }],
                opacity: reward.opacity,
              },
            ]}
          >
            {reward.label}
          </Animated.Text>
        ))}
      </View>

      {/* Modaler */}
      <TaskListModal
        visible={showTaskList}
        onClose={() => setShowTaskList(false)}
        tasks={availableTasks}
        inventory={inventory}
        worldItems={worldItems}
        characterLevel={character.level}
        onSelectTask={handleStartTask}
      />

      <WorldItemModal
        visible={selectedWorldItem !== null}
        worldItem={selectedWorldItem}
        inventory={inventory}
        onClose={() => setSelectedWorldItem(null)}
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
  // Scenen fyller hela utrymmet
  worldContainer: {
    flex: 1,
  },

  // Träskylt — inuti scenen, centrad längs stigen
  signPost: {
    position: 'absolute',
    bottom: 90,
    left: '54%',
    alignItems: 'center',
  },
  signBoard: {
    backgroundColor: '#8B6914',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#5C4A0A',
    transform: [{ rotate: '-3deg' }],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  signText: {
    color: '#FFF8DC',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signPole: {
    width: 6,
    height: 28,
    backgroundColor: '#6B4A10',
    borderRadius: 2,
  },

  // Choose task — längst ner i scenen
  chooseTaskBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(74, 124, 89, 0.92)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5A9C6A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  chooseTaskText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  // Active task bar — inuti scenen
  activeTaskContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  floatingReward: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

// hooks/useTasks.ts
// Hook för att hantera aktiva tasks mot Firebase
// Startar, avslutar och kontrollerar tasks med offline-stöd
// Räknar ut om en task är klar baserat på sparad starttid
// Fix: addWorldItem borttagen — hanteras nu av useWorld

import { useEffect, useState, useRef } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { db } from '../firebase';
import { ActiveTask, TaskType, WorldItemType, Inventory } from '../types';
import { TASK_DEFINITIONS } from '../constants';
import { getRemainingSeconds } from '../gameData/tasks';

// Sökvägen till spelardokumentet i Firestore
const getPlayerRef = (userId: string) => doc(db, 'players', userId);

const useTasks = (
  userId: string,
  inventory: Inventory,
  worldItems: WorldItemType[],
  onTaskCompleted: (taskId: TaskType) => void
) => {
  // Aktiv task — null om ingen task pågår
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);

  // Sekunder kvar av aktiv task — uppdateras varje sekund
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Indikerar om första laddningen från Firestore pågår
  const [loading, setLoading] = useState(true);

  // Felmeddelande om Firebase är nere
  const [error, setError] = useState<string | null>(null);

  // Ref för intervallet som räknar ner tiden
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ref för att hålla koll på om en task redan markerats som klar
  const completedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Prenumererar på realtidsuppdateringar för spelardokumentet
    const unsubscribe = onSnapshot(
      getPlayerRef(userId),
      (snapshot) => {
        setError(null);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const task = (data.activeTask as ActiveTask) ?? null;
          setActiveTask(task);

          if (task) {
            const remaining = getRemainingSeconds(task.endTime);
            setSecondsRemaining(remaining);

            // Om tasken redan är klar när appen öppnas — slutför den direkt
            if (remaining <= 0 && completedRef.current !== task.taskId) {
              completedRef.current = task.taskId;
              onTaskCompleted(task.taskId);
            }
          } else {
            setSecondsRemaining(0);
            completedRef.current = null;
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firebase-fel:', err);
        setError('Kunde inte ansluta till servern.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Startar ett intervall som räknar ner sekunder varje sekund
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!activeTask) return;

    intervalRef.current = setInterval(() => {
      const remaining = getRemainingSeconds(activeTask.endTime);
      setSecondsRemaining(remaining);

      if (remaining <= 0 && completedRef.current !== activeTask.taskId) {
        completedRef.current = activeTask.taskId;
        onTaskCompleted(activeTask.taskId);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTask]);

  // Startar en ny task och schemalägger notis
  const startTask = async (taskId: TaskType): Promise<void> => {
    try {
      const task = TASK_DEFINITIONS[taskId];
      if (!task) throw new Error('Okänd task');

      const now = Date.now();
      const endTime = now + task.durationMinutes * 60 * 1000;

      const newTask: ActiveTask = {
        taskId,
        startTime: now,
        endTime,
      };

      await updateDoc(getPlayerRef(userId), { activeTask: newTask });
      await scheduleTaskNotification(task.name, endTime);
    } catch (e) {
      throw new Error('Kunde inte starta tasken.');
    }
  };

  // Avslutar den aktiva tasken och rensar den från Firestore
  const clearActiveTask = async (): Promise<void> => {
    try {
      await updateDoc(getPlayerRef(userId), { activeTask: null });
      completedRef.current = null;
    } catch (e) {
      throw new Error('Kunde inte rensa tasken.');
    }
  };

  // Avslutar tasken direkt — endast för testning
  // Sätter endTime till för 1 sekund sedan så timern triggas omedelbart
  const finishTaskNow = async (): Promise<void> => {
    if (!activeTask) return;
    try {
      await updateDoc(getPlayerRef(userId), {
        'activeTask.endTime': Date.now() - 1000,
      });
    } catch (e) {
      console.error('Kunde inte avsluta task:', e);
    }
  };

  // Schemalägger en lokal notis när tasken är klar
  const scheduleTaskNotification = async (taskName: string, endTime: number): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        identifier: 'task_complete',
        content: {
          title: '⚔️ One Place To Live',
          body: `${taskName} är klar!`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(endTime),
        },
      });
    } catch (e) {
      console.warn('Kunde inte schemalägga notis:', e);
    }
  };

  // addWorldItem är borttagen — hanteras nu av useWorld
  return {
    activeTask,
    secondsRemaining,
    loading,
    error,
    startTask,
    clearActiveTask,
    finishTaskNow,
  };
};

export default useTasks;
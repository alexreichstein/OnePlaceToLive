// hooks/useTasks.ts
// Hook för att hantera aktiva tasks mot Firebase
// Startar, avslutar och kontrollerar tasks med offline-stöd
// Räknar ut om en task är klar baserat på sparad starttid

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

// Hook som exponerar task-logik och funktioner till UI-komponenter
const useTasks = (
  userId: string,
  inventory: Inventory,
  worldItems: WorldItemType[],
  onTaskCompleted: (taskId: TaskType) => void // Callback när en task är klar
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
  // Förhindrar att onTaskCompleted anropas flera gånger
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
            // Task pågår — beräkna återstående tid
            const remaining = getRemainingSeconds(task.endTime);
            setSecondsRemaining(remaining);

            // Om tasken redan är klar när appen öppnas — slutför den direkt
            if (remaining <= 0 && completedRef.current !== task.taskId) {
              completedRef.current = task.taskId;
              onTaskCompleted(task.taskId);
            }
          } else {
            // Ingen aktiv task
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
  // Kontrollerar också om tasken är klar
  useEffect(() => {
    // Rensar eventuellt gammalt intervall
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!activeTask) return;

    // Startar nytt intervall som körs varje sekund
    intervalRef.current = setInterval(() => {
      const remaining = getRemainingSeconds(activeTask.endTime);
      setSecondsRemaining(remaining);

      // Task är klar — anropa callback och rensa intervallet
      if (remaining <= 0 && completedRef.current !== activeTask.taskId) {
        completedRef.current = activeTask.taskId;
        onTaskCompleted(activeTask.taskId);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);

    // Rensar intervallet när activeTask ändras eller komponenten unmountas
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTask]);

  // Startar en ny task
  // Kontrollerar krav, förbrukar resurser och sparar tasken i Firestore
  const startTask = async (taskId: TaskType): Promise<void> => {
    try {
      const task = TASK_DEFINITIONS[taskId];
      if (!task) throw new Error('Okänd task');

      // Kontrollerar nivåkrav
      // (nivåkontroll sker i UI men vi dubbelkollar här)

      // Beräknar sluttiden baserat på taskens längd
      const now = Date.now();
      const endTime = now + task.durationMinutes * 60 * 1000;

      const activeTask: ActiveTask = {
        taskId,
        startTime: now,
        endTime,
      };

      // Sparar aktiv task i Firestore
      await updateDoc(getPlayerRef(userId), {
        activeTask,
      });

      // Schemalägger en lokal notis när tasken är klar
      await scheduleTaskNotification(task.name, endTime);

    } catch (e) {
      throw new Error('Kunde inte starta tasken.');
    }
  };

  // Avslutar den aktiva tasken och rensar den från Firestore
  // Anropas av onTaskCompleted-callbacken i förälderkomponenten
  const clearActiveTask = async (): Promise<void> => {
    try {
      await updateDoc(getPlayerRef(userId), {
        activeTask: null,
      });
      completedRef.current = null;
    } catch (e) {
      throw new Error('Kunde inte rensa tasken.');
    }
  };

  // Lägger till ett världsobjekt i Firestore
  // Anropas när en task skapar ett permanent objekt i scenen
  const addWorldItem = async (item: WorldItemType): Promise<void> => {
    try {
      const updatedItems = [...worldItems, item];
      await updateDoc(getPlayerRef(userId), {
        worldItems: updatedItems,
      });
    } catch (e) {
      throw new Error('Kunde inte lägga till världsobjekt.');
    }
  };

  // Schemalägger en lokal notis när tasken är klar
  const scheduleTaskNotification = async (taskName: string, endTime: number): Promise<void> => {
    try {
      // Avbryt eventuell tidigare task-notis
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schemalägger ny notis
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
      // Notiser är inte kritiska — logga men krascha inte
      console.warn('Kunde inte schemalägga notis:', e);
    }
  };

  // Returnerar data och funktioner som komponenter behöver
  return {
    activeTask,
    secondsRemaining,
    loading,
    error,
    startTask,
    clearActiveTask,
    addWorldItem,
  };
};

export default useTasks;
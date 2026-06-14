// hooks/useCharacter.ts
// Hook för att hantera karaktärsdata mot Firebase
// Skapar, hämtar och uppdaterar spelarens karaktär
// Inkluderar vitala värden: hälsa, hunger och törst
// Migration: lägger automatiskt till vitals/lastVitalsUpdate om de saknas
// updateVitals adderar/subtraherar värden från nuvarande vitals

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Character, CharacterAppearance, VitalStats } from '../types';
import { getLevel } from '../constants';

// Sökvägen till spelardokumentet i Firestore
const getPlayerRef = (userId: string) => doc(db, 'players', userId);

// Standardvärden för vitals när karaktären skapas eller saknar fälten
const DEFAULT_VITALS: VitalStats = {
  health: 100,
  hunger: 100,
  thirst: 100,
};

const useCharacter = (userId: string) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // async-callback krävs för att kunna använda await inuti onSnapshot
    const unsubscribe = onSnapshot(
      getPlayerRef(userId),
      async (snapshot) => {
        setError(null);

        if (snapshot.exists()) {
          const data = snapshot.data();

          // Kontrollera att character-fältet finns innan vi sätter state
          if (!data?.character) {
            setCharacter(null);
          } else {
            const char = data.character as Character;

            // Migration: lägg till vitals och lastVitalsUpdate om de saknas
            // Hanterar äldre dokument och nya spelare automatiskt
            if (!char.vitals || !char.lastVitalsUpdate) {
              await updateDoc(getPlayerRef(userId), {
                'character.vitals': char.vitals ?? DEFAULT_VITALS,
                'character.lastVitalsUpdate': char.lastVitalsUpdate ?? Date.now(),
              });
              // onSnapshot triggas igen automatiskt med de nya värdena
              return;
            }

            setCharacter(char);
          }
        } else {
          setCharacter(null);
        }

        setLoading(false);
      },
      (err) => {
        console.error('[useCharacter] Firebase-fel:', err);
        setError('Kunde inte ansluta till servern.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Skapar en ny karaktär i Firestore med standardvärden för vitals
  const createCharacter = async (
    name: string,
    appearance: CharacterAppearance
  ): Promise<void> => {
    try {
      const newCharacter: Character = {
        id: userId,
        name: name.trim(),
        appearance,
        level: 1,
        experience: 0,
        vitals: DEFAULT_VITALS,
        lastVitalsUpdate: Date.now(),
        createdAt: Date.now(),
      };

      await setDoc(getPlayerRef(userId), {
        character: newCharacter,
        inventory: {},
        activeTask: null,
        worldItems: [],
      });
    } catch (e) {
      throw new Error('Kunde inte skapa karaktären. Kontrollera din anslutning.');
    }
  };

  // Uppdaterar karaktärens utseende
  const updateAppearance = async (appearance: CharacterAppearance): Promise<void> => {
    try {
      await updateDoc(getPlayerRef(userId), {
        'character.appearance': appearance,
      });
    } catch (e) {
      throw new Error('Kunde inte uppdatera utseendet.');
    }
  };

  // Lägger till erfarenhet och uppdaterar nivån automatiskt
  // Läser från Firestore direkt för att undvika stale state
  const addExperience = async (amount: number): Promise<void> => {
    try {
      const snapshot = await getDoc(getPlayerRef(userId));
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      if (!data?.character) return;

      const freshCharacter = data.character as Character;
      const newExperience = freshCharacter.experience + amount;
      const newLevel = getLevel(newExperience);

      await updateDoc(getPlayerRef(userId), {
        'character.experience': newExperience,
        'character.level': newLevel,
      });
    } catch (e) {
      throw new Error('Kunde inte uppdatera erfarenheten.');
    }
  };

  // Uppdaterar vitals genom att addera/subtrahera från nuvarande värden
  // Positiva värden ökar vitalen, negativa minskar den
  // Resultatet kläms alltid mellan 0 och 100
  const updateVitals = async (vitals: Partial<VitalStats>): Promise<void> => {
    try {
      const snapshot = await getDoc(getPlayerRef(userId));
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      if (!data?.character) return;

      const freshCharacter = data.character as Character;
      const currentVitals = freshCharacter.vitals ?? DEFAULT_VITALS;

      // Adderar inkommande värden till nuvarande vitals
      // T.ex. restoresVitals: { thirst: 33 } → thirst + 33, klämt till max 100
      const newVitals: VitalStats = {
        health: Math.min(100, Math.max(0, currentVitals.health + (vitals.health ?? 0))),
        hunger: Math.min(100, Math.max(0, currentVitals.hunger + (vitals.hunger ?? 0))),
        thirst: Math.min(100, Math.max(0, currentVitals.thirst + (vitals.thirst ?? 0))),
      };

      await updateDoc(getPlayerRef(userId), {
        'character.vitals': newVitals,
        'character.lastVitalsUpdate': Date.now(),
      });
    } catch (e) {
      throw new Error('Kunde inte uppdatera vitals.');
    }
  };

  return { character, loading, error, createCharacter, updateAppearance, addExperience, updateVitals };
};

export default useCharacter;
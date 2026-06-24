// hooks/useCharacter.ts
// Hook för att hantera karaktärsdata mot Firebase
// Skapar, hämtar och uppdaterar spelarens karaktär
// Inkluderar vitala värden samt equipment (vapen och armor)
// Migration: lägger automatiskt till vitals/equipment om de saknas

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Character, CharacterAppearance, VitalStats, Equipment, WeaponType, ArmorType } from '../types';
import { getLevel } from '../constants';

const getPlayerRef = (userId: string) => doc(db, 'players', userId);

const DEFAULT_VITALS: VitalStats = {
  health: 100,
  hunger: 100,
  thirst: 100,
};

// Standardvärden för equipment — inget utrustat när karaktären skapas
const DEFAULT_EQUIPMENT: Equipment = {
  weaponSlot: null,
  armorSlot: null,
};

const useCharacter = (userId: string) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      getPlayerRef(userId),
      async (snapshot) => {
        setError(null);

        if (snapshot.exists()) {
          const data = snapshot.data();

          if (!data?.character) {
            setCharacter(null);
          } else {
            const char = data.character as Character;

            // Migration: lägg till vitals och equipment om de saknas
            // Hanterar äldre dokument som skapades innan dessa fält fanns
            if (!char.vitals || !char.lastVitalsUpdate || !char.equipment) {
              await updateDoc(getPlayerRef(userId), {
                'character.vitals': char.vitals ?? DEFAULT_VITALS,
                'character.lastVitalsUpdate': char.lastVitalsUpdate ?? Date.now(),
                'character.equipment': char.equipment ?? DEFAULT_EQUIPMENT,
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

  // Skapar en ny karaktär i Firestore med standardvärden för vitals och equipment
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
        equipment: DEFAULT_EQUIPMENT,
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

  const updateAppearance = async (appearance: CharacterAppearance): Promise<void> => {
    try {
      await updateDoc(getPlayerRef(userId), {
        'character.appearance': appearance,
      });
    } catch (e) {
      throw new Error('Kunde inte uppdatera utseendet.');
    }
  };

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
  const updateVitals = async (vitals: Partial<VitalStats>): Promise<void> => {
    try {
      const snapshot = await getDoc(getPlayerRef(userId));
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      if (!data?.character) return;

      const freshCharacter = data.character as Character;
      const currentVitals = freshCharacter.vitals ?? DEFAULT_VITALS;

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

  // Utrustar ett vapen i weaponSlot — ersätter befintligt vapen om något var utrustat
  const equipWeapon = async (weapon: WeaponType): Promise<void> => {
    try {
      await updateDoc(getPlayerRef(userId), {
        'character.equipment.weaponSlot': weapon,
      });
    } catch (e) {
      throw new Error('Kunde inte utrusta vapnet.');
    }
  };

  // Utrustar en armor i armorSlot — ersätter befintlig armor om något var utrustat
  const equipArmor = async (armor: ArmorType): Promise<void> => {
    try {
      await updateDoc(getPlayerRef(userId), {
        'character.equipment.armorSlot': armor,
      });
    } catch (e) {
      throw new Error('Kunde inte utrusta armoren.');
    }
  };

  return {
    character,
    loading,
    error,
    createCharacter,
    updateAppearance,
    addExperience,
    updateVitals,
    equipWeapon,
    equipArmor,
  };
};

export default useCharacter;

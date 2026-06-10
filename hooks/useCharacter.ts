// hooks/useCharacter.ts
// Hook för att hantera karaktärsdata mot Firebase
// Skapar, hämtar och uppdaterar spelarens karaktär
// En spelare har alltid exakt en karaktär kopplad till sitt userId

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Character, CharacterAppearance } from '../types';
import { getLevel, LEVEL_THRESHOLDS } from '../constants';

// Sökvägen till spelardokumentet i Firestore
// Varje spelare har ett unikt userId som dokumentnyckeln
const getPlayerRef = (userId: string) => doc(db, 'players', userId);

// Hook som exponerar karaktärsdata och funktioner till UI-komponenter
// userId identifierar spelaren — i framtiden kopplat till inloggning
const useCharacter = (userId: string) => {
  // Karaktärsdata — null om ingen karaktär skapats ännu
  const [character, setCharacter] = useState<Character | null>(null);

  // Indikerar om första laddningen från Firestore pågår
  const [loading, setLoading] = useState(true);

  // Felmeddelande om Firebase är nere — null om allt fungerar
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Prenumererar på realtidsuppdateringar för spelarens dokument
    const unsubscribe = onSnapshot(
      getPlayerRef(userId),
      (snapshot) => {
        setError(null);
        if (snapshot.exists()) {
          // Karaktär finns — ladda in den
          const data = snapshot.data();
          setCharacter(data.character as Character);
        } else {
          // Ingen karaktär finns ännu — spelaren måste skapa en
          setCharacter(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firebase-fel:', err);
        setError('Kunde inte ansluta till servern.');
        setLoading(false);
      }
    );

    // Avslutar prenumerationen när userId ändras eller komponenten unmountas
    return () => unsubscribe();
  }, [userId]);

  // Skapar en ny karaktär i Firestore
  // Anropas första gången spelaren öppnar appen
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
        createdAt: Date.now(),
      };

      // Skapar eller ersätter spelardokumentet i Firestore
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
  const addExperience = async (amount: number): Promise<void> => {
    if (!character) return;
    try {
      const newExperience = character.experience + amount;
      const newLevel = getLevel(newExperience);
      await updateDoc(getPlayerRef(userId), {
        'character.experience': newExperience,
        'character.level': newLevel,
      });
    } catch (e) {
      throw new Error('Kunde inte uppdatera erfarenheten.');
    }
  };

  // Returnerar data och funktioner som komponenter behöver
  return { character, loading, error, createCharacter, updateAppearance, addExperience };
};

export default useCharacter;
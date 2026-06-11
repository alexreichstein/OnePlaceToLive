// hooks/useWorld.ts
// Hook för att hantera världsobjekt mot Firebase
// Läser worldItems direkt från Firestore så de finns kvar efter omstart
// Världsobjekt är permanenta — när de skapats finns de alltid kvar

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { WorldItemType } from '../types';

// Sökvägen till spelardokumentet i Firestore
const getPlayerRef = (userId: string) => doc(db, 'players', userId);

const useWorld = (userId: string) => {
  // Världsobjekt — laddas från Firebase vid start
  const [worldItems, setWorldItems] = useState<WorldItemType[]>([]);

  // Indikerar om första laddningen från Firestore pågår
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Prenumererar på realtidsuppdateringar för spelardokumentet
    // worldItems uppdateras automatiskt när nya objekt läggs till
    const unsubscribe = onSnapshot(
      getPlayerRef(userId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Läser worldItems från Firebase — aldrig från lokalt state
          setWorldItems((data.worldItems as WorldItemType[]) ?? []);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firebase-fel worldItems:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Lägger till ett världsobjekt i Firestore
  // Läser från Firestore direkt för att undvika stale state
  const addWorldItem = async (item: WorldItemType): Promise<void> => {
    try {
      // Hämtar färsk data direkt från Firestore
      const snapshot = await getDoc(getPlayerRef(userId));
      if (!snapshot.exists()) return;

      const freshItems = (snapshot.data().worldItems as WorldItemType[]) ?? [];

      // Lägger bara till om objektet inte redan finns
      if (freshItems.includes(item)) return;

      await updateDoc(getPlayerRef(userId), {
        worldItems: [...freshItems, item],
      });
    } catch (e) {
      throw new Error('Kunde inte lägga till världsobjekt.');
    }
  };

  return { worldItems, loading, addWorldItem };
};

export default useWorld;
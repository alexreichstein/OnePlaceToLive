// hooks/useResources.ts
// Hook för att hantera spelarens resurser mot Firebase
// Hämtar, lägger till och drar av resurser från inventariet
// Inventariet sparas som ett objekt i spelardokumentet
// Fix: läser från Firestore direkt vid uppdatering för att undvika stale state

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Inventory, ResourceType } from '../types';

// Sökvägen till spelardokumentet i Firestore
const getPlayerRef = (userId: string) => doc(db, 'players', userId);

const useResources = (userId: string) => {
  // Inventariet — alla resurser spelaren äger
  const [inventory, setInventory] = useState<Inventory>({});

  // Indikerar om första laddningen från Firestore pågår
  const [loading, setLoading] = useState(true);

  // Felmeddelande om Firebase är nere — null om allt fungerar
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Prenumererar på realtidsuppdateringar för spelardokumentet
    const unsubscribe = onSnapshot(
      getPlayerRef(userId),
      (snapshot) => {
        setError(null);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setInventory((data.inventory as Inventory) ?? {});
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

  // Lägger till resurser i inventariet
  // Läser ALLTID från Firestore direkt för att undvika stale state-buggen
  // där gamla inventarievärden skriver över nya
  const addResources = async (rewards: Partial<Record<ResourceType, number>>): Promise<void> => {
    try {
      // Hämtar färsk data direkt från Firestore istället för från React state
      const snapshot = await getDoc(getPlayerRef(userId));
      if (!snapshot.exists()) return;

      const freshInventory = (snapshot.data().inventory as Inventory) ?? {};

      // Beräknar det nya inventariet med tillagda resurser ovanpå färsk data
      const updatedInventory = { ...freshInventory };
      for (const [resource, amount] of Object.entries(rewards)) {
        const key = resource as ResourceType;
        updatedInventory[key] = (updatedInventory[key] ?? 0) + (amount ?? 0);
      }

      await updateDoc(getPlayerRef(userId), {
        inventory: updatedInventory,
      });
    } catch (e) {
      throw new Error('Kunde inte uppdatera inventariet.');
    }
  };

  // Drar av resurser från inventariet
  // Läser också från Firestore direkt för konsekvens
  const consumeResources = async (costs: Partial<Record<ResourceType, number>>): Promise<void> => {
    try {
      // Hämtar färsk data direkt från Firestore
      const snapshot = await getDoc(getPlayerRef(userId));
      if (!snapshot.exists()) return;

      const freshInventory = (snapshot.data().inventory as Inventory) ?? {};

      // Kontrollerar att spelaren har tillräckligt med resurser
      for (const [resource, amount] of Object.entries(costs)) {
        const key = resource as ResourceType;
        const current = freshInventory[key] ?? 0;
        if (current < (amount ?? 0)) {
          throw new Error(`Inte tillräckligt med ${resource}`);
        }
      }

      // Beräknar det nya inventariet med avdragna resurser
      const updatedInventory = { ...freshInventory };
      for (const [resource, amount] of Object.entries(costs)) {
        const key = resource as ResourceType;
        updatedInventory[key] = (updatedInventory[key] ?? 0) - (amount ?? 0);
      }

      await updateDoc(getPlayerRef(userId), {
        inventory: updatedInventory,
      });
    } catch (e) {
      throw new Error('Kunde inte förbruka resurser.');
    }
  };

  // Returnerar mängden av en specifik resurs
  const getResourceAmount = (resource: ResourceType): number => {
    return inventory[resource] ?? 0;
  };

  return { inventory, loading, error, addResources, consumeResources, getResourceAmount };
};

export default useResources;
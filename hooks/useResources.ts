// hooks/useResources.ts
// Hook för att hantera spelarens resurser mot Firebase
// Hämtar, lägger till och drar av resurser från inventariet
// Inventariet sparas som ett objekt i spelardokumentet

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Inventory, ResourceType } from '../types';

// Sökvägen till spelardokumentet i Firestore
const getPlayerRef = (userId: string) => doc(db, 'players', userId);

// Hook som exponerar inventariedata och funktioner till UI-komponenter
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
          // Hämtar inventariet från spelardokumentet
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

    // Avslutar prenumerationen när userId ändras eller komponenten unmountas
    return () => unsubscribe();
  }, [userId]);

  // Lägger till resurser i inventariet
  // Används när en task är klar och belöningar ska delas ut
  const addResources = async (rewards: Partial<Record<ResourceType, number>>): Promise<void> => {
    try {
      // Beräknar det nya inventariet med tillagda resurser
      const updatedInventory = { ...inventory };
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
  // Används när en task startas och resurser ska förbrukas
  const consumeResources = async (costs: Partial<Record<ResourceType, number>>): Promise<void> => {
    try {
      // Kontrollerar att spelaren har tillräckligt med resurser
      for (const [resource, amount] of Object.entries(costs)) {
        const key = resource as ResourceType;
        const current = inventory[key] ?? 0;
        if (current < (amount ?? 0)) {
          throw new Error(`Inte tillräckligt med ${resource}`);
        }
      }

      // Beräknar det nya inventariet med avdragna resurser
      const updatedInventory = { ...inventory };
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
  // Hjälpfunktion för att enkelt kolla en enskild resurs
  const getResourceAmount = (resource: ResourceType): number => {
    return inventory[resource] ?? 0;
  };

  // Returnerar data och funktioner som komponenter behöver
  return { inventory, loading, error, addResources, consumeResources, getResourceAmount };
};

export default useResources;
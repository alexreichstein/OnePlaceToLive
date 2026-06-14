// hooks/useVitals.ts
// Hook för att hantera vitals-förfall (decay) över tid
// Hunger minskar med ~0.595% per timme → når 0% på ~7 dagar utan mat
// Törst minskar med ~1.389% per timme → når 0% på ~3 dagar utan vatten
// När hunger eller törst når 0 börjar HP minska i samma takt
// Läser lastVitalsUpdate från Firestore för att hantera tid offline

import { useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Character, VitalStats } from '../types';

// Hunger: 100% förbrukas på 168 timmar (7 dagar x 24h)
const HUNGER_DECAY_PER_HOUR = 100 / (7 * 24); // ca 0.5952 %/h

// Törst: 100% förbrukas på 72 timmar (3 dagar x 24h)
const THIRST_DECAY_PER_HOUR = 100 / (3 * 24); // ca 1.3889 %/h

// Hur ofta hooken skriver till Firestore — var 5:e minut
const TICK_INTERVAL_MS = 5 * 60 * 1000;

// Räknar ut nya vitals baserat på förfluten tid i timmar
// Om hunger eller törst är 0 börjar HP minska i samma takt
const calculateDecay = (currentVitals: VitalStats, elapsedHours: number): VitalStats => {
  const hungerLoss = HUNGER_DECAY_PER_HOUR * elapsedHours;
  const thirstLoss = THIRST_DECAY_PER_HOUR * elapsedHours;

  const newHunger = Math.max(0, currentVitals.hunger - hungerLoss);
  const newThirst = Math.max(0, currentVitals.thirst - thirstLoss);

  let healthLoss = 0;

  // Beräkna HP-tap för de timmar hunger legat på 0
  if (currentVitals.hunger < hungerLoss) {
    const hoursAtZeroHunger = (hungerLoss - currentVitals.hunger) / HUNGER_DECAY_PER_HOUR;
    healthLoss += HUNGER_DECAY_PER_HOUR * hoursAtZeroHunger;
  }

  // Beräkna HP-tap för de timmar törst legat på 0
  if (currentVitals.thirst < thirstLoss) {
    const hoursAtZeroThirst = (thirstLoss - currentVitals.thirst) / THIRST_DECAY_PER_HOUR;
    healthLoss += THIRST_DECAY_PER_HOUR * hoursAtZeroThirst;
  }

  return {
    health: Math.max(0, currentVitals.health - healthLoss),
    hunger: newHunger,
    thirst: newThirst,
  };
};

const useVitals = (userId: string, character: Character | null): void => {
  // Ref för att hålla koll på intervallet så det kan rensas vid unmount
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ref för att förhindra att flera skrivningar sker samtidigt
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!userId || !character) return;

    const tick = async () => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        // Hämta färsk data från Firestore för att undvika stale state
        const playerRef = doc(db, 'players', userId);
        const snapshot = await getDoc(playerRef);
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        if (!data?.character) return;

        const freshCharacter: Character = data.character;

        const currentVitals: VitalStats = freshCharacter.vitals ?? {
          health: 100,
          hunger: 100,
          thirst: 100,
        };
        const lastUpdate: number = freshCharacter.lastVitalsUpdate ?? Date.now();

        // Räkna ut förfluten tid sedan senaste uppdatering
        const nowMs = Date.now();
        const elapsedMs = nowMs - lastUpdate;
        const elapsedHours = elapsedMs / (1000 * 60 * 60);

        // Hoppa över om mindre än 1 minut gått
        if (elapsedMs < 60 * 1000) return;

        // Beräkna och skriv nya vitals till Firestore
        const newVitals = calculateDecay(currentVitals, elapsedHours);
        await updateDoc(playerRef, {
          'character.vitals': newVitals,
          'character.lastVitalsUpdate': nowMs,
        });
      } catch (e) {
        console.error('[useVitals] Fel vid uppdatering av vitals:', e);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    // Kör direkt vid mount för att hantera tid offline
    tick();

    // Kör sedan var 5:e minut
    intervalRef.current = setInterval(tick, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, character]);
};

export default useVitals;
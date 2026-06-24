// hooks/useCombat.ts
// Hook för att hantera en pågående strid mot en fiende
// Realtids-combat med separata attack-timers för spelare och fiende
// Skada beräknas från utrustat vapen/armor — se WEAPON_STATS/ARMOR_STATS

import { useState, useEffect, useRef } from 'react';
import { Equipment, EnemyType, CombatLogEntry } from '../types';
import { ENEMY_DEFINITIONS, WEAPON_STATS, ARMOR_STATS } from '../constants';

// Hur ofta combat-looopen kontrollerar om någon ska attackera (ms)
const TICK_INTERVAL_MS = 100;

// Standardvärden om spelaren saknar utrustning — obeväpnad slåss svagt
const UNARMED_DAMAGE = 3;
const UNARMED_ATTACK_INTERVAL_MS = 2500;

type CombatResult = 'ongoing' | 'victory' | 'defeat';

const useCombat = (
  enemyType: EnemyType,
  playerEquipment: Equipment,
  playerMaxHealth: number,
  onVictory: () => void,
  onDefeat: () => void
) => {
  const enemyDef = ENEMY_DEFINITIONS[enemyType];

  // Spelarens och fiendens nuvarande HP under striden
  const [playerHealth, setPlayerHealth] = useState(playerMaxHealth);
  const [enemyHealth, setEnemyHealth] = useState(enemyDef.maxHealth);

  // Combat-log — visar varje händelse i striden
  const [log, setLog] = useState<CombatLogEntry[]>([]);

  // Resultat av striden — null under pågående strid
  const [result, setResult] = useState<CombatResult>('ongoing');

  // Räknare för unika log-ID:n
  const logCounterRef = useRef(0);

  // Tid kvar till nästa attack för spelare och fiende (i ms)
  const playerCooldownRef = useRef(0);
  const enemyCooldownRef = useRef(0);

  // Beräknar spelarens skada baserat på utrustat vapen
  const getPlayerDamage = (): number => {
    if (!playerEquipment.weaponSlot) return UNARMED_DAMAGE;
    const weapon = WEAPON_STATS[playerEquipment.weaponSlot];
    return weapon?.damage ?? UNARMED_DAMAGE;
  };

  // Beräknar spelarens attackintervall baserat på utrustat vapen
  const getPlayerAttackInterval = (): number => {
    if (!playerEquipment.weaponSlot) return UNARMED_ATTACK_INTERVAL_MS;
    const weapon = WEAPON_STATS[playerEquipment.weaponSlot];
    return weapon?.attackIntervalMs ?? UNARMED_ATTACK_INTERVAL_MS;
  };

  // Beräknar spelarens defense baserat på utrustad armor
  const getPlayerDefense = (): number => {
    if (!playerEquipment.armorSlot) return 0;
    const armor = ARMOR_STATS[playerEquipment.armorSlot];
    return armor?.defense ?? 0;
  };

  // Lägger till en rad i combat-loggen
  const addLog = (text: string, type: CombatLogEntry['type']) => {
    const entry: CombatLogEntry = {
      id: logCounterRef.current++,
      text,
      type,
    };
    setLog((prev) => [...prev, entry]);
  };

  // Initierar cooldowns vid start av striden
  useEffect(() => {
    playerCooldownRef.current = getPlayerAttackInterval();
    enemyCooldownRef.current = enemyDef.attackIntervalMs;
    addLog(`A wild ${enemyDef.name} appears!`, 'info');
  }, []);

  // Huvudloopen — kör var TICK_INTERVAL_MS och kollar om någon ska attackera
  useEffect(() => {
    if (result !== 'ongoing') return;

    const interval = setInterval(() => {
      // Räkna ner cooldowns
      playerCooldownRef.current -= TICK_INTERVAL_MS;
      enemyCooldownRef.current -= TICK_INTERVAL_MS;

      // Spelarens attack
      if (playerCooldownRef.current <= 0) {
        const damage = getPlayerDamage();
        setEnemyHealth((prev) => {
          const newHealth = Math.max(0, prev - damage);
          addLog(`You hit the ${enemyDef.name} for ${damage} damage.`, 'player_attack');

          if (newHealth <= 0) {
            setResult('victory');
            addLog(`You defeated the ${enemyDef.name}!`, 'victory');
          }

          return newHealth;
        });
        playerCooldownRef.current = getPlayerAttackInterval();
      }

      // Fiendens attack — bara om fienden fortfarande lever
      if (enemyCooldownRef.current <= 0 && enemyHealth > 0) {
        const rawDamage = enemyDef.damage;
        const defense = getPlayerDefense();
        const actualDamage = Math.max(1, rawDamage - defense); // Minst 1 skada går alltid igenom

        setPlayerHealth((prev) => {
          const newHealth = Math.max(0, prev - actualDamage);
          addLog(`The ${enemyDef.name} hits you for ${actualDamage} damage.`, 'enemy_attack');

          if (newHealth <= 0) {
            setResult('defeat');
            addLog(`You were defeated by the ${enemyDef.name}...`, 'defeat');
          }

          return newHealth;
        });
        enemyCooldownRef.current = enemyDef.attackIntervalMs;
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [result, enemyHealth]);

  // Triggar onVictory/onDefeat callbacks när resultatet ändras
  useEffect(() => {
    if (result === 'victory') {
      onVictory();
    } else if (result === 'defeat') {
      onDefeat();
    }
  }, [result]);

  return {
    playerHealth,
    playerMaxHealth,
    enemyHealth,
    enemyMaxHealth: enemyDef.maxHealth,
    enemyDef,
    log,
    result,
  };
};

export default useCombat;

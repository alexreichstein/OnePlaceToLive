// screens/CombatScreen.tsx
// Strid mot en fiende i realtid — ersätter ExploreScreen
// Navigeras till från WorldScreen via South-skylten
// Visar HP-barer, combat-log, och seger/förlust-resultat

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useCharacter from '../hooks/useCharacter';
import useResources from '../hooks/useResources';
import useCombat from '../hooks/useCombat';
import { WorldStackParamList } from '../navigation';
import { RESOURCE_NAMES, RESOURCE_EMOJIS } from '../constants';

type NavigationProp = StackNavigationProp<WorldStackParamList, 'Combat'>;

const USER_ID = 'player_alex';

const CombatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { character, addExperience, updateVitals } = useCharacter(USER_ID);
  const { addResources } = useResources(USER_ID);

  // Förhindrar att loot/skada appliceras flera gånger för samma strid
  const [rewardsApplied, setRewardsApplied] = useState(false);

  // Callbacks för seger/förlust — körs en gång när combat-resultatet sätts
  const handleVictory = () => {
    // Hanteras i useEffect nedan för att undvika setState under render
  };
  const handleDefeat = () => {
    // Hanteras i useEffect nedan
  };

  // useCombat måste anropas ovillkorligt (Rules of Hooks)
  // Använder fallback-värden tills character har laddats
  const fallbackEquipment = { weaponSlot: null, armorSlot: null };
  const combat = useCombat(
    'wolf',
    character?.equipment ?? fallbackEquipment,
    character?.vitals.health ?? 100,
    handleVictory,
    handleDefeat
  );

  // Applicerar belöningar/skada en gång när striden avslutas
  useEffect(() => {
    if (!character || rewardsApplied) return;

    if (combat.result === 'victory') {
      setRewardsApplied(true);
      addResources(combat.enemyDef.lootRewards);
      addExperience(combat.enemyDef.experienceReward);
      const healthLost = character.vitals.health - combat.playerHealth;
      if (healthLost > 0) updateVitals({ health: -healthLost });
    } else if (combat.result === 'defeat') {
      setRewardsApplied(true);
      const healthLost = character.vitals.health - 1;
      if (healthLost > 0) updateVitals({ health: -healthLost });
    }
  }, [combat.result]);

  if (!character) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Loading...</Text>
      </View>
    );
  }

  const playerHpPercent = (combat.playerHealth / combat.playerMaxHealth) * 100;
  const enemyHpPercent = (combat.enemyHealth / combat.enemyMaxHealth) * 100;

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚔️ Combat</Text>
      </View>

      {/* Stridsarena — fiende och spelare */}
      <View style={styles.arena}>

        {/* Fiende */}
        <View style={styles.combatant}>
          <Text style={styles.enemyEmoji}>{combat.enemyDef.emoji}</Text>
          <Text style={styles.combatantName}>{combat.enemyDef.name}</Text>
          <View style={styles.hpBarBg}>
            <View style={[styles.hpBarFill, styles.enemyHpFill, { width: `${enemyHpPercent}%` as any }]} />
          </View>
          <Text style={styles.hpText}>{Math.ceil(combat.enemyHealth)} / {combat.enemyMaxHealth}</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        {/* Spelare */}
        <View style={styles.combatant}>
          <Text style={styles.playerEmoji}>🧑</Text>
          <Text style={styles.combatantName}>{character.name}</Text>
          <View style={styles.hpBarBg}>
            <View style={[styles.hpBarFill, styles.playerHpFill, { width: `${playerHpPercent}%` as any }]} />
          </View>
          <Text style={styles.hpText}>{Math.ceil(combat.playerHealth)} / {combat.playerMaxHealth}</Text>
        </View>

      </View>

      {/* Combat-log */}
      <ScrollView style={styles.logContainer} contentContainerStyle={styles.logContent}>
        {combat.log.map((entry) => (
          <Text
            key={entry.id}
            style={[
              styles.logEntry,
              entry.type === 'player_attack' && styles.logPlayerAttack,
              entry.type === 'enemy_attack' && styles.logEnemyAttack,
              entry.type === 'victory' && styles.logVictory,
              entry.type === 'defeat' && styles.logDefeat,
              entry.type === 'info' && styles.logInfo,
            ]}
          >
            {entry.text}
          </Text>
        ))}
      </ScrollView>

      {/* Resultat-overlay */}
      {combat.result !== 'ongoing' && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {combat.result === 'victory' ? '🎉 Victory!' : '💀 Defeated...'}
            </Text>

            {combat.result === 'victory' && (
              <View style={styles.lootContainer}>
                <Text style={styles.lootLabel}>Loot:</Text>
                <View style={styles.lootRow}>
                  {Object.entries(combat.enemyDef.lootRewards).map(([res, amt]) => (
                    <Text key={res} style={styles.lootItem}>
                      {RESOURCE_EMOJIS[res] ?? ''} +{amt} {RESOURCE_NAMES[res] ?? res}
                    </Text>
                  ))}
                  <Text style={styles.lootItem}>⭐ +{combat.enemyDef.experienceReward} XP</Text>
                </View>
              </View>
            )}

            {combat.result === 'defeat' && (
              <Text style={styles.defeatText}>
                You limp back to camp, badly wounded.
              </Text>
            )}

            <TouchableOpacity
              style={styles.backToCampBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToCampBtnText}>← Back to Camp</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  centerText: { color: '#aaa', fontSize: 16 },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },

  // Stridsarena
  arena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  combatant: { alignItems: 'center', flex: 1 },
  enemyEmoji: { fontSize: 56, marginBottom: 4 },
  playerEmoji: { fontSize: 56, marginBottom: 4 },
  combatantName: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  vsText: { color: '#666', fontWeight: '700', fontSize: 16 },

  hpBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  hpBarFill: { height: '100%', borderRadius: 5 },
  enemyHpFill: { backgroundColor: '#e53935' },
  playerHpFill: { backgroundColor: '#4CAF50' },
  hpText: { color: '#999', fontSize: 12, marginTop: 4 },

  // Combat-log
  logContainer: {
    flex: 1,
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  logContent: { padding: 12, gap: 4 },
  logEntry: { fontSize: 13, color: '#aaa' },
  logPlayerAttack: { color: '#81C784' },
  logEnemyAttack: { color: '#EF9A9A' },
  logVictory: { color: '#FFD700', fontWeight: '700' },
  logDefeat: { color: '#e53935', fontWeight: '700' },
  logInfo: { color: '#888', fontStyle: 'italic' },

  // Resultat-overlay
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  resultTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 16 },

  lootContainer: { alignItems: 'center', marginBottom: 20 },
  lootLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  lootRow: { alignItems: 'center', gap: 4 },
  lootItem: { color: '#4A7C59', fontWeight: '700', fontSize: 14 },

  defeatText: { color: '#999', fontSize: 14, textAlign: 'center', marginBottom: 20 },

  backToCampBtn: {
    backgroundColor: '#4A7C59',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToCampBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default CombatScreen;

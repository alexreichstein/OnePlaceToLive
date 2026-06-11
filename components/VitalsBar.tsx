// components/VitalsBar.tsx
// Komponent som visar hälsa, hunger, törst och klocka
// Placeras överst i WorldScreen
// Staplarnas bredd och färg uppdateras dynamiskt baserat på vitals-värden

import { View, Text, StyleSheet } from 'react-native';
import { VitalStats } from '../types';
import { TimeOfDay } from '../hooks/useDayNight';

type Props = {
  vitals: VitalStats;        // Hälsa, hunger och törst — värden 0-100
  currentTime: string;       // Aktuell tid — t.ex. "14:32"
  timeOfDay: TimeOfDay;      // Aktuell tidsfas — styr vilken emoji som visas
};

// Returnerar rätt emoji för tidsfasen
const getTimeEmoji = (timeOfDay: TimeOfDay): string => {
  switch (timeOfDay) {
    case 'dawn':    return '🌅';
    case 'morning': return '🌤️';
    case 'day':     return '☀️';
    case 'evening': return '🌇';
    case 'sunset':  return '🌆';
    case 'night':   return '🌙';
    default:        return '🌙';
  }
};

export default function VitalsBar({ vitals, currentTime, timeOfDay }: Props) {
  return (
    <View style={styles.container}>

      {/* Hälsa — röd stapel */}
      <View style={styles.vitalItem}>
        <Text style={styles.vitalLabel}>❤️ Hälsa</Text>
        <View style={styles.vitalBar}>
          <View style={[
            styles.vitalFill,
            {
              width: `${vitals.health}%` as any,
              backgroundColor: getHealthColor(vitals.health),
            },
          ]} />
        </View>
        <Text style={styles.vitalValue}>{Math.round(vitals.health)}</Text>
      </View>

      {/* Hunger — orange stapel */}
      <View style={styles.vitalItem}>
        <Text style={styles.vitalLabel}>🍖 Hunger</Text>
        <View style={styles.vitalBar}>
          <View style={[
            styles.vitalFill,
            {
              width: `${vitals.hunger}%` as any,
              backgroundColor: getHungerColor(vitals.hunger),
            },
          ]} />
        </View>
        <Text style={styles.vitalValue}>{Math.round(vitals.hunger)}</Text>
      </View>

      {/* Törst — blå stapel */}
      <View style={styles.vitalItem}>
        <Text style={styles.vitalLabel}>💧 Törst</Text>
        <View style={styles.vitalBar}>
          <View style={[
            styles.vitalFill,
            {
              width: `${vitals.thirst}%` as any,
              backgroundColor: getThirstColor(vitals.thirst),
            },
          ]} />
        </View>
        <Text style={styles.vitalValue}>{Math.round(vitals.thirst)}</Text>
      </View>

      {/* Klocka och tidsfas-emoji */}
      <View style={styles.clockContainer}>
        <Text style={styles.clockText}>{currentTime}</Text>
        <Text style={styles.timeEmoji}>{getTimeEmoji(timeOfDay)}</Text>
      </View>

    </View>
  );
}

// Hälsofärg — grön när full, gul vid varning, röd vid kritisk
const getHealthColor = (value: number): string => {
  if (value > 60) return '#4CAF50';
  if (value > 30) return '#FFC107';
  return '#e53935';
};

// Hungerfärg — grön när mätt, gul vid hungry, röd vid svältande
const getHungerColor = (value: number): string => {
  if (value > 60) return '#F57C00';
  if (value > 30) return '#FFC107';
  return '#e53935';
};

// Törst färg — blå när otörstig, gul vid törstig, röd vid kritisk
const getThirstColor = (value: number): string => {
  if (value > 60) return '#1976D2';
  if (value > 30) return '#FFC107';
  return '#e53935';
};

const styles = StyleSheet.create({
  // Huvudbehållare — mörk bakgrund
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    alignItems: 'center',
  },

  // Enskild vital — etikett, stapel och värde
  vitalItem: {
    flex: 1,
    gap: 2,
  },

  // Etikett ovanför stapeln
  vitalLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },

  // Stapelns bakgrund
  vitalBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },

  // Stapelns fyllning — bredd och färg sätts dynamiskt
  vitalFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Värdet som siffra till höger om stapeln
  vitalValue: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },

  // Klocka och emoji till höger
  clockContainer: {
    alignItems: 'center',
    paddingLeft: 4,
  },
  clockText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  timeEmoji: {
    fontSize: 14,
  },
});
// components/ActiveTaskBar.tsx
// Komponent som visar pågående task med nedräkningstimer och finish-knapp
// Visas i WorldScreen när en task är aktiv
// Finish-knappen är endast för testning och ska tas bort i produktion

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActiveTask } from '../types';
import { TASK_DEFINITIONS } from '../constants';
import { formatTimeRemaining } from '../gameData/tasks';

type Props = {
  activeTask: ActiveTask;        // Den aktiva tasken
  secondsRemaining: number;      // Sekunder kvar av tasken
  onFinishNow: () => void;       // Callback för finish-knappen (testning)
};

export default function ActiveTaskBar({
  activeTask,
  secondsRemaining,
  onFinishNow,
}: Props) {
  // Hämtar task-definitionen för att visa namn
  const task = TASK_DEFINITIONS[activeTask.taskId];
  const taskName = task?.name ?? activeTask.taskId;

  // Beräknar hur stor andel av tasken som är klar — används för progress-stapel
  const totalDuration = (activeTask.endTime - activeTask.startTime) / 1000;
  const elapsed = totalDuration - secondsRemaining;
  const progressPercent = Math.min(100, Math.floor((elapsed / totalDuration) * 100));

  return (
    <View style={styles.container}>

      {/* Övre rad — task-namn och finish-knapp */}
      <View style={styles.topRow}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskLabel}>Pågående task:</Text>
          <Text style={styles.taskName}>{taskName}</Text>
        </View>

        {/* Finish-knapp — gul för att synas tydligt under testning */}
        <TouchableOpacity style={styles.finishBtn} onPress={onFinishNow}>
          <Text style={styles.finishBtnText}>⚡ Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Progress-stapel — visar hur långt tasken har kommit */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]} />
      </View>

      {/* Nedräkningstimer */}
      <Text style={styles.timer}>
        ⏱ {formatTimeRemaining(secondsRemaining)}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  // Huvudbehållare — mörk bakgrund med grön kant
  container: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A7C59',
  },

  // Övre rad med task-info och finish-knapp
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  // Task-info — etikett och namn
  taskInfo: {
    flex: 1,
  },
  taskLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 2,
  },
  taskName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Finish-knapp för testning
  finishBtn: {
    backgroundColor: '#D4A843',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  finishBtnText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 13,
  },

  // Progress-stapelns bakgrund
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },

  // Progress-stapelns fyllning — bredd sätts dynamiskt
  progressFill: {
    height: '100%',
    backgroundColor: '#4A7C59',
    borderRadius: 3,
  },

  // Nedräkningstimer
  timer: {
    color: '#4A7C59',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
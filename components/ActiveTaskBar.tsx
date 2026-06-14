// components/ActiveTaskBar.tsx
// Komponent som visar pågående task med nedräkningstimer och finish-knapp
// Visas i WorldScreen när en task är aktiv
// Finish-knappen är endast för testning och ska tas bort i produktion

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActiveTask } from '../types';
import { TASK_DEFINITIONS } from '../constants';
import { formatTimeRemaining } from '../gameData/tasks';

type Props = {
  activeTask: ActiveTask;
  secondsRemaining: number;
  onFinishNow: () => void;
};

export default function ActiveTaskBar({ activeTask, secondsRemaining, onFinishNow }: Props) {
  // Hämtar task-definitionen för att visa namn
  const task = TASK_DEFINITIONS[activeTask.taskId];
  const taskName = task?.name ?? activeTask.taskId;

  // Beräknar hur stor andel av tasken som är klar — används för progress-stapel
  const totalDuration = (activeTask.endTime - activeTask.startTime) / 1000;
  const elapsed = totalDuration - secondsRemaining;
  const progressPercent = Math.min(100, Math.floor((elapsed / totalDuration) * 100));

  return (
    <View style={styles.container}>

      {/* Top row — task name and finish button */}
      <View style={styles.topRow}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskLabel}>Active task:</Text>
          <Text style={styles.taskName}>{taskName}</Text>
        </View>

        {/* Finish button — only for testing */}
        <TouchableOpacity style={styles.finishBtn} onPress={onFinishNow}>
          <Text style={styles.finishBtnText}>⚡ Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]} />
      </View>

      {/* Countdown timer */}
      <Text style={styles.timer}>
        ⏱ {formatTimeRemaining(secondsRemaining)}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A7C59',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
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
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A7C59',
    borderRadius: 3,
  },
  timer: {
    color: '#4A7C59',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});

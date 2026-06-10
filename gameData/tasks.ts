// gameData/tasks.ts
// Exporterar hjälpfunktioner för task-logik
// Används av useTasks-hooken och TaskCard-komponenten

import { TaskDefinition, TaskType, Inventory, WorldItemType } from '../types';
import { TASK_DEFINITIONS } from '../constants';

// Returnerar en task-definition baserat på task-typ
// Används för att hämta information om en specifik task
export const getTaskDefinition = (taskId: TaskType): TaskDefinition => {
  return TASK_DEFINITIONS[taskId];
};

// Returnerar alla tasks som spelaren kan utföra baserat på nivå
// Filtrerar bort tasks som kräver högre nivå än spelaren har
export const getAvailableTasks = (level: number): TaskDefinition[] => {
  return Object.values(TASK_DEFINITIONS).filter(
    (task) => task.levelRequired <= level
  );
};

// Kontrollerar om spelaren har tillräckligt med resurser för en task
// Returnerar true om alla krav är uppfyllda
export const canAffordTask = (
  task: TaskDefinition,
  inventory: Inventory
): boolean => {
  for (const [resource, amount] of Object.entries(task.requires)) {
    const playerAmount = inventory[resource as keyof Inventory] ?? 0;
    if (playerAmount < (amount ?? 0)) return false;
  }
  return true;
};

// Kontrollerar om spelaren har det världsobjekt som tasken kräver
// Returnerar true om kravet är uppfyllt eller om tasken inte har något krav
export const hasRequiredWorldItem = (
  task: TaskDefinition,
  worldItems: WorldItemType[]
): boolean => {
  if (!task.requiresWorldItem) return true;
  return worldItems.includes(task.requiresWorldItem);
};

// Kontrollerar om spelaren redan har skapat det världsobjekt som tasken skapar
// Förhindrar att man skapar samma sak två gånger
export const alreadyCreatedWorldItem = (
  task: TaskDefinition,
  worldItems: WorldItemType[]
): boolean => {
  if (!task.createsWorldItem) return false;
  return worldItems.includes(task.createsWorldItem);
};

// Kontrollerar om en task är tillgänglig och kan startas
// Samlar alla krav och returnerar true om allt är uppfyllt
export const isTaskAvailable = (
  task: TaskDefinition,
  level: number,
  inventory: Inventory,
  worldItems: WorldItemType[]
): boolean => {
  if (task.levelRequired > level) return false;
  if (!canAffordTask(task, inventory)) return false;
  if (!hasRequiredWorldItem(task, worldItems)) return false;
  if (alreadyCreatedWorldItem(task, worldItems)) return false;
  return true;
};

// Beräknar hur många sekunder som är kvar av en aktiv task
// Returnerar 0 om tasken är klar
export const getRemainingSeconds = (endTime: number): number => {
  const remaining = Math.floor((endTime - Date.now()) / 1000);
  return Math.max(0, remaining);
};

// Formaterar sekunder till läsbar tid — t.ex. "4m 32s" eller "1h 20m"
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return 'Klar!';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Beräknar hur mycket erfarenhet som behövs till nästa nivå
// Används i UI för att visa framsteg
export const getProgressToNextLevel = (
  experience: number,
  currentLevel: number,
  levelThresholds: number[]
): { current: number; required: number; percentage: number } => {
  const currentThreshold = levelThresholds[currentLevel - 1] ?? 0;
  const nextThreshold = levelThresholds[currentLevel] ?? currentThreshold + 1000;
  const current = experience - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percentage = Math.min(100, Math.floor((current / required) * 100));
  return { current, required, percentage };
};
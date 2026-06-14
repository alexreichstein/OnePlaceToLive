// types.ts
// Definierar datastrukturerna för One Place To Live
// Karaktär, resurser, tasks och världsobjekt

// ─── Karaktär ────────────────────────────────────────────────────────────────

export type SkinTone = 'light' | 'medium' | 'dark';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'grey' | 'white';
export type OutfitColor = 'green' | 'brown' | 'blue' | 'grey' | 'red';

export type CharacterAppearance = {
  skinTone: SkinTone;
  hairColor: HairColor;
  outfitColor: OutfitColor;
};

export type VitalStats = {
  health: number;
  hunger: number;
  thirst: number;
};

export type Character = {
  id: string;
  name: string;
  appearance: CharacterAppearance;
  level: number;
  experience: number;
  vitals: VitalStats;
  lastVitalsUpdate: number;
  createdAt: number;
};

// ─── Resurser ─────────────────────────────────────────────────────────────────

export type ResourceType =
  | 'sticks'
  | 'stones'
  | 'flint'
  | 'bark'
  | 'rope'
  | 'berries'
  | 'mushrooms'
  | 'water'
  | 'meat'
  | 'wood';

export type Resource = {
  type: ResourceType;
  amount: number;
};

export type Inventory = Partial<Record<ResourceType, number>>;

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskType =
  | 'gather_sticks'
  | 'gather_stones'
  | 'gather_flint'
  | 'gather_bark'
  | 'gather_berries'
  | 'gather_mushrooms'
  | 'make_rope'
  | 'make_fire'
  | 'make_spear'
  | 'build_shelter'
  | 'build_camp'
  | 'build_well'
  | 'hunt'
  | 'fetch_water_stream'
  | 'fetch_water_well'
  | 'drink_water'
  | 'eat_berries'
  | 'eat_mushrooms'
  | 'eat_meat';

export type TaskDefinition = {
  id: TaskType;
  name: string;
  description: string;
  durationMinutes: number;
  requires: Partial<Record<ResourceType, number>>;
  rewards: Partial<Record<ResourceType, number>>;
  requiresWorldItem?: WorldItemType;
  createsWorldItem?: WorldItemType;
  experienceReward: number;
  levelRequired: number;
  restoresVitals?: Partial<VitalStats>;
  // Vilket worlditem tasken är kopplad till — visas i worlditem-popup istället för task-listan
  interactsWith?: WorldItemType;
};

export type ActiveTask = {
  taskId: TaskType;
  startTime: number;
  endTime: number;
};

// ─── Världsobjekt ─────────────────────────────────────────────────────────────

export type WorldItemType =
  | 'campfire'
  | 'shelter'
  | 'camp'
  | 'spear'
  | 'well';

export type WorldItem = {
  type: WorldItemType;
  createdAt: number;
};

// ─── Spelstate ────────────────────────────────────────────────────────────────

export type PlayerState = {
  character: Character;
  inventory: Inventory;
  activeTask: ActiveTask | null;
  worldItems: WorldItemType[];
};

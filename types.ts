// types.ts
// Definierar datastrukturerna för One Place To Live
// Karaktär, resurser, tasks, världsobjekt, equipment och combat

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

// ─── Equipment ────────────────────────────────────────────────────────────────

// Vapentyper som kan utrustas i weaponSlot
export type WeaponType = 'spear';

// Armortyper som kan utrustas i armorSlot
export type ArmorType = 'hide_armor';

// Statistik för ett vapen — påverkar skada och attackhastighet i combat
export type WeaponStats = {
  id: WeaponType;
  name: string;
  damage: number;            // Skada per attack
  attackIntervalMs: number;  // Millisekunder mellan varje attack
};

// Statistik för en armor — minskar inkommande skada
export type ArmorStats = {
  id: ArmorType;
  name: string;
  defense: number;           // Skada som dras av från inkommande attacker
};

// Karaktärens utrustning — vapen och armor i separata slots
// Båda är optional eftersom karaktären kan vara obeväpnad/obeskyddad
export type Equipment = {
  weaponSlot: WeaponType | null;
  armorSlot: ArmorType | null;
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
  equipment: Equipment;       // Utrustat vapen och armor
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
  | 'wood'
  | 'hide';   // Djurhud — droppas från varg, används till armor

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
  | 'make_armor'
  | 'build_shelter'
  | 'build_camp'
  | 'build_well'
  | 'hunt'
  | 'fetch_water_stream'
  | 'fetch_water_well'
  | 'drink_water'
  | 'eat_berries'
  | 'eat_mushrooms'
  | 'eat_meat'
  | 'equip_weapon'
  | 'equip_armor';

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
  interactsWith?: WorldItemType;
  // Om denna task utrustar ett vapen/armor när den slutförs
  equipsWeapon?: WeaponType;
  equipsArmor?: ArmorType;
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

// ─── Combat ───────────────────────────────────────────────────────────────────

// Fiendetyper som kan mötas i CombatScreen
export type EnemyType = 'wolf';

// Statistik för en fiendetyp — statisk data, samma för alla möten av samma typ
export type EnemyDefinition = {
  id: EnemyType;
  name: string;
  emoji: string;
  maxHealth: number;
  damage: number;
  attackIntervalMs: number;
  // Loot som ges till spelaren vid seger
  lootRewards: Partial<Record<ResourceType, number>>;
  experienceReward: number;
};

// En aktiv stridshändelse — sparas i state under pågående strid
export type CombatLogEntry = {
  id: number;
  text: string;
  type: 'player_attack' | 'enemy_attack' | 'victory' | 'defeat' | 'info';
};

// ─── Spelstate ────────────────────────────────────────────────────────────────

export type PlayerState = {
  character: Character;
  inventory: Inventory;
  activeTask: ActiveTask | null;
  worldItems: WorldItemType[];
};

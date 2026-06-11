// types.ts
// Definierar datastrukturerna för One Place To Live
// Karaktär, resurser, tasks och världsobjekt

// ─── Karaktär ────────────────────────────────────────────────────────────────

// Hudtoner som kan väljas
export type SkinTone = 'light' | 'medium' | 'dark';

// Hårfärger som kan väljas
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'grey' | 'white';

// Klädsel som kan väljas
export type OutfitColor = 'green' | 'brown' | 'blue' | 'grey' | 'red';

// Karaktärens utseende — kombineras för att rita SVG-gubben
export type CharacterAppearance = {
  skinTone: SkinTone;
  hairColor: HairColor;
  outfitColor: OutfitColor;
};

// Karaktärens vitala värden — hälsa, hunger och törst
// Värden mellan 0-100 där 100 är fullt och 0 är kritiskt
export type VitalStats = {
  health: number;   // Hälsa — minskar vid skada eller svält
  hunger: number;   // Hunger — minskar över tid, ökar när man äter
  thirst: number;   // Törst — minskar snabbare än hunger
};

// Karaktärens fullständiga data — sparas i Firestore
export type Character = {
  id: string;
  name: string;                    // Spelarens valda namn
  appearance: CharacterAppearance; // Utseendevalen
  level: number;                   // Karaktärens nivå
  experience: number;              // Samlad erfarenhet
  vitals: VitalStats;              // Hälsa, hunger och törst
  lastVitalsUpdate: number;        // Tidsstämpel för senaste vitals-uppdatering
  createdAt: number;               // Tidsstämpel när karaktären skapades
};

// ─── Resurser ─────────────────────────────────────────────────────────────────

// Alla möjliga resurstyper i spelet
export type ResourceType =
  | 'sticks'      // Pinnar
  | 'stones'      // Stenar
  | 'flint'       // Flinta
  | 'bark'        // Bast
  | 'rope'        // Rep
  | 'berries'     // Bär
  | 'mushrooms'   // Svamp
  | 'water'       // Vatten
  | 'meat'        // Kött
  | 'wood';       // Trä (huggna stockar)

// En resurs med typ och mängd
export type Resource = {
  type: ResourceType;
  amount: number;
};

// Inventariet — en map med resurstyp och mängd
export type Inventory = Partial<Record<ResourceType, number>>;

// ─── Tasks ────────────────────────────────────────────────────────────────────

// Alla möjliga task-typer
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
  | 'hunt';

// Definition av en task — statisk data som beskriver vad en task kräver och ger
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
};

// En aktiv task — sparas i Firestore när spelaren startar en task
export type ActiveTask = {
  taskId: TaskType;
  startTime: number;
  endTime: number;
};

// ─── Världsobjekt ─────────────────────────────────────────────────────────────

// Objekt som kan skapas och synas i världsvyn
export type WorldItemType =
  | 'campfire'
  | 'shelter'
  | 'camp'
  | 'spear';

// Ett världsobjekt — sparas i Firestore och visas i scenen
export type WorldItem = {
  type: WorldItemType;
  createdAt: number;
};

// ─── Spelstate ────────────────────────────────────────────────────────────────

// Hela spelarens state
export type PlayerState = {
  character: Character;
  inventory: Inventory;
  activeTask: ActiveTask | null;
  worldItems: WorldItemType[];
};
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

// Karaktärens fullständiga data — sparas i Firestore
export type Character = {
  id: string;
  name: string;                    // Spelarens valda namn
  appearance: CharacterAppearance; // Utseendevalen
  level: number;                   // Karaktärens nivå
  experience: number;              // Samlad erfarenhet
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
  | 'gather_sticks'     // Samla pinnar
  | 'gather_stones'     // Samla stenar
  | 'gather_flint'      // Samla flinta
  | 'gather_bark'       // Samla bast
  | 'gather_berries'    // Samla bär
  | 'gather_mushrooms'  // Samla svamp
  | 'make_rope'         // Gör rep
  | 'make_fire'         // Gör eld
  | 'make_spear'        // Gör spjut
  | 'build_shelter'     // Bygg vindskydd
  | 'build_camp'        // Bygg läger
  | 'hunt';             // Jaga

// Definition av en task — statisk data som beskriver vad en task kräver och ger
export type TaskDefinition = {
  id: TaskType;
  name: string;                           // Visningsnamn
  description: string;                    // Beskrivning av tasken
  durationMinutes: number;                // Hur lång tid tasken tar
  requires: Partial<Record<ResourceType, number>>; // Resurser som krävs
  rewards: Partial<Record<ResourceType, number>>;  // Resurser som ges
  requiresWorldItem?: WorldItemType;      // Kräver ett visst världsobjekt
  createsWorldItem?: WorldItemType;       // Skapar ett visst världsobjekt
  experienceReward: number;              // Erfarenhet som ges
  levelRequired: number;                  // Miniminivå för att utföra tasken
};

// En aktiv task — sparas i Firestore när spelaren startar en task
export type ActiveTask = {
  taskId: TaskType;
  startTime: number;   // Tidsstämpel när tasken startades
  endTime: number;     // Tidsstämpel när tasken är klar
};

// ─── Världsobjekt ─────────────────────────────────────────────────────────────

// Objekt som kan skapas och synas i världsvyn
export type WorldItemType =
  | 'campfire'   // Brasa
  | 'shelter'    // Vindskydd
  | 'camp'       // Läger
  | 'spear';     // Spjut (ligger på marken)

// Ett världsobjekt — sparas i Firestore och visas i scenen
export type WorldItem = {
  type: WorldItemType;
  createdAt: number; // Tidsstämpel när objektet skapades
};

// ─── Spelstate ────────────────────────────────────────────────────────────────

// Hela spelarens state — används för att ladda och spara spelet
export type PlayerState = {
  character: Character;
  inventory: Inventory;
  activeTask: ActiveTask | null;
  worldItems: WorldItemType[];
};
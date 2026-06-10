// constants.ts
// Konstanter och speldata för One Place To Live
// Färger för karaktärsanpassning och task-definitioner

import { TaskDefinition, SkinTone, HairColor, OutfitColor } from './types';

// ─── Karaktärsfärger ──────────────────────────────────────────────────────────

// Hudtoner — hex-värden för SVG-rendering
export const SKIN_TONES: Record<SkinTone, string> = {
  light:  '#FDDBB4', // Ljus hudton
  medium: '#C68642', // Mellanhudton
  dark:   '#4A2912', // Mörk hudton
};

// Hårfärger — hex-värden för SVG-rendering
export const HAIR_COLORS: Record<HairColor, string> = {
  black:  '#1a1a1a',
  brown:  '#6B3A2A',
  blonde: '#D4A843',
  red:    '#A0342A',
  grey:   '#888888',
  white:  '#E8E8E8',
};

// Klädsel — hex-värden för SVG-rendering
export const OUTFIT_COLORS: Record<OutfitColor, string> = {
  green:  '#4A7C59',
  brown:  '#7C5C3A',
  blue:   '#3A5C7C',
  grey:   '#6B6B6B',
  red:    '#7C3A3A',
};

// ─── Erfarenhet och nivåer ────────────────────────────────────────────────────

// Erfarenhet som krävs för varje nivå
// Nivå 1 = 0 XP, Nivå 2 = 100 XP, Nivå 3 = 250 XP osv
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2750, 3600, 4600];

// Returnerar nuvarande nivå baserat på erfarenhet
export const getLevel = (experience: number): number => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (experience >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
};

// ─── Task-definitioner ────────────────────────────────────────────────────────

// Alla tasks i spelet med krav, belöningar och tider
export const TASK_DEFINITIONS: Record<string, TaskDefinition> = {

  // Samla pinnar — enklaste tasken, inga krav
  gather_sticks: {
    id: 'gather_sticks',
    name: 'Samla pinnar',
    description: 'Plocka upp torra pinnar från skogsgolvet.',
    durationMinutes: 5,
    requires: {},
    rewards: { sticks: 5 },
    experienceReward: 10,
    levelRequired: 1,
  },

  // Samla stenar — enkel task, inga krav
  gather_stones: {
    id: 'gather_stones',
    name: 'Samla stenar',
    description: 'Samla ihop lagom stora stenar.',
    durationMinutes: 5,
    requires: {},
    rewards: { stones: 3 },
    experienceReward: 10,
    levelRequired: 1,
  },

  // Samla flinta — sällsynt, tar lite längre tid
  gather_flint: {
    id: 'gather_flint',
    name: 'Samla flinta',
    description: 'Leta efter skarp flintsten bland stenarna.',
    durationMinutes: 15,
    requires: {},
    rewards: { flint: 1 },
    experienceReward: 20,
    levelRequired: 1,
  },

  // Samla bast — från träd, tar lite tid
  gather_bark: {
    id: 'gather_bark',
    name: 'Samla bast',
    description: 'Skala av innerbarken från björkträd.',
    durationMinutes: 15,
    requires: {},
    rewards: { bark: 3 },
    experienceReward: 15,
    levelRequired: 1,
  },

  // Samla bär — mat, enkel task
  gather_berries: {
    id: 'gather_berries',
    name: 'Samla bär',
    description: 'Plocka ätliga bär från buskarna.',
    durationMinutes: 10,
    requires: {},
    rewards: { berries: 5 },
    experienceReward: 10,
    levelRequired: 1,
  },

  // Samla svamp — mat, tar lite längre tid
  gather_mushrooms: {
    id: 'gather_mushrooms',
    name: 'Samla svamp',
    description: 'Hitta ätlig svamp i skogen.',
    durationMinutes: 15,
    requires: {},
    rewards: { mushrooms: 3 },
    experienceReward: 15,
    levelRequired: 1,
  },

  // Gör rep — kräver bast
  make_rope: {
    id: 'make_rope',
    name: 'Tvinна rep',
    description: 'Tvinna ihop bastfibrer till ett starkt rep.',
    durationMinutes: 20,
    requires: { bark: 3 },
    rewards: { rope: 1 },
    experienceReward: 30,
    levelRequired: 1,
  },

  // Gör eld — kräver pinnar, flinta och sten, skapar brasa i världen
  make_fire: {
    id: 'make_fire',
    name: 'Tänd eld',
    description: 'Slå flinta mot sten för att antända torra pinnar.',
    durationMinutes: 20,
    requires: { sticks: 5, flint: 1, stones: 2 },
    rewards: {},
    createsWorldItem: 'campfire',
    experienceReward: 50,
    levelRequired: 1,
  },

  // Gör spjut — kräver pinne, flinta och rep
  make_spear: {
    id: 'make_spear',
    name: 'Gör spjut',
    description: 'Fäst en flintspets på en lång pinne med rep.',
    durationMinutes: 30,
    requires: { sticks: 2, flint: 1, rope: 1 },
    rewards: {},
    createsWorldItem: 'spear',
    experienceReward: 60,
    levelRequired: 2,
  },

  // Bygg vindskydd — kräver pinnar och rep
  build_shelter: {
    id: 'build_shelter',
    name: 'Bygg vindskydd',
    description: 'Res upp pinnar och täck med grenar för ett enkelt vindskydd.',
    durationMinutes: 45,
    requires: { sticks: 10, rope: 2 },
    rewards: {},
    createsWorldItem: 'shelter',
    experienceReward: 100,
    levelRequired: 2,
  },

  // Bygg läger — kräver vindskydd och brasa
  build_camp: {
    id: 'build_camp',
    name: 'Bygg läger',
    description: 'Förbättra vindskyddet och skapa ett ordentligt läger.',
    durationMinutes: 120,
    requires: { sticks: 20, rope: 5, stones: 10 },
    requiresWorldItem: 'shelter',
    rewards: {},
    createsWorldItem: 'camp',
    experienceReward: 200,
    levelRequired: 3,
  },

  // Jaga — kräver spjut
  hunt: {
    id: 'hunt',
    name: 'Jaga',
    description: 'Spana in djur i skogen och kasta spjutet.',
    durationMinutes: 60,
    requires: {},
    requiresWorldItem: 'spear',
    rewards: { meat: 2 },
    experienceReward: 80,
    levelRequired: 3,
  },
};

// ─── Resursnamn ───────────────────────────────────────────────────────────────

// Svenska namn för varje resurstyp — används i UI
export const RESOURCE_NAMES: Record<string, string> = {
  sticks:    'Pinnar',
  stones:    'Stenar',
  flint:     'Flinta',
  bark:      'Bast',
  rope:      'Rep',
  berries:   'Bär',
  mushrooms: 'Svamp',
  water:     'Vatten',
  meat:      'Kött',
  wood:      'Trä',
};

// Emoji för varje resurstyp — används i UI
export const RESOURCE_EMOJIS: Record<string, string> = {
  sticks:    '🪵',
  stones:    '🪨',
  flint:     '⚡',
  bark:      '🌿',
  rope:      '🧶',
  berries:   '🫐',
  mushrooms: '🍄',
  water:     '💧',
  meat:      '🥩',
  wood:      '🌲',
};

// Svenska namn för världsobjekt — används i UI
export const WORLD_ITEM_NAMES: Record<string, string> = {
  campfire: 'Brasa',
  shelter:  'Vindskydd',
  camp:     'Läger',
  spear:    'Spjut',
};
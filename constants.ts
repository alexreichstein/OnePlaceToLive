// constants.ts
// Konstanter och speldata för One Place To Live
// Färger för karaktärsanpassning och task-definitioner

import { TaskDefinition, SkinTone, HairColor, OutfitColor } from './types';

// ─── Karaktärsfärger ──────────────────────────────────────────────────────────

export const SKIN_TONES: Record<SkinTone, string> = {
  light:  '#FDDBB4',
  medium: '#C68642',
  dark:   '#4A2912',
};

export const HAIR_COLORS: Record<HairColor, string> = {
  black:  '#1a1a1a',
  brown:  '#6B3A2A',
  blonde: '#D4A843',
  red:    '#A0342A',
  grey:   '#888888',
  white:  '#E8E8E8',
};

export const OUTFIT_COLORS: Record<OutfitColor, string> = {
  green:  '#4A7C59',
  brown:  '#7C5C3A',
  blue:   '#3A5C7C',
  grey:   '#6B6B6B',
  red:    '#7C3A3A',
};

// ─── Erfarenhet och nivåer ────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2750, 3600, 4600];

export const getLevel = (experience: number): number => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (experience >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
};

// ─── Task-definitioner ────────────────────────────────────────────────────────

export const TASK_DEFINITIONS: Record<string, TaskDefinition> = {

  // ── Gather resources ────────────────────────────────────────────────────────

  gather_sticks: {
    id: 'gather_sticks',
    name: 'Gather sticks',
    description: 'Pick up dry sticks from the forest floor.',
    durationMinutes: 5,
    requires: {},
    rewards: { sticks: 5 },
    experienceReward: 10,
    levelRequired: 1,
  },

  gather_stones: {
    id: 'gather_stones',
    name: 'Gather stones',
    description: 'Collect stones of suitable size.',
    durationMinutes: 5,
    requires: {},
    rewards: { stones: 3 },
    experienceReward: 10,
    levelRequired: 1,
  },

  gather_flint: {
    id: 'gather_flint',
    name: 'Gather flint',
    description: 'Search for sharp flint among the rocks.',
    durationMinutes: 15,
    requires: {},
    rewards: { flint: 1 },
    experienceReward: 20,
    levelRequired: 1,
  },

  gather_bark: {
    id: 'gather_bark',
    name: 'Gather bark',
    description: 'Strip inner bark from birch trees.',
    durationMinutes: 15,
    requires: {},
    rewards: { bark: 3 },
    experienceReward: 15,
    levelRequired: 1,
  },

  gather_berries: {
    id: 'gather_berries',
    name: 'Gather berries',
    description: 'Pick edible berries from the bushes.',
    durationMinutes: 10,
    requires: {},
    rewards: { berries: 5 },
    experienceReward: 10,
    levelRequired: 1,
  },

  gather_mushrooms: {
    id: 'gather_mushrooms',
    name: 'Gather mushrooms',
    description: 'Find edible mushrooms in the forest.',
    durationMinutes: 15,
    requires: {},
    rewards: { mushrooms: 3 },
    experienceReward: 15,
    levelRequired: 1,
  },

  // ── Craft items ─────────────────────────────────────────────────────────────

  make_rope: {
    id: 'make_rope',
    name: 'Twist rope',
    description: 'Twist bark fibres into a strong rope.',
    durationMinutes: 20,
    requires: { bark: 3 },
    rewards: { rope: 1 },
    experienceReward: 30,
    levelRequired: 1,
  },

  make_fire: {
    id: 'make_fire',
    name: 'Light a fire',
    description: 'Strike flint against stone to ignite dry sticks.',
    durationMinutes: 20,
    requires: { sticks: 5, flint: 1, stones: 2 },
    rewards: {},
    createsWorldItem: 'campfire',
    experienceReward: 50,
    levelRequired: 1,
  },

  make_spear: {
    id: 'make_spear',
    name: 'Craft a spear',
    description: 'Attach a flint tip to a long stick with rope.',
    durationMinutes: 30,
    requires: { sticks: 2, flint: 1, rope: 1 },
    rewards: {},
    createsWorldItem: 'spear',
    experienceReward: 60,
    levelRequired: 2,
  },

  // ── Build structures ────────────────────────────────────────────────────────

  build_shelter: {
    id: 'build_shelter',
    name: 'Build shelter',
    description: 'Prop up sticks and cover with branches for a basic windbreak.',
    durationMinutes: 45,
    requires: { sticks: 10, rope: 2 },
    rewards: {},
    createsWorldItem: 'shelter',
    experienceReward: 100,
    levelRequired: 2,
  },

  build_camp: {
    id: 'build_camp',
    name: 'Build camp',
    description: 'Improve the shelter and establish a proper camp.',
    durationMinutes: 120,
    requires: { sticks: 20, rope: 5, stones: 10 },
    requiresWorldItem: 'shelter',
    rewards: {},
    createsWorldItem: 'camp',
    experienceReward: 200,
    levelRequired: 3,
  },

  build_well: {
    id: 'build_well',
    name: 'Build a well',
    description: 'Dig and line a well with stones. Gives access to water near camp.',
    durationMinutes: 90,
    requires: { stones: 15, rope: 3 },
    rewards: {},
    createsWorldItem: 'well',
    experienceReward: 150,
    levelRequired: 3,
  },

  // ── Hunt — interagerar med spjutet ──────────────────────────────────────────

  hunt: {
    id: 'hunt',
    name: 'Hunt',
    description: 'Track animals in the forest and throw the spear.',
    durationMinutes: 60,
    requires: {},
    requiresWorldItem: 'spear',
    rewards: { meat: 2 },
    experienceReward: 80,
    levelRequired: 3,
    interactsWith: 'spear', // Visas när man klickar på spjutet
  },

  // ── Water — interagerar med brunnen ─────────────────────────────────────────

  fetch_water_stream: {
    id: 'fetch_water_stream',
    name: 'Fetch water (stream)',
    description: 'Walk to the stream and fill your container with fresh water.',
    durationMinutes: 20,
    requires: {},
    rewards: { water: 3 },
    experienceReward: 15,
    levelRequired: 1,
    // Ingen interactsWith — visas i vanliga task-listan
  },

  fetch_water_well: {
    id: 'fetch_water_well',
    name: 'Fetch water (well)',
    description: 'Draw water from the well near camp.',
    durationMinutes: 5,
    requires: {},
    requiresWorldItem: 'well',
    rewards: { water: 3 },
    experienceReward: 5,
    levelRequired: 1,
    interactsWith: 'well', // Visas när man klickar på brunnen
  },

  // ── Eat & drink — interagerar med brasan och inventariet ────────────────────

  drink_water: {
    id: 'drink_water',
    name: 'Drink water',
    description: 'Drink from your water container and quench your thirst.',
    durationMinutes: 1,
    requires: { water: 1 },
    rewards: {},
    restoresVitals: { thirst: 33 },
    experienceReward: 5,
    levelRequired: 1,
    // Ingen interactsWith — visas i vanliga task-listan (kan dricka var som helst)
  },

  eat_berries: {
    id: 'eat_berries',
    name: 'Eat berries',
    description: 'Eat a handful of berries. Tasty but not very filling.',
    durationMinutes: 1,
    requires: { berries: 2 },
    rewards: {},
    restoresVitals: { hunger: 10 },
    experienceReward: 5,
    levelRequired: 1,
    // Ingen interactsWith — kan ätas var som helst
  },

  eat_mushrooms: {
    id: 'eat_mushrooms',
    name: 'Eat mushrooms',
    description: 'Cook and eat the mushrooms. More filling than berries.',
    durationMinutes: 5,
    requires: { mushrooms: 1 },
    rewards: {},
    restoresVitals: { hunger: 15 },
    experienceReward: 5,
    levelRequired: 1,
    // Ingen interactsWith — kan ätas var som helst
  },

  eat_meat: {
    id: 'eat_meat',
    name: 'Eat meat',
    description: 'Roast the meat over the fire and enjoy a proper meal.',
    durationMinutes: 15,
    requires: { meat: 1 },
    requiresWorldItem: 'campfire',
    rewards: {},
    restoresVitals: { hunger: 33 },
    experienceReward: 10,
    levelRequired: 1,
    interactsWith: 'campfire', // Visas när man klickar på brasan
  },
};

// ─── Resursnamn ───────────────────────────────────────────────────────────────

export const RESOURCE_NAMES: Record<string, string> = {
  sticks:    'Sticks',
  stones:    'Stones',
  flint:     'Flint',
  bark:      'Bark',
  rope:      'Rope',
  berries:   'Berries',
  mushrooms: 'Mushrooms',
  water:     'Water',
  meat:      'Meat',
  wood:      'Wood',
};

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

export const WORLD_ITEM_NAMES: Record<string, string> = {
  campfire: 'Campfire',
  shelter:  'Shelter',
  camp:     'Camp',
  spear:    'Spear',
  well:     'Well',
};

// Emoji för varje världsobjekt — används i interaktions-popup
export const WORLD_ITEM_EMOJIS: Record<string, string> = {
  campfire: '🔥',
  shelter:  '🏕️',
  camp:     '🏠',
  spear:    '🗡️',
  well:     '🪣',
};

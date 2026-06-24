// constants.ts
// Konstanter och speldata för One Place To Live
// Färger, task-definitioner, equipment-statistik och fiendedata

import { TaskDefinition, SkinTone, HairColor, OutfitColor, WeaponStats, ArmorStats, EnemyDefinition } from './types';

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

// ─── Equipment-statistik ──────────────────────────────────────────────────────

// Vapenstatistik — id matchar WeaponType i types.ts
export const WEAPON_STATS: Record<string, WeaponStats> = {
  spear: {
    id: 'spear',
    name: 'Spear',
    damage: 12,
    attackIntervalMs: 1500, // Attackerar var 1.5 sekund
  },
};

// Armorstatistik — id matchar ArmorType i types.ts
export const ARMOR_STATS: Record<string, ArmorStats> = {
  hide_armor: {
    id: 'hide_armor',
    name: 'Hide Armor',
    defense: 4,
  },
};

// ─── Fiendedefinitioner ───────────────────────────────────────────────────────

// Vargen — första fienden i combat-systemet
export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  wolf: {
    id: 'wolf',
    name: 'Wolf',
    emoji: '🐺',
    maxHealth: 60,
    damage: 8,
    attackIntervalMs: 2000, // Attackerar var 2 sekunder
    lootRewards: { meat: 3, hide: 2 },
    experienceReward: 100,
  },
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

  // Gör armor av djurhud — kräver hide från vargjakt + rope
  make_armor: {
    id: 'make_armor',
    name: 'Craft hide armor',
    description: 'Stitch animal hide together with rope into protective armor.',
    durationMinutes: 40,
    requires: { hide: 3, rope: 2 },
    rewards: {},
    experienceReward: 70,
    levelRequired: 2,
    // Lägger automatiskt armor i inventory — utrustning sker via equip_armor
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
    interactsWith: 'spear',
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
    interactsWith: 'well',
  },

  // ── Eat & drink ─────────────────────────────────────────────────────────────

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
    interactsWith: 'campfire',
  },

  // ── Equip gear — instant, ingen resurskostnad ──────────────────────────────

  // Utrustar spjutet som vapen — kräver att spjutet är byggt i världen
  equip_weapon: {
    id: 'equip_weapon',
    name: 'Equip spear',
    description: 'Equip the spear as your weapon for combat.',
    durationMinutes: 0,
    requires: {},
    rewards: {},
    requiresWorldItem: 'spear',
    experienceReward: 0,
    levelRequired: 1,
    equipsWeapon: 'spear',
    interactsWith: 'spear',
  },

  // Utrustar hide armor — kräver att den finns i inventory
  equip_armor: {
    id: 'equip_armor',
    name: 'Equip hide armor',
    description: 'Wear the hide armor for protection in combat.',
    durationMinutes: 0,
    requires: { hide: 0 }, // Kontrolleras separat — se WorldScreen-logik
    rewards: {},
    experienceReward: 0,
    levelRequired: 1,
    equipsArmor: 'hide_armor',
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
  hide:      'Hide',
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
  hide:      '🟤',
};

export const WORLD_ITEM_NAMES: Record<string, string> = {
  campfire: 'Campfire',
  shelter:  'Shelter',
  camp:     'Camp',
  spear:    'Spear',
  well:     'Well',
};

export const WORLD_ITEM_EMOJIS: Record<string, string> = {
  campfire: '🔥',
  shelter:  '🏕️',
  camp:     '🏠',
  spear:    '🗡️',
  well:     '🪣',
};

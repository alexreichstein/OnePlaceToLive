// components/CharacterSVG.tsx
// SVG-komponent som ritar karaktären baserat på utseendevalen
// Byggd med React Native's inbyggda SVG-stöd via Svg-komponenten
// Karaktären består av: kropp, huvud, hår, ögon, mun och kläder

import { Svg, Circle, Rect, Ellipse, Path, G } from 'react-native-svg';
import { CharacterAppearance } from '../types';
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS } from '../constants';

type Props = {
  appearance: CharacterAppearance; // Utseendevalen som styr färgerna
  size?: number;                   // Storlek på SVG-komponenten (default 100)
};

export default function CharacterSVG({ appearance, size = 100 }: Props) {
  // Hämtar färgerna baserat på utseendevalen
  const skin = SKIN_TONES[appearance.skinTone];
  const hair = HAIR_COLORS[appearance.hairColor];
  const outfit = OUTFIT_COLORS[appearance.outfitColor];

  // Mörkare nyans av hudtonen för detaljer (öron, händer)
  const skinDark = appearance.skinTone === 'light'
    ? '#E8C49A'
    : appearance.skinTone === 'medium'
    ? '#A06830'
    : '#2E1A0E';

  // Mörkare nyans av kläderna för detaljer
  const outfitDark = shadeColor(outfit, -30);

  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 100 140">

      {/* ─── Ben ──────────────────────────────────────────────────────────── */}
      {/* Vänster ben */}
      <Rect x="35" y="95" width="12" height="30" rx="4" fill={outfitDark} />
      {/* Höger ben */}
      <Rect x="53" y="95" width="12" height="30" rx="4" fill={outfitDark} />

      {/* Skor */}
      <Ellipse cx="41" cy="125" rx="8" ry="4" fill="#2a1a0a" />
      <Ellipse cx="59" cy="125" rx="8" ry="4" fill="#2a1a0a" />

      {/* ─── Kropp ────────────────────────────────────────────────────────── */}
      <Rect x="30" y="60" width="40" height="40" rx="8" fill={outfit} />

      {/* Bälte */}
      <Rect x="30" y="90" width="40" height="6" rx="2" fill={outfitDark} />

      {/* ─── Armar ────────────────────────────────────────────────────────── */}
      {/* Vänster arm */}
      <Rect x="16" y="62" width="14" height="32" rx="6" fill={outfit} />
      {/* Höger arm */}
      <Rect x="70" y="62" width="14" height="32" rx="6" fill={outfit} />

      {/* Händer */}
      <Circle cx="23" cy="96" r="6" fill={skin} />
      <Circle cx="77" cy="96" r="6" fill={skin} />

      {/* ─── Hals ─────────────────────────────────────────────────────────── */}
      <Rect x="43" y="52" width="14" height="12" rx="4" fill={skin} />

      {/* ─── Huvud ────────────────────────────────────────────────────────── */}
      <Ellipse cx="50" cy="40" rx="22" ry="24" fill={skin} />

      {/* Öron */}
      <Ellipse cx="28" cy="42" rx="4" ry="5" fill={skinDark} />
      <Ellipse cx="72" cy="42" rx="4" ry="5" fill={skinDark} />

      {/* ─── Hår ──────────────────────────────────────────────────────────── */}
      {/* Topp av håret */}
      <Ellipse cx="50" cy="20" rx="22" ry="12" fill={hair} />
      {/* Sidor av håret */}
      <Rect x="28" y="18" width="8" height="20" rx="4" fill={hair} />
      <Rect x="64" y="18" width="8" height="20" rx="4" fill={hair} />

      {/* ─── Ansikte ──────────────────────────────────────────────────────── */}
      {/* Vänster öga — vit del */}
      <Ellipse cx="42" cy="40" rx="5" ry="5.5" fill="#fff" />
      {/* Höger öga — vit del */}
      <Ellipse cx="58" cy="40" rx="5" ry="5.5" fill="#fff" />

      {/* Pupiller */}
      <Circle cx="43" cy="41" r="2.5" fill="#1a1a1a" />
      <Circle cx="59" cy="41" r="2.5" fill="#1a1a1a" />

      {/* Glans i ögonen */}
      <Circle cx="44" cy="40" r="1" fill="#fff" />
      <Circle cx="60" cy="40" r="1" fill="#fff" />

      {/* Ögonbryn */}
      <Path
        d="M37 33 Q42 30 47 33"
        stroke={hair}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M53 33 Q58 30 63 33"
        stroke={hair}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Näsa */}
      <Ellipse cx="50" cy="46" rx="2" ry="2.5" fill={skinDark} />

      {/* Mun — ett litet leende */}
      <Path
        d="M44 53 Q50 58 56 53"
        stroke={skinDark}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

    </Svg>
  );
}

// Hjälpfunktion för att mörkna en hex-färg med ett givet värde
// Används för att skapa mörkare nyanser av kläder och hud
const shadeColor = (color: string, amount: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};
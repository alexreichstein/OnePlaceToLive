// components/ForestScene.tsx
// SVG-komponent som ritar skogsmiljön med karaktären integrerad i scenen
// Karaktären ritas direkt i SVG för naturlig djupkänsla och perspektiv
// Uppdateras dynamiskt baserat på tid på dygnet och byggda objekt

import { Svg, Rect, Circle, Ellipse, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DayNightColors, TimeOfDay } from '../hooks/useDayNight';
import { CharacterAppearance } from '../types';
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS } from '../constants';

type Props = {
  worldItems: string[];
  colors: DayNightColors;
  showSun: boolean;
  timeOfDay: TimeOfDay;
  appearance: CharacterAppearance; // Karaktärens utseende — ritas direkt i SVG
  isWalking: boolean;              // Styr om karaktären animeras
  walkOffset: number;              // Horisontell offset från animation
};

// Ritar karaktären som SVG-element direkt i scenen
// cx och cy är mittpunkten för karaktärens position
function CharacterInScene({
  appearance,
  cx,
  cy,
  scale = 1,
}: {
  appearance: CharacterAppearance;
  cx: number;
  cy: number;
  scale?: number;
}) {
  const skin = SKIN_TONES[appearance.skinTone];
  const hair = HAIR_COLORS[appearance.hairColor];
  const outfit = OUTFIT_COLORS[appearance.outfitColor];

  // Mörkare nyanser för detaljer
  const skinDark = appearance.skinTone === 'light'
    ? '#E8C49A'
    : appearance.skinTone === 'medium'
    ? '#A06830'
    : '#2E1A0E';
  const outfitDark = shadeColor(outfit, -30);

  // Karaktärens höjd är 70 enheter — cy är botten av fötterna
  const s = scale;
  const x = cx;
  const y = cy - 70 * s; // Toppen av karaktären

  return (
    <G transform={`translate(${x}, ${y}) scale(${s})`}>

      {/* Skugga under karaktären */}
      <Ellipse cx="0" cy="72" rx="18" ry="5" fill="#000" opacity="0.2" />

      {/* Ben */}
      <Rect x="-14" y="52" width="10" height="22" rx="4" fill={outfitDark} />
      <Rect x="4" y="52" width="10" height="22" rx="4" fill={outfitDark} />

      {/* Skor */}
      <Ellipse cx="-9" cy="74" rx="8" ry="4" fill="#2a1a0a" />
      <Ellipse cx="9" cy="74" rx="8" ry="4" fill="#2a1a0a" />

      {/* Kropp */}
      <Rect x="-18" y="22" width="36" height="34" rx="7" fill={outfit} />

      {/* Bälte */}
      <Rect x="-18" y="48" width="36" height="5" rx="2" fill={outfitDark} />

      {/* Armar */}
      <Rect x="-28" y="24" width="12" height="26" rx="5" fill={outfit} />
      <Rect x="16" y="24" width="12" height="26" rx="5" fill={outfit} />

      {/* Händer */}
      <Circle cx="-22" cy="52" r="5" fill={skin} />
      <Circle cx="22" cy="52" r="5" fill={skin} />

      {/* Hals */}
      <Rect x="-6" y="14" width="12" height="10" rx="4" fill={skin} />

      {/* Huvud */}
      <Ellipse cx="0" cy="0" rx="18" ry="20" fill={skin} />

      {/* Öron */}
      <Ellipse cx="-18" cy="2" rx="3.5" ry="4.5" fill={skinDark} />
      <Ellipse cx="18" cy="2" rx="3.5" ry="4.5" fill={skinDark} />

      {/* Hår */}
      <Ellipse cx="0" cy="-14" rx="18" ry="10" fill={hair} />
      <Rect x="-18" y="-16" width="7" height="18" rx="4" fill={hair} />
      <Rect x="11" y="-16" width="7" height="18" rx="4" fill={hair} />

      {/* Ögon */}
      <Ellipse cx="-6" cy="0" rx="4.5" ry="5" fill="#fff" />
      <Ellipse cx="6" cy="0" rx="4.5" ry="5" fill="#fff" />
      <Circle cx="-5" cy="1" r="2.5" fill="#1a1a1a" />
      <Circle cx="7" cy="1" r="2.5" fill="#1a1a1a" />
      <Circle cx="-4" cy="0" r="1" fill="#fff" />
      <Circle cx="8" cy="0" r="1" fill="#fff" />

      {/* Ögonbryn */}
      <Path d="M-10 -7 Q-6 -10 -2 -7" stroke={hair} strokeWidth="1.5"
        fill="none" strokeLinecap="round" />
      <Path d="M2 -7 Q6 -10 10 -7" stroke={hair} strokeWidth="1.5"
        fill="none" strokeLinecap="round" />

      {/* Näsa */}
      <Ellipse cx="0" cy="5" rx="2" ry="2.5" fill={skinDark} />

      {/* Mun */}
      <Path d="M-5 11 Q0 15 5 11" stroke={skinDark} strokeWidth="1.5"
        fill="none" strokeLinecap="round" />

    </G>
  );
}

// Hjälpfunktion för att mörkna en hex-färg
const shadeColor = (color: string, amount: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

export default function ForestScene({
  worldItems,
  colors,
  showSun,
  timeOfDay,
  appearance,
  isWalking,
  walkOffset,
}: Props) {
  // Karaktärens position — står på marken mitt i scenen
  // y=280 är markens nivå i viewBox 0 0 400 400
  const charX = 200 + walkOffset;
  const charY = 282;

  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 400">
      <Defs>
        {/* Himmelsgradient */}
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.sky} stopOpacity="1" />
          <Stop offset="1" stopColor={colors.skyGlow} stopOpacity="1" />
        </LinearGradient>
        {/* Markgradient — mörkare längst ner */}
        <LinearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.grass} stopOpacity="1" />
          <Stop offset="1" stopColor={colors.ground} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* ─── Himmel ───────────────────────────────────────────────────────── */}
      <Rect x="0" y="0" width="400" height="270" fill="url(#skyGrad)" />

      {/* Sol */}
      {showSun && (
        <G>
          <Circle cx="60" cy="60" r="30" fill="#FFD700" opacity="0.9" />
          <Circle cx="60" cy="60" r="24" fill="#FFE066" />
          <Path d="M60 15 L60 25" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M60 95 L60 105" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M15 60 L25 60" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M95 60 L105 60" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M27 27 L34 34" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M86 86 L93 93" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M93 27 L86 34" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M34 86 L27 93" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        </G>
      )}

      {/* Måne och stjärnor */}
      {!showSun && (
        <G>
          <Circle cx="340" cy="55" r="30" fill="#E8D5A0" />
          <Circle cx="354" cy="44" r="24" fill={colors.sky} />
          <Circle cx="30" cy="25" r="1.5" fill="#fff" opacity="0.8" />
          <Circle cx="90" cy="40" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="150" cy="18" r="2" fill="#fff" opacity="0.8" />
          <Circle cx="200" cy="45" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="250" cy="22" r="1.5" fill="#fff" opacity="0.8" />
          <Circle cx="295" cy="60" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="170" cy="65" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="65" cy="60" r="1.5" fill="#fff" opacity="0.8" />
          <Circle cx="120" cy="80" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="320" cy="30" r="1" fill="#fff" opacity="0.8" />
        </G>
      )}

      {/* Solnedgångsglow */}
      {(timeOfDay === 'evening' || timeOfDay === 'sunset') && (
        <Ellipse cx="200" cy="270" rx="200" ry="50"
          fill="#CC5500" opacity="0.15" />
      )}

      {/* ─── Bakre skog ───────────────────────────────────────────────────── */}
      {/* Träd längst bak — små och mörka för djupkänsla */}
      <Rect x="0" y="160" width="8" height="120" fill="#2A1A0A" />
      <Ellipse cx="4" cy="145" rx="18" ry="24" fill={colors.treeDark} />

      <Rect x="50" y="150" width="8" height="130" fill="#2A1A0A" />
      <Ellipse cx="54" cy="134" rx="20" ry="26" fill={colors.treeDark} />

      <Rect x="340" y="155" width="8" height="125" fill="#2A1A0A" />
      <Ellipse cx="344" cy="140" rx="19" ry="25" fill={colors.treeDark} />

      <Rect x="385" y="160" width="8" height="120" fill="#2A1A0A" />
      <Ellipse cx="389" cy="145" rx="17" ry="23" fill={colors.treeDark} />

      <Rect x="185" y="140" width="8" height="140" fill="#2A1A0A" />
      <Ellipse cx="189" cy="124" rx="16" ry="22" fill={colors.treeDark} />

      {/* ─── Mark ─────────────────────────────────────────────────────────── */}
      <Rect x="0" y="268" width="400" height="132" fill="url(#groundGrad)" />

      {/* Gräskant */}
      <Ellipse cx="200" cy="268" rx="220" ry="20" fill={colors.grass} />

      {/* Extra gräsdetaljer */}
      <Ellipse cx="80" cy="272" rx="40" ry="10" fill={colors.treeLight} opacity="0.5" />
      <Ellipse cx="320" cy="274" rx="35" ry="9" fill={colors.treeLight} opacity="0.5" />

      {/* ─── Mellanlager träd ─────────────────────────────────────────────── */}
      {/* Träd i mellanplan — medium storlek */}
      <Rect x="20" y="180" width="14" height="100" fill="#3A2010" />
      <Ellipse cx="27" cy="163" rx="30" ry="36" fill={colors.treeLight} />
      <Ellipse cx="27" cy="145" rx="22" ry="28" fill={colors.treeDark} />

      <Rect x="360" y="185" width="14" height="95" fill="#3A2010" />
      <Ellipse cx="367" cy="168" rx="28" ry="34" fill={colors.treeLight} />
      <Ellipse cx="367" cy="150" rx="20" ry="26" fill={colors.treeDark} />

      {/* ─── Världsobjekt ─────────────────────────────────────────────────── */}

      {/* Brasa — placerad till höger om karaktären */}
      {worldItems.includes('campfire') && (
        <G>
          <Ellipse cx="270" cy="285" rx="20" ry="7" fill="#444" />
          <Rect x="258" y="275" width="24" height="7" rx="3" fill="#3A2010" />
          <Ellipse cx="270" cy="268" rx="8" ry="11" fill="#CC4400" />
          <Ellipse cx="267" cy="266" rx="5" ry="9" fill="#FF6600" />
          <Ellipse cx="273" cy="267" rx="5" ry="8" fill="#FF6600" />
          <Ellipse cx="270" cy="263" rx="3.5" ry="6" fill="#FFB300" />
          <Ellipse cx="270" cy="260" rx="2" ry="4" fill="#FFE066" />
          {!showSun && (
            <Ellipse cx="270" cy="272" rx="15" ry="15"
              fill="#FF6600" opacity="0.08" />
          )}
        </G>
      )}

      {/* Vindskydd — till vänster */}
      {worldItems.includes('shelter') && (
        <G>
          <Rect x="82" y="228" width="5" height="42" rx="2" fill="#3A2010" />
          <Rect x="118" y="228" width="5" height="42" rx="2" fill="#3A2010" />
          <Path d="M76 228 L128 228 L134 270 L70 270 Z" fill="#5C3A1E" />
          <Path d="M76 228 L128 228 L134 270 L70 270 Z"
            fill="none" stroke="#3A2010" strokeWidth="2" />
          <Path d="M78 235 L132 235" stroke="#4A2E14" strokeWidth="1.5" />
          <Path d="M76 243 L133 243" stroke="#4A2E14" strokeWidth="1.5" />
          <Path d="M74 251 L133 251" stroke="#4A2E14" strokeWidth="1.5" />
        </G>
      )}

      {/* Läger/Koja */}
      {worldItems.includes('camp') && (
        <G>
          <Rect x="65" y="218" width="6" height="52" rx="2" fill="#2A1A0A" />
          <Rect x="134" y="218" width="6" height="52" rx="2" fill="#2A1A0A" />
          <Path d="M60 218 L144 218 L150 270 L54 270 Z" fill="#6B4423" />
          <Path d="M60 218 L144 218 L150 270 L54 270 Z"
            fill="none" stroke="#3A2010" strokeWidth="2" />
          <Rect x="92" y="245" width="20" height="25" rx="2" fill="#111" />
          <Path d="M62 226 L148 226" stroke="#4A2E14" strokeWidth="1.5" />
          <Path d="M60 236 L149 236" stroke="#4A2E14" strokeWidth="1.5" />
        </G>
      )}

      {/* Spjut — lutat mot ett träd */}
      {worldItems.includes('spear') && (
        <G>
          <Rect x="305" y="240" width="4" height="34" rx="1"
            fill="#3A2010" transform="rotate(-15 307 257)" />
          <Path d="M308 238 L313 246 L303 246 Z" fill="#777" />
          <Path d="M306 247 Q310 250 306 253" stroke="#8B6914"
            strokeWidth="1.5" fill="none" />
        </G>
      )}

      {/* ─── Framre träd ──────────────────────────────────────────────────── */}
      {/* Stora träd närmast kameran — delvis utanför bild för djupkänsla */}
      <Rect x="310" y="200" width="22" height="80" fill="#4A2810" />
      <Ellipse cx="321" cy="182" rx="46" ry="56" fill={colors.treeLight} />
      <Ellipse cx="321" cy="158" rx="34" ry="42" fill={colors.treeDark} />

      <Rect x="68" y="195" width="22" height="85" fill="#4A2810" />
      <Ellipse cx="79" cy="176" rx="48" ry="58" fill={colors.treeLight} />
      <Ellipse cx="79" cy="152" rx="36" ry="44" fill={colors.treeDark} />

      {/* Buskar i förgrunden */}
      <Ellipse cx="160" cy="276" rx="22" ry="12" fill={colors.treeLight} />
      <Ellipse cx="240" cy="278" rx="20" ry="11" fill={colors.treeLight} />

      {/* ─── Karaktären — ritad sist för att vara ovanpå allt annat ──────── */}
      <CharacterInScene
        appearance={appearance}
        cx={charX}
        cy={charY}
        scale={0.9}
      />

    </Svg>
  );
}
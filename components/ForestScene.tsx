// components/ForestScene.tsx
// SVG-komponent som ritar skogsmiljön med karaktären integrerad i scenen
// Utzoomad vy (viewBox 600x420) för mer rymd och perspektiv
// Lägret är i bakgrunden till vänster, elden centralt, brunnen till vänster om elden

import { Svg, Rect, Circle, Ellipse, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View } from 'react-native';
import { DayNightColors, TimeOfDay } from '../hooks/useDayNight';
import { CharacterAppearance, WorldItemType } from '../types';
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS } from '../constants';

type Props = {
  worldItems: string[];
  colors: DayNightColors;
  showSun: boolean;
  timeOfDay: TimeOfDay;
  appearance: CharacterAppearance;
  isWalking: boolean;
  walkOffset: number;
  onWorldItemPress: (item: WorldItemType) => void;
};

function CharacterInScene({
  appearance, cx, cy, scale = 1,
}: {
  appearance: CharacterAppearance;
  cx: number;
  cy: number;
  scale?: number;
}) {
  const skin = SKIN_TONES[appearance.skinTone];
  const hair = HAIR_COLORS[appearance.hairColor];
  const outfit = OUTFIT_COLORS[appearance.outfitColor];
  const skinDark = appearance.skinTone === 'light' ? '#E8C49A'
    : appearance.skinTone === 'medium' ? '#A06830' : '#2E1A0E';
  const outfitDark = shadeColor(outfit, -30);
  const x = cx;
  const y = cy - 70 * scale;

  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`}>
      <Ellipse cx="0" cy="72" rx="18" ry="5" fill="#000" opacity="0.2" />
      <Rect x="-14" y="52" width="10" height="22" rx="4" fill={outfitDark} />
      <Rect x="4" y="52" width="10" height="22" rx="4" fill={outfitDark} />
      <Ellipse cx="-9" cy="74" rx="8" ry="4" fill="#2a1a0a" />
      <Ellipse cx="9" cy="74" rx="8" ry="4" fill="#2a1a0a" />
      <Rect x="-18" y="22" width="36" height="34" rx="7" fill={outfit} />
      <Rect x="-18" y="48" width="36" height="5" rx="2" fill={outfitDark} />
      <Rect x="-28" y="24" width="12" height="26" rx="5" fill={outfit} />
      <Rect x="16" y="24" width="12" height="26" rx="5" fill={outfit} />
      <Circle cx="-22" cy="52" r="5" fill={skin} />
      <Circle cx="22" cy="52" r="5" fill={skin} />
      <Rect x="-6" y="14" width="12" height="10" rx="4" fill={skin} />
      <Ellipse cx="0" cy="0" rx="18" ry="20" fill={skin} />
      <Ellipse cx="-18" cy="2" rx="3.5" ry="4.5" fill={skinDark} />
      <Ellipse cx="18" cy="2" rx="3.5" ry="4.5" fill={skinDark} />
      <Ellipse cx="0" cy="-14" rx="18" ry="10" fill={hair} />
      <Rect x="-18" y="-16" width="7" height="18" rx="4" fill={hair} />
      <Rect x="11" y="-16" width="7" height="18" rx="4" fill={hair} />
      <Ellipse cx="-6" cy="0" rx="4.5" ry="5" fill="#fff" />
      <Ellipse cx="6" cy="0" rx="4.5" ry="5" fill="#fff" />
      <Circle cx="-5" cy="1" r="2.5" fill="#1a1a1a" />
      <Circle cx="7" cy="1" r="2.5" fill="#1a1a1a" />
      <Circle cx="-4" cy="0" r="1" fill="#fff" />
      <Circle cx="8" cy="0" r="1" fill="#fff" />
      <Path d="M-10 -7 Q-6 -10 -2 -7" stroke={hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M2 -7 Q6 -10 10 -7" stroke={hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="0" cy="5" rx="2" ry="2.5" fill={skinDark} />
      <Path d="M-5 11 Q0 15 5 11" stroke={skinDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </G>
  );
}

const shadeColor = (color: string, amount: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

export default function ForestScene({
  worldItems, colors, showSun, timeOfDay, appearance, isWalking, walkOffset, onWorldItemPress,
}: Props) {
  const charX = 300 + walkOffset;
  const charY = 330;

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 600 420"
        preserveAspectRatio="xMidYMid slice"
        style={{ flex: 1 }}
      >
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.sky} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.skyGlow} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.grass} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.ground} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8B5E3C" stopOpacity="1" />
            <Stop offset="1" stopColor="#5C3A1E" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* ─── Himmel ───────────────────────────────────────────────────────── */}
        <Rect x="0" y="0" width="600" height="420" fill="url(#skyGrad)" />

        {showSun && (
          <G>
            <Circle cx="80" cy="70" r="34" fill="#FFD700" opacity="0.9" />
            <Circle cx="80" cy="70" r="27" fill="#FFE066" />
            <Path d="M80 20 L80 32" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <Path d="M80 108 L80 120" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <Path d="M30 70 L42 70" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <Path d="M118 70 L130 70" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <Path d="M44 34 L52 42" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <Path d="M108 98 L116 106" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <Path d="M116 34 L108 42" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <Path d="M52 98 L44 106" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          </G>
        )}

        {!showSun && (
          <G>
            <Circle cx="500" cy="65" r="34" fill="#E8D5A0" />
            <Circle cx="518" cy="52" r="27" fill={colors.sky} />
            <Circle cx="40" cy="30" r="1.5" fill="#fff" opacity="0.8" />
            <Circle cx="120" cy="50" r="1" fill="#fff" opacity="0.8" />
            <Circle cx="200" cy="22" r="2" fill="#fff" opacity="0.8" />
            <Circle cx="280" cy="55" r="1" fill="#fff" opacity="0.8" />
            <Circle cx="350" cy="28" r="1.5" fill="#fff" opacity="0.8" />
            <Circle cx="420" cy="72" r="1" fill="#fff" opacity="0.8" />
            <Circle cx="160" cy="75" r="1" fill="#fff" opacity="0.8" />
            <Circle cx="80" cy="68" r="1.5" fill="#fff" opacity="0.8" />
          </G>
        )}

        {(timeOfDay === 'evening' || timeOfDay === 'sunset') && (
          <Ellipse cx="300" cy="300" rx="300" ry="60" fill="#CC5500" opacity="0.15" />
        )}

        {/* ─── Bakre skog ───────────────────────────────────────────────────── */}
        <Rect x="0" y="195" width="8" height="120" fill="#2A1A0A" />
        <Ellipse cx="4" cy="178" rx="20" ry="26" fill={colors.treeDark} />
        <Rect x="55" y="185" width="8" height="130" fill="#2A1A0A" />
        <Ellipse cx="59" cy="168" rx="22" ry="28" fill={colors.treeDark} />
        <Rect x="520" y="190" width="8" height="125" fill="#2A1A0A" />
        <Ellipse cx="524" cy="173" rx="20" ry="26" fill={colors.treeDark} />
        <Rect x="575" y="195" width="8" height="120" fill="#2A1A0A" />
        <Ellipse cx="579" cy="178" rx="18" ry="24" fill={colors.treeDark} />
        <Rect x="278" y="175" width="8" height="140" fill="#2A1A0A" />
        <Ellipse cx="282" cy="158" rx="17" ry="23" fill={colors.treeDark} />

        {/* ─── Mark — fyller hela nedre halvan ──────────────────────────────── */}
        <Rect x="0" y="300" width="600" height="120" fill="url(#groundGrad)" />
        <Ellipse cx="300" cy="300" rx="320" ry="20" fill={colors.grass} />

        {/* ─── Mellanlager träd ─────────────────────────────────────────────── */}
        <Rect x="22" y="215" width="16" height="95" fill="#3A2010" />
        <Ellipse cx="30" cy="198" rx="32" ry="40" fill={colors.treeLight} />
        <Ellipse cx="30" cy="178" rx="24" ry="30" fill={colors.treeDark} />

        <Rect x="545" y="220" width="16" height="90" fill="#3A2010" />
        <Ellipse cx="553" cy="203" rx="30" ry="38" fill={colors.treeLight} />
        <Ellipse cx="553" cy="183" rx="22" ry="28" fill={colors.treeDark} />

        {/* ─── Vindskydd — till vänster i bakgrunden ────────────────────────── */}
        {worldItems.includes('shelter') && !worldItems.includes('camp') && (
          <G>
            <Rect x="95" y="255" width="5" height="45" rx="2" fill="#3A2010" />
            <Rect x="138" y="255" width="5" height="45" rx="2" fill="#3A2010" />
            <Path d="M88 255 L150 255 L157 300 L81 300 Z" fill="#5C3A1E" />
            <Path d="M88 255 L150 255 L157 300 L81 300 Z" fill="none" stroke="#3A2010" strokeWidth="2" />
            <Path d="M90 263 L156 263" stroke="#4A2E14" strokeWidth="1.5" />
            <Path d="M87 273 L157 273" stroke="#4A2E14" strokeWidth="1.5" />
            <Path d="M84 283 L158 283" stroke="#4A2E14" strokeWidth="1.5" />
            <Rect x="75" y="245" width="90" height="60" fill="transparent"
              onPress={() => onWorldItemPress('shelter')} />
          </G>
        )}

        {/* ─── Läger — centrerat lite till vänster, fullt synligt ───────────── */}
        {worldItems.includes('camp') && (
          <G>
            {/* Fundament */}
            <Rect x="120" y="272" width="190" height="30" rx="3" fill="#4A3520" />
            {/* Väggar */}
            <Rect x="124" y="228" width="182" height="46" fill="#6B4423" />

            {/* Fönster vänster */}
            <Rect x="136" y="236" width="34" height="26" rx="3" fill="#1A1208" />
            <Rect x="136" y="236" width="34" height="26" rx="3" fill="none" stroke="#8B6914" strokeWidth="2" />
            <Rect x="152" y="236" width="2" height="26" fill="#8B6914" />
            <Rect x="136" y="248" width="34" height="2" fill="#8B6914" />
            {!showSun && (
              <Rect x="137" y="237" width="32" height="24" rx="2" fill="#FFD700" opacity="0.12" />
            )}

            {/* Fönster höger */}
            <Rect x="260" y="236" width="34" height="26" rx="3" fill="#1A1208" />
            <Rect x="260" y="236" width="34" height="26" rx="3" fill="none" stroke="#8B6914" strokeWidth="2" />
            <Rect x="276" y="236" width="2" height="26" fill="#8B6914" />
            <Rect x="260" y="248" width="34" height="2" fill="#8B6914" />
            {!showSun && (
              <Rect x="261" y="237" width="32" height="24" rx="2" fill="#FFD700" opacity="0.12" />
            )}

            {/* Dörr */}
            <Rect x="198" y="248" width="34" height="30" rx="3" fill="#3A2010" />
            <Rect x="198" y="248" width="34" height="30" rx="3" fill="none" stroke="#8B6914" strokeWidth="2" />
            <Circle cx="229" cy="265" r="3" fill="#D4A843" />

            {/* Tak */}
            <Path d="M108 230 L215 168 L322 230 Z" fill="url(#roofGrad)" />
            <Path d="M108 230 L215 168 L322 230 Z" fill="none" stroke="#3A2010" strokeWidth="2" />
            <Path d="M126 224 L215 172 L304 224" stroke="#4A2810" strokeWidth="1.5" fill="none" opacity="0.5" />
            <Path d="M144 218 L215 176 L286 218" stroke="#4A2810" strokeWidth="1.5" fill="none" opacity="0.4" />
            <Rect x="209" y="164" width="12" height="7" rx="2" fill="#3A2010" />

            {/* Skorsten */}
            <Rect x="268" y="162" width="16" height="34" rx="2" fill="#555" />
            <Rect x="264" y="158" width="24" height="7" rx="2" fill="#444" />
            {!showSun && (
              <G opacity="0.35">
                <Ellipse cx="276" cy="150" rx="5" ry="7" fill="#888" />
                <Ellipse cx="279" cy="139" rx="4" ry="6" fill="#777" />
                <Ellipse cx="275" cy="129" rx="3" ry="5" fill="#666" />
              </G>
            )}

            {/* Klickyta */}
            <Rect x="105" y="160" width="220" height="145" fill="transparent"
              onPress={() => onWorldItemPress('camp')} />
          </G>
        )}

        {/* ─── Brunn — till vänster om elden, separerat ─────────────────────── */}
        {worldItems.includes('well') && (
          <G>
            <Ellipse cx="390" cy="316" rx="20" ry="7" fill="#555" />
            <Rect x="370" y="292" width="40" height="26" rx="3" fill="#666" />
            <Ellipse cx="390" cy="292" rx="20" ry="7" fill="#777" />
            <Rect x="372" y="298" width="11" height="6" rx="1" fill="#555" />
            <Rect x="387" y="298" width="11" height="6" rx="1" fill="#555" />
            <Rect x="372" y="308" width="11" height="6" rx="1" fill="#555" />
            <Rect x="387" y="308" width="11" height="6" rx="1" fill="#555" />
            <Rect x="373" y="270" width="4" height="24" rx="1" fill="#3A2010" />
            <Rect x="403" y="270" width="4" height="24" rx="1" fill="#3A2010" />
            <Path d="M366 274 L390 260 L414 274 Z" fill="#5C3A1E" />
            <Path d="M366 274 L390 260 L414 274 Z" fill="none" stroke="#3A2010" strokeWidth="1.5" />
            <Rect x="388" y="274" width="3" height="12" fill="#8B6914" />
            <Rect x="384" y="284" width="9" height="7" rx="2" fill="#8B6914" />
            <Ellipse cx="388" cy="284" rx="4.5" ry="2" fill="#6B4A10" />
            <Rect x="358" y="255" width="65" height="68" fill="transparent"
              onPress={() => onWorldItemPress('well')} />
          </G>
        )}

        {/* ─── Brasa — till vänster om karaktären ──────────────────────────── */}
        {worldItems.includes('campfire') && (
          <G>
            <Ellipse cx="210" cy="316" rx="22" ry="8" fill="#444" />
            <Rect x="197" y="305" width="26" height="8" rx="3" fill="#3A2010" />
            <Ellipse cx="210" cy="286" rx="9" ry="13" fill="#CC4400" />
            <Ellipse cx="207" cy="284" rx="6" ry="10" fill="#FF6600" />
            <Ellipse cx="213" cy="285" rx="6" ry="9" fill="#FF6600" />
            <Ellipse cx="210" cy="278" rx="4" ry="7" fill="#FFB300" />
            <Ellipse cx="210" cy="273" rx="2.5" ry="4.5" fill="#FFE066" />
            {!showSun && (
              <Ellipse cx="210" cy="296" rx="20" ry="20" fill="#FF6600" opacity="0.07" />
            )}
            <Rect x="182" y="268" width="58" height="55" fill="transparent"
              onPress={() => onWorldItemPress('campfire')} />
          </G>
        )}

        {/* ─── Spjut — lutat mot höger träd ────────────────────────────────── */}
        {worldItems.includes('spear') && (
          <G>
            <Rect x="468" y="265" width="5" height="42" rx="1"
              fill="#3A2010" transform="rotate(-12 470 286)" />
            <Path d="M471 263 L477 274 L465 274 Z" fill="#777" />
            <Path d="M469 275 Q474 279 469 283" stroke="#8B6914" strokeWidth="1.5" fill="none" />
            <Rect x="456" y="255" width="52" height="68" fill="transparent"
              onPress={() => onWorldItemPress('spear')} />
          </G>
        )}

        {/* ─── Framre träd — stora, delvis utanför bild ─────────────────────── */}
        <Rect x="470" y="225" width="24" height="85" fill="#4A2810" />
        <Ellipse cx="482" cy="205" rx="52" ry="64" fill={colors.treeLight} />
        <Ellipse cx="482" cy="178" rx="38" ry="48" fill={colors.treeDark} />

        <Rect x="106" y="228" width="24" height="82" fill="#4A2810" />
        <Ellipse cx="118" cy="208" rx="54" ry="66" fill={colors.treeLight} />
        <Ellipse cx="118" cy="181" rx="40" ry="50" fill={colors.treeDark} />

        {/* ─── Karaktären ───────────────────────────────────────────────────── */}
        <CharacterInScene appearance={appearance} cx={charX} cy={charY} scale={0.85} />

      </Svg>
    </View>
  );
}

// components/ForestScene.tsx
// SVG-komponent som ritar skogsmiljön
// Tar emot färger från useDayNight och världsobjekt från useWorld
// Uppdateras dynamiskt baserat på tid på dygnet och byggda objekt

import { Svg, Rect, Circle, Ellipse, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DayNightColors, TimeOfDay } from '../hooks/useDayNight';

type Props = {
  worldItems: string[];      // Byggda världsobjekt — brasa, vindskydd etc
  colors: DayNightColors;    // Färger från useDayNight
  showSun: boolean;          // Visar sol eller måne
  timeOfDay: TimeOfDay;      // Aktuell tidsfas
};

export default function ForestScene({ worldItems, colors, showSun, timeOfDay }: Props) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 320">
      <Defs>
        {/* Gradient för himlen — övre och nedre färg per tidsfas */}
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.sky} stopOpacity="1" />
          <Stop offset="1" stopColor={colors.skyGlow} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Himmel med gradient */}
      <Rect x="0" y="0" width="400" height="210" fill="url(#skyGrad)" />

      {/* Sol — visas under dagtid */}
      {showSun && (
        <G>
          <Circle cx="60" cy="50" r="28" fill="#FFD700" opacity="0.9" />
          <Circle cx="60" cy="50" r="22" fill="#FFE066" />
          {/* Solstrålar */}
          <Path d="M60 10 L60 18" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M60 82 L60 90" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M20 50 L28 50" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M92 50 L100 50" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M32 22 L38 28" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M82 72 L88 78" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M88 22 L82 28" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <Path d="M38 72 L32 78" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        </G>
      )}

      {/* Måne och stjärnor — visas på natten */}
      {!showSun && (
        <G>
          <Circle cx="340" cy="45" r="28" fill="#E8D5A0" />
          <Circle cx="352" cy="36" r="22" fill={colors.sky} />
          <Circle cx="30" cy="20" r="1.5" fill="#fff" opacity="0.8" />
          <Circle cx="80" cy="35" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="140" cy="15" r="2" fill="#fff" opacity="0.8" />
          <Circle cx="190" cy="40" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="240" cy="20" r="1.5" fill="#fff" opacity="0.8" />
          <Circle cx="290" cy="55" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="160" cy="60" r="1" fill="#fff" opacity="0.8" />
          <Circle cx="60" cy="55" r="1.5" fill="#fff" opacity="0.8" />
        </G>
      )}

      {/* Solnedgångsglow — extra orange sken vid kväll/solnedgång */}
      {(timeOfDay === 'evening' || timeOfDay === 'sunset') && (
        <Ellipse cx="200" cy="210" rx="200" ry="40" fill="#CC5500" opacity="0.15" />
      )}

      {/* Mark */}
      <Rect x="0" y="210" width="400" height="110" fill={colors.ground} />

      {/* Gräs */}
      <Ellipse cx="200" cy="210" rx="200" ry="18" fill={colors.grass} />

      {/* Bakre skog */}
      <Rect x="10" y="100" width="10" height="120" fill="#2A1A0A" />
      <Ellipse cx="15" cy="88" rx="22" ry="28" fill={colors.treeDark} />
      <Rect x="370" y="110" width="10" height="110" fill="#2A1A0A" />
      <Ellipse cx="375" cy="98" rx="20" ry="26" fill={colors.treeDark} />
      <Rect x="180" y="90" width="8" height="130" fill="#2A1A0A" />
      <Ellipse cx="184" cy="78" rx="18" ry="24" fill={colors.treeDark} />

      {/* Framre träd — vänster */}
      <Rect x="40" y="130" width="18" height="90" fill="#3A2010" />
      <Ellipse cx="49" cy="116" rx="38" ry="44" fill={colors.treeLight} />
      <Ellipse cx="49" cy="100" rx="28" ry="32" fill={colors.treeDark} />

      {/* Framre träd — höger */}
      <Rect x="330" y="140" width="18" height="80" fill="#3A2010" />
      <Ellipse cx="339" cy="126" rx="36" ry="42" fill={colors.treeLight} />
      <Ellipse cx="339" cy="110" rx="26" ry="30" fill={colors.treeDark} />

      {/* Buskar */}
      <Ellipse cx="120" cy="215" rx="25" ry="14" fill={colors.treeLight} />
      <Ellipse cx="280" cy="218" rx="22" ry="12" fill={colors.treeLight} />
      <Ellipse cx="200" cy="220" rx="18" ry="10" fill={colors.treeLight} />

      {/* ─── Världsobjekt ─────────────────────────────────────────────────── */}

      {/* Brasa */}
      {worldItems.includes('campfire') && (
        <G>
          <Ellipse cx="200" cy="232" rx="24" ry="9" fill="#444" />
          <Rect x="186" y="220" width="28" height="8" rx="3" fill="#3A2010" />
          <Rect x="192" y="218" width="6" height="12" rx="2"
            fill="#3A2010" transform="rotate(20 195 224)" />
          <Ellipse cx="200" cy="214" rx="9" ry="14" fill="#CC4400" />
          <Ellipse cx="196" cy="212" rx="6" ry="11" fill="#FF6600" />
          <Ellipse cx="204" cy="213" rx="6" ry="10" fill="#FF6600" />
          <Ellipse cx="200" cy="209" rx="4" ry="8" fill="#FFB300" />
          <Ellipse cx="200" cy="206" rx="2" ry="5" fill="#FFE066" />
          {/* Glöd runt brasan på natten */}
          {!showSun && (
            <Ellipse cx="200" cy="218" rx="18" ry="18" fill="#FF6600" opacity="0.1" />
          )}
        </G>
      )}

      {/* Vindskydd — brun färg */}
      {worldItems.includes('shelter') && (
        <G>
          <Rect x="95" y="168" width="6" height="42" rx="2" fill="#3A2010" />
          <Rect x="133" y="168" width="6" height="42" rx="2" fill="#3A2010" />
          <Path d="M88 168 L144 168 L150 210 L82 210 Z" fill="#5C3A1E" />
          <Path d="M88 168 L144 168 L150 210 L82 210 Z"
            fill="none" stroke="#3A2010" strokeWidth="2" />
          <Path d="M90 175 L148 175" stroke="#4A2E14" strokeWidth="2" />
          <Path d="M88 183 L149 183" stroke="#4A2E14" strokeWidth="2" />
          <Path d="M88 191 L149 191" stroke="#4A2E14" strokeWidth="2" />
        </G>
      )}

      {/* Läger/Koja — brun färg */}
      {worldItems.includes('camp') && (
        <G>
          <Rect x="78" y="158" width="7" height="52" rx="2" fill="#2A1A0A" />
          <Rect x="149" y="158" width="7" height="52" rx="2" fill="#2A1A0A" />
          <Path d="M72 158 L160 158 L166 210 L66 210 Z" fill="#6B4423" />
          <Path d="M72 158 L160 158 L166 210 L66 210 Z"
            fill="none" stroke="#3A2010" strokeWidth="2" />
          <Rect x="106" y="185" width="22" height="25" rx="2" fill="#111" />
          <Path d="M74 166 L164 166" stroke="#4A2E14" strokeWidth="2" />
          <Path d="M72 176 L165 176" stroke="#4A2E14" strokeWidth="2" />
        </G>
      )}

      {/* Spjut */}
      {worldItems.includes('spear') && (
        <G>
          <Rect x="245" y="185" width="5" height="36" rx="1"
            fill="#3A2010" transform="rotate(-20 247 203)" />
          <Path d="M248 182 L254 191 L242 191 Z" fill="#777" />
          <Path d="M246 192 Q250 195 246 198" stroke="#8B6914"
            strokeWidth="1.5" fill="none" />
        </G>
      )}

    </Svg>
  );
}
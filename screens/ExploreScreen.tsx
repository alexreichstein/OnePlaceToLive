// screens/ExploreScreen.tsx
// Visar stigen söderut från lägret
// Karaktären har gått söderut och ser nya platser framför sig
// Navigeras till från WorldScreen via pilen längs stigen

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Svg, Rect, Circle, Ellipse, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { WorldStackParamList } from '../navigation';

type NavigationProp = StackNavigationProp<WorldStackParamList, 'Explore'>;

export default function ExploreScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>

      {/* SVG-scen — stigen söderut med bäck i bakgrunden */}
      <View style={styles.sceneContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 400 500">
          <Defs>
            {/* Himmel — ljusare blå än lägret, mitt på dagen */}
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#4A90C4" stopOpacity="1" />
              <Stop offset="1" stopColor="#87CEEB" stopOpacity="1" />
            </LinearGradient>
            {/* Mark */}
            <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#5A8A3C" stopOpacity="1" />
              <Stop offset="1" stopColor="#3A5A20" stopOpacity="1" />
            </LinearGradient>
            {/* Vatten */}
            <LinearGradient id="water" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2E86AB" stopOpacity="1" />
              <Stop offset="1" stopColor="#1A5276" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Himmel */}
          <Rect x="0" y="0" width="400" height="280" fill="url(#sky)" />

          {/* Sol */}
          <Circle cx="320" cy="60" r="28" fill="#FFD700" opacity="0.9" />
          <Circle cx="320" cy="60" r="22" fill="#FFE066" />

          {/* Bakre berg i horisonten */}
          <Path d="M0 200 L80 120 L160 180 L240 100 L320 160 L400 110 L400 280 L0 280 Z"
            fill="#2C5F2E" opacity="0.6" />
          <Path d="M0 220 L60 150 L140 200 L200 140 L280 190 L360 130 L400 160 L400 280 L0 280 Z"
            fill="#3A7D44" opacity="0.7" />

          {/* Bäck/sjö i mitten av scenen */}
          <Ellipse cx="200" cy="265" rx="120" ry="25" fill="url(#water)" />
          <Ellipse cx="200" cy="263" rx="115" ry="20" fill="#3498DB" opacity="0.4" />
          {/* Vattenreflektioner */}
          <Path d="M140 262 Q160 258 180 262" stroke="#87CEEB" strokeWidth="1.5"
            fill="none" opacity="0.6" />
          <Path d="M210 260 Q235 256 255 260" stroke="#87CEEB" strokeWidth="1.5"
            fill="none" opacity="0.6" />

          {/* Mark */}
          <Rect x="0" y="278" width="400" height="222" fill="url(#ground)" />
          <Ellipse cx="200" cy="278" rx="220" ry="18" fill="#5A8A3C" />

          {/* Gräs och buskar runt bäcken */}
          <Ellipse cx="80" cy="275" rx="30" ry="10" fill="#4A7C30" />
          <Ellipse cx="320" cy="275" rx="28" ry="9" fill="#4A7C30" />
          <Ellipse cx="130" cy="272" rx="15" ry="6" fill="#3D6B28" />
          <Ellipse cx="270" cy="271" rx="18" ry="7" fill="#3D6B28" />

          {/* Träd längs sidorna */}
          <Rect x="10" y="190" width="16" height="90" fill="#4A2810" />
          <Ellipse cx="18" cy="175" rx="38" ry="46" fill="#2E7D32" />
          <Ellipse cx="18" cy="155" rx="28" ry="34" fill="#1B5E20" />

          <Rect x="374" y="195" width="16" height="85" fill="#4A2810" />
          <Ellipse cx="382" cy="180" rx="36" ry="44" fill="#2E7D32" />
          <Ellipse cx="382" cy="160" rx="26" ry="32" fill="#1B5E20" />

          <Rect x="40" y="210" width="12" height="70" fill="#3A2010" />
          <Ellipse cx="46" cy="198" rx="28" ry="34" fill="#388E3C" />
          <Ellipse cx="46" cy="182" rx="20" ry="24" fill="#2E7D32" />

          <Rect x="348" y="215" width="12" height="65" fill="#3A2010" />
          <Ellipse cx="354" cy="203" rx="26" ry="32" fill="#388E3C" />
          <Ellipse cx="354" cy="187" rx="18" ry="22" fill="#2E7D32" />

          {/* Stigen söderut — går från toppen ner mot bäcken */}
          {/* Stigen i fjärran (smal) */}
          <Path d="M185 120 L215 120 L230 270 L170 270 Z" fill="#8B7355" opacity="0.7" />
          {/* Stigen närmre (bredare) */}
          <Path d="M160 278 L240 278 L260 500 L140 500 Z" fill="#8B7355" opacity="0.8" />
          {/* Stigens textur */}
          <Path d="M190 180 L210 180" stroke="#7A6345" strokeWidth="1.5" opacity="0.5" />
          <Path d="M183 220 L217 220" stroke="#7A6345" strokeWidth="1.5" opacity="0.5" />
          <Path d="M175 320 L225 320" stroke="#7A6345" strokeWidth="1.5" opacity="0.5" />
          <Path d="M168 380 L232 380" stroke="#7A6345" strokeWidth="1.5" opacity="0.5" />
          <Path d="M162 440 L238 440" stroke="#7A6345" strokeWidth="1.5" opacity="0.5" />

          {/* Stenar längs stigen */}
          <Ellipse cx="155" cy="350" rx="10" ry="6" fill="#777" />
          <Ellipse cx="248" cy="410" rx="8" ry="5" fill="#777" />
          <Ellipse cx="160" cy="460" rx="6" ry="4" fill="#888" />

          {/* Platser längs stigen — etiketter */}
          {/* Bäck-ikon */}
          <Circle cx="200" cy="255" r="16" fill="#1A5276" opacity="0.8" />
          <Path d="M192 255 Q196 251 200 255 Q204 259 208 255"
            stroke="#87CEEB" strokeWidth="2" fill="none" strokeLinecap="round" />

        </Svg>

        {/* Pil tillbaka norrut — överst på skärmen */}
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.arrowText}>↑</Text>
          <Text style={styles.arrowLabel}>Camp</Text>
        </TouchableOpacity>

        {/* Plats-etikett: Bäcken */}
        <View style={styles.locationLabel}>
          <Text style={styles.locationIcon}>💧</Text>
          <Text style={styles.locationName}>The Stream</Text>
          <Text style={styles.locationDesc}>Fresh water flows here</Text>
        </View>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  sceneContainer: {
    flex: 1,
    position: 'relative',
  },
  // Pil tillbaka — uppe till vänster
  backArrow: {
    position: 'absolute',
    top: 16,
    left: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  arrowText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  arrowLabel: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '600',
  },
  // Plats-etikett längst ner
  locationLabel: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  locationIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  locationName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  locationDesc: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
});

// screens/CharacterScreen.tsx
// Skärm för att skapa och visa sin karaktär
// Första gången appen öppnas — skapa karaktär med namn och utseende
// Därefter — visa karaktären och möjlighet att ändra utseende

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCharacter from '../hooks/useCharacter';
import CharacterSVG from '../components/CharacterSVG';
import {
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  LEVEL_THRESHOLDS,
} from '../constants';
import { getProgressToNextLevel } from '../gameData/tasks';
import { SkinTone, HairColor, OutfitColor, CharacterAppearance } from '../types';

// Temporärt hårdkodat userId — i framtiden kopplat till inloggning
const USER_ID = 'player_alex';

export default function CharacterScreen() {
  const { character, loading, error, createCharacter, updateAppearance } = useCharacter(USER_ID);

  // Formulärfält för att skapa karaktär
  const [name, setName] = useState('');

  // Utseendevals-state — används både vid skapande och redigering
  const [skinTone, setSkinTone] = useState<SkinTone>('medium');
  const [hairColor, setHairColor] = useState<HairColor>('brown');
  const [outfitColor, setOutfitColor] = useState<OutfitColor>('green');

  // Styr om redigeringsläget för utseende är aktivt
  const [editingAppearance, setEditingAppearance] = useState(false);

  // Sparar den nya karaktären till Firebase
  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Namn krävs', 'Ge din karaktär ett namn!');
      return;
    }
    try {
      await createCharacter(name, { skinTone, hairColor, outfitColor });
    } catch (e) {
      Alert.alert('Fel', 'Kunde inte skapa karaktären.');
    }
  };

  // Sparar uppdaterat utseende till Firebase
  const handleUpdateAppearance = async () => {
    try {
      await updateAppearance({ skinTone, hairColor, outfitColor });
      setEditingAppearance(false);
    } catch (e) {
      Alert.alert('Fel', 'Kunde inte uppdatera utseendet.');
    }
  };

  // Laddningsskärm medan Firebase hämtar data
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Laddar...</Text>
      </View>
    );
  }

  // ─── Skapa karaktär — visas om ingen karaktär finns ───────────────────────
  if (!character) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.createContainer}>
          <Text style={styles.title}>One Place To Live</Text>
          <Text style={styles.subtitle}>Skapa din karaktär</Text>

          {/* Förhandsgranskning av karaktären */}
          <View style={styles.previewContainer}>
            <CharacterSVG
              appearance={{ skinTone, hairColor, outfitColor }}
              size={160}
            />
          </View>

          {/* Namnfält */}
          <Text style={styles.label}>Namn</Text>
          <TextInput
            style={styles.input}
            placeholder="Vad heter du?"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            maxLength={20}
          />

          {/* Hudtonsväljare */}
          <Text style={styles.label}>Hudton</Text>
          <View style={styles.colorRow}>
            {(Object.keys(SKIN_TONES) as SkinTone[]).map((tone) => (
              <TouchableOpacity
                key={tone}
                style={[
                  styles.colorCircle,
                  { backgroundColor: SKIN_TONES[tone] },
                  skinTone === tone && styles.colorCircleSelected,
                ]}
                onPress={() => setSkinTone(tone)}
              />
            ))}
          </View>

          {/* Hårfärgsväljare */}
          <Text style={styles.label}>Hårfärg</Text>
          <View style={styles.colorRow}>
            {(Object.keys(HAIR_COLORS) as HairColor[]).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: HAIR_COLORS[color] },
                  hairColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setHairColor(color)}
              />
            ))}
          </View>

          {/* Klädselväljare */}
          <Text style={styles.label}>Klädsel</Text>
          <View style={styles.colorRow}>
            {(Object.keys(OUTFIT_COLORS) as OutfitColor[]).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: OUTFIT_COLORS[color] },
                  outfitColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setOutfitColor(color)}
              />
            ))}
          </View>

          {/* Skapa-knapp */}
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>Börja äventyret</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Visa karaktär — visas om karaktär finns ──────────────────────────────
  const appearance = editingAppearance
    ? { skinTone, hairColor, outfitColor }
    : character.appearance;

  // Beräknar framsteg till nästa nivå
  const progress = getProgressToNextLevel(
    character.experience,
    character.level,
    LEVEL_THRESHOLDS
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.viewContainer}>

        {/* Karaktärens namn och nivå */}
        <Text style={styles.characterName}>{character.name}</Text>
        <Text style={styles.characterLevel}>Nivå {character.level}</Text>

        {/* SVG-karaktären */}
        <View style={styles.previewContainer}>
          <CharacterSVG appearance={appearance} size={180} />
        </View>

        {/* Erfarenhetsfält */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${progress.percentage}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {progress.current} / {progress.required} XP till nivå {character.level + 1}
          </Text>
        </View>

        {/* Redigera utseende */}
        {editingAppearance ? (
          <>
            {/* Hudtonsväljare */}
            <Text style={styles.label}>Hudton</Text>
            <View style={styles.colorRow}>
              {(Object.keys(SKIN_TONES) as SkinTone[]).map((tone) => (
                <TouchableOpacity
                  key={tone}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: SKIN_TONES[tone] },
                    skinTone === tone && styles.colorCircleSelected,
                  ]}
                  onPress={() => setSkinTone(tone)}
                />
              ))}
            </View>

            {/* Hårfärgsväljare */}
            <Text style={styles.label}>Hårfärg</Text>
            <View style={styles.colorRow}>
              {(Object.keys(HAIR_COLORS) as HairColor[]).map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: HAIR_COLORS[color] },
                    hairColor === color && styles.colorCircleSelected,
                  ]}
                  onPress={() => setHairColor(color)}
                />
              ))}
            </View>

            {/* Klädselväljare */}
            <Text style={styles.label}>Klädsel</Text>
            <View style={styles.colorRow}>
              {(Object.keys(OUTFIT_COLORS) as OutfitColor[]).map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: OUTFIT_COLORS[color] },
                    outfitColor === color && styles.colorCircleSelected,
                  ]}
                  onPress={() => setOutfitColor(color)}
                />
              ))}
            </View>

            {/* Spara och avbryt */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateAppearance}>
              <Text style={styles.saveBtnText}>Spara utseende</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingAppearance(false)}>
              <Text style={styles.cancelText}>Avbryt</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Knapp för att öppna redigeringsläget
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              // Fyller i nuvarande utseende i formuläret
              setSkinTone(character.appearance.skinTone);
              setHairColor(character.appearance.hairColor);
              setOutfitColor(character.appearance.outfitColor);
              setEditingAppearance(true);
            }}
          >
            <Text style={styles.editBtnText}>✏️ Ändra utseende</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Huvudbehållare — mörk bakgrund för naturtema
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  // Centrerad vy för laddningsskärmen
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },

  // Innehållsbehållare för skapandevyn
  createContainer: {
    padding: 24,
    alignItems: 'center',
  },

  // Innehållsbehållare för karaktärsvyn
  viewContainer: {
    padding: 24,
    alignItems: 'center',
  },

  // Spelets titel
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A7C59',
    marginBottom: 4,
    textAlign: 'center',
  },

  // Underrubrik
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
  },

  // Förhandsgranskning av karaktären
  previewContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },

  // Karaktärens namn
  characterName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },

  // Karaktärens nivå
  characterLevel: {
    fontSize: 16,
    color: '#4A7C59',
    fontWeight: '600',
    marginBottom: 16,
  },

  // Erfarenhetsbehållare
  xpContainer: {
    width: '100%',
    marginBottom: 24,
  },

  // Erfarenhetsfältets bakgrund
  xpBar: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },

  // Erfarenhetsfältets fyllning
  xpFill: {
    height: '100%',
    backgroundColor: '#4A7C59',
    borderRadius: 5,
  },

  // Erfarenhetstext
  xpText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },

  // Etikett ovanför fält
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
  },

  // Textfält för namn
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#2a2a2a',
    marginBottom: 8,
  },

  // Rad med färgcirklar
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },

  // Enskild färgcirkel
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  // Vald färgcirkel — vit kant
  colorCircleSelected: {
    borderColor: '#fff',
    transform: [{ scale: 1.15 }],
  },

  // Skapa-knapp
  createBtn: {
    backgroundColor: '#4A7C59',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  // Spara-knapp
  saveBtn: {
    backgroundColor: '#4A7C59',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Avbryt-länk
  cancelText: {
    color: '#888',
    textAlign: 'center',
    padding: 12,
    fontSize: 14,
  },

  // Redigera-knapp
  editBtn: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    marginTop: 8,
  },
  editBtnText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 14,
  },
});
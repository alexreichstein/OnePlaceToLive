// navigation.tsx
// Hanterar all navigering i One Place To Live
// Stack navigation med tre skärmar: Karaktär, Värld och Inventarie
// WorldStack har en extra screen för utforskning söderut

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import CharacterScreen from './screens/CharacterScreen';
import WorldScreen from './screens/WorldScreen';
import InventoryScreen from './screens/InventoryScreen';
import ExploreScreen from './screens/ExploreScreen';

export type RootStackParamList = {
  CharacterTab: undefined;
  WorldTab: undefined;
  InventoryTab: undefined;
};

// Parametrar för WorldStack — inkluderar ExploreScreen
export type WorldStackParamList = {
  WorldMain: undefined;
  Explore: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const WorldStackNav = createStackNavigator<WorldStackParamList>();

// Stack för karaktärsskärmen
function CharacterStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CharacterTab" component={CharacterScreen} />
    </Stack.Navigator>
  );
}

// WorldStack — innehåller WorldScreen och ExploreScreen
// ExploreScreen nås via pilen i scenen, inte via bottom tabs
function WorldStack() {
  return (
    <WorldStackNav.Navigator screenOptions={{ headerShown: false }}>
      <WorldStackNav.Screen name="WorldMain" component={WorldScreen} />
      <WorldStackNav.Screen name="Explore" component={ExploreScreen} />
    </WorldStackNav.Navigator>
  );
}

// Stack för inventarieskärmen
function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryTab" component={InventoryScreen} />
    </Stack.Navigator>
  );
}

// Huvudnavigering med tre flikar längst ner
export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4A7C59',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopWidth: 1,
            borderTopColor: '#333',
            paddingBottom: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        {/* Flik 1 — Karaktär */}
        <Tab.Screen
          name="Karaktär"
          component={CharacterStack}
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>🧑</Text>,
          }}
        />

        {/* Flik 2 — Värld */}
        <Tab.Screen
          name="Värld"
          component={WorldStack}
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>🌲</Text>,
          }}
        />

        {/* Flik 3 — Inventarie */}
        <Tab.Screen
          name="Inventarie"
          component={InventoryStack}
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 22 }}>🎒</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

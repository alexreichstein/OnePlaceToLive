// navigation.tsx
// Hanterar all navigering i One Place To Live
// Stack navigation med tre skärmar: Karaktär, Värld och Inventarie
// WorldStack har WorldMain, CombatScreen och CampScreen

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import CharacterScreen from './screens/CharacterScreen';
import WorldScreen from './screens/WorldScreen';
import InventoryScreen from './screens/InventoryScreen';
import CombatScreen from './screens/CombatScreen';
import CampScreen from './screens/CampScreen';

export type RootStackParamList = {
  CharacterTab: undefined;
  WorldTab: undefined;
  InventoryTab: undefined;
};

// Parametrar för WorldStack — Combat ersätter Explore
export type WorldStackParamList = {
  WorldMain: undefined;
  Combat: undefined;
  Camp: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const WorldStackNav = createStackNavigator<WorldStackParamList>();

function CharacterStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CharacterTab" component={CharacterScreen} />
    </Stack.Navigator>
  );
}

// WorldStack — WorldScreen, CombatScreen (PvE) och CampScreen
function WorldStack() {
  return (
    <WorldStackNav.Navigator screenOptions={{ headerShown: false }}>
      <WorldStackNav.Screen name="WorldMain" component={WorldScreen} />
      <WorldStackNav.Screen name="Combat" component={CombatScreen} />
      <WorldStackNav.Screen name="Camp" component={CampScreen} />
    </WorldStackNav.Navigator>
  );
}

function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryTab" component={InventoryScreen} />
    </Stack.Navigator>
  );
}

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
        <Tab.Screen
          name="Karaktär"
          component={CharacterStack}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>🧑</Text> }}
        />
        <Tab.Screen
          name="Värld"
          component={WorldStack}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>🌲</Text> }}
        />
        <Tab.Screen
          name="Inventarie"
          component={InventoryStack}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 22 }}>🎒</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

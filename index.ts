// index.ts
// Startpunkt för One Place To Live
// Registrerar rotkomponenten som Expo använder för att starta appen

import { registerRootComponent } from 'expo';
import Navigation from './navigation';

// Registrerar Navigation som rotkomponent
// Ersätter standard App.tsx som startpunkt
registerRootComponent(Navigation);
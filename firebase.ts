// firebase.ts
// Konfigurerar och initierar Firebase-anslutningen för OnePlaceToLive
// Exporterar Firestore-databasen som används i alla hooks

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase-konfiguration för OnePlaceToLive-projektet
const firebaseConfig = {
  apiKey: "AIzaSyAA0_AiIkPUiE9gUGh5YLMPqprujbeDHpE",
  authDomain: "oneplacetolive.firebaseapp.com",
  projectId: "oneplacetolive",
  storageBucket: "oneplacetolive.firebasestorage.app",
  messagingSenderId: "940365343802",
  appId: "1:940365343802:web:27d50503179afb28ec9903"
};

// Initierar Firebase-appen
const app = initializeApp(firebaseConfig);

// Exporterar Firestore-databasen
export const db = getFirestore(app);
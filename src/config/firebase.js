import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase dédiée à l'application GestionP
const firebaseConfig = {
  apiKey: "AIzaSyCFT1dyMg-te8VLbQAL4v3mD8u2x0wAWWo",
  authDomain: "gestionp-a2136.firebaseapp.com",
  databaseURL: "https://gestionp-a2136-default-rtdb.firebaseio.com",
  projectId: "gestionp-a2136",
  storageBucket: "gestionp-a2136.firebasestorage.app",
  messagingSenderId: "310658278876",
  appId: "1:310658278876:web:c1e27574b26836ff28db19",
  measurementId: "G-75MCB8CCNS"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

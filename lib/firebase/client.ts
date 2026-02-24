import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: 'G-VYQY355BRT',
};


// Initialize Firebase
let clientApp;
if (getApps().length > 0) {
  clientApp = getApp();
} else {
  // Apenas inicializa se a API Key existir, evitando erro durante o 'npm run build' no Railway
  if (firebaseConfig.apiKey) {
    clientApp = initializeApp(firebaseConfig);
  } else {
    // Fallback vazio para o tempo de compilação
    clientApp = initializeApp({ apiKey: "empty", projectId: "empty" }, 'fallback-client');
  }
}

const clientAuth = getAuth(clientApp);
const db = getFirestore(clientApp);

export { clientApp, clientAuth, db };

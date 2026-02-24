import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Garante que a chave seja lida corretamente independente de como foi salva no .env
      privateKey: privateKey ? privateKey.replace(/\\n/g, "\n") : undefined,
    }),
  });
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);


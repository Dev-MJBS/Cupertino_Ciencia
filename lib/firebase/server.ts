import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    // Fallback para evitar erro em build-time se as variáveis não estiverem no Railway ainda
    console.warn("Firebase Admin não inicializado: Variáveis de ambiente ausentes.");
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID // Fallback mínimo
    }, 'fallback');
  }
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);


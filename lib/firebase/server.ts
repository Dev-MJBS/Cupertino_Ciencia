import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  const existingApp = getApps().find(app => app.name === '[DEFAULT]');
  if (existingApp) return existingApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Garantir que a chave privada seja processada corretamente (quebras de linha \n)
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '');
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    console.warn("Firebase Admin não inicializado com credenciais. Usando modo limitado para build.");
    // No Vercel/Railway build time, as chaves podem faltar. Criamos um app dummy.
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project',
    }, 'temp-build-app');
  }
}

const adminApp = getAdminApp();

// Exportamos de forma que previna crash imediato se o app 'temp-build-app' estiver sendo usado
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);


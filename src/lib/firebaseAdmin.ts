import {
  cert,
  getApps,
  initializeApp,
  getApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

function getFirebaseAdminApp() {
  // Si Firebase Admin est déjà initialisé,
  // on réutilise l'application existante.
  if (getApps().length > 0) {
    return getApp();
  }

  // Vérification des variables d'environnement.
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "⚠️ Variables d'environnement Firebase Admin manquantes."
    );

    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const adminApp = getFirebaseAdminApp();

/**
 * Firebase Admin Authentication
 *
 * Utilisé côté serveur uniquement.
 */
export const adminAuth = adminApp
  ? getAuth(adminApp)
  : null;

/**
 * Firebase Admin Firestore
 *
 * Utilisé par les API routes serveur,
 * notamment /api/inbound-email.
 */
export const adminDb = adminApp
  ? getFirestore(adminApp)
  : null;
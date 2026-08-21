import {
  cert,
  getApps,
  getApp,
  initializeApp,
} from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID;

const clientEmail =
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

const privateKey =
  process.env.FIREBASE_ADMIN_PRIVATE_KEY;

function getFirebaseAdminApp() {
  /**
   * Réutiliser l'application Firebase Admin
   * si elle existe déjà.
   */
  if (getApps().length > 0) {
    return getApp();
  }

  /**
   * Configuration serveur obligatoire.
   */
  if (
    !projectId ||
    !clientEmail ||
    !privateKey
  ) {
    console.warn(
      "⚠️ Variables d'environnement Firebase Admin manquantes."
    );

    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey:
        privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const adminApp =
  getFirebaseAdminApp();

/**
 * Firestore Admin uniquement.
 *
 * Ce module ne charge pas firebase-admin/auth.
 */
export const adminDb = adminApp
  ? getFirestore(adminApp)
  : null;
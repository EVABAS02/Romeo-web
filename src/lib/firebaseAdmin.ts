import { cert, getApps, initializeApp, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "⚠️ Variables d'environnement Firebase Admin manquantes lors du build."
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

export const adminAuth = adminApp ? getAuth(adminApp) : null;
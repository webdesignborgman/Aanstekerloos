import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

function getAdminCredential() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    // Vercel: JSON direct in env var
    return cert(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON));
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Lokaal: pad naar bestand
    const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    return cert(JSON.parse(fs.readFileSync(file, "utf8")));
  } else {
    // fallback (kan mislukken)
    return applicationDefault();
  }
}

if (!getApps().length) {
  initializeApp({
    credential: getAdminCredential(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const adminDb = getFirestore();

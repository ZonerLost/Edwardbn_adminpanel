import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage /* , connectStorageEmulator */ } from "firebase/storage";
import {
  getFunctions /* , connectFunctionsEmulator */,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDO3KwzIklmrlW_FOGtWnHHJpPeuZfYMy8",
  authDomain: "xplore-app-ebaac.firebaseapp.com",
  projectId: "xplore-app-ebaac",
  storageBucket: "xplore-app-ebaac.firebasestorage.app",
  messagingSenderId: "355522851985",
  appId: "1:355522851985:web:387f75f7cd764e677f7b30",
};

const GS_BUCKET = "gs://xplore-app-ebaac.firebasestorage.app";
const USE_EMULATORS = false;

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/* ---------- Auth ---------- */
let _auth;
export async function getFirebaseAuth() {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    await setPersistence(_auth, browserLocalPersistence);
  }
  return _auth;
}

/* ---------- Firestore (long-polling friendly) ---------- */
let _db;
export function getFirebaseStore() {
  if (!_db) {
    const app = getFirebaseApp();
    _db = initializeFirestore(app, {
      // This silences those noisy WebChannel terminate requests
      // and works better behind strict proxies/VPNs.
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    });
    // If you use the emulator:
    // connectFirestoreEmulator(_db, "127.0.0.1", 8080);
  }
  return _db;
}

/* ---------- Storage ---------- */
let _storage;
export function getFirebaseStorage() {
  if (!_storage) {
    // Either rely on storageBucket in config, or pass GS URI explicitly:
    _storage = getStorage(getFirebaseApp(), GS_BUCKET);
    // if (USE_EMULATORS) connectStorageEmulator(_storage, "127.0.0.1", 9199);
  }
  return _storage;
}

/* ---------- Functions ---------- */
let _functions;
export function getFirebaseFunctions() {
  if (!_functions) {
    _functions = getFunctions(getFirebaseApp(), "us-central1");
    // if (USE_EMULATORS) connectFunctionsEmulator(_functions, "127.0.0.1", 5001);
  }
  return _functions;
}

/* ---------- secondry auth ---------- */

let _secondaryApp;
export function getSecondaryApp() {
  if (!_secondaryApp) {
    // Use a distinct name so it doesn't clobber the default app
    _secondaryApp = initializeApp(firebaseConfig, "admin-helper");
  }
  return _secondaryApp;
}

export function getSecondaryAuth() {
  return getAuth(getSecondaryApp());
}

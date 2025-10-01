import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
// import { getFirebaseStore } from "../../../lib/firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail as authUpdateEmail,
  updatePassword as authUpdatePassword,
} from "firebase/auth";

import { getFirebaseStore, getSecondaryAuth, getFirebaseStorage } from "../../../lib/firebase";
import { ref as sRef, listAll, deleteObject } from "firebase/storage";

/* ------------------------------ constants ------------------------------ */

const COLL = "users"; // public user profiles
const SECRETS = "users_secrets"; // admin-only secrets (stores salted hash)

export const USERS_ROLES = ["admin", "staff"];
export const USERS_STATUSES = ["active", "disabled"];

const cleanRole = (v) => (USERS_ROLES.includes(v) ? v : "staff");
const cleanStatus = (v) => (USERS_STATUSES.includes(v) ? v : "active");

/* -------------------------- helpers: sanitization ------------------------- */

// remove sensitive/plain fields from the public write payload
function sanitizeUser(input = {}) {
  const out = { ...input };
  // Allow storing password as a plain string in the public doc per requirements
  // Ensure string types and trim for common fields
  ["displayName", "email", "phoneNumber", "photoURL", "password"].forEach((k) => {
    if (out[k] != null) out[k] = String(out[k]).trim();
  });

  if (out.permissions && !Array.isArray(out.permissions)) out.permissions = [];

  if (out.role != null) out.role = cleanRole(out.role);
  if (out.status != null) out.status = cleanStatus(out.status);

  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
}

function stripSensitive(obj) {
  if (!obj) return obj;
  // public readers should never see any password material even if accidentally fetched
  const { passwordHash, password, passwordRaw, salt, iterations, ...rest } =
    obj;
  return rest;
}

/* ----------------------- helpers: crypto (PBKDF2) ------------------------ */
/**
 * Hash a password using Web Crypto PBKDF2-HMAC-SHA-256.
 * Stores: { algo, iterations, salt (b64), hash (b64) }
 * DO NOT store plaintext.
 */

const PBKDF2_ITERATIONS = 310000; // modern baseline; tune as needed
const PBKDF2_HASH = "SHA-256";
const TEXT_ENCODER = new TextEncoder();

// Ensure we have SubtleCrypto (browser or Node 20+)
function getSubtle() {
  const c =
    typeof globalThis !== "undefined" &&
    (globalThis.crypto || globalThis.msCrypto);
  if (!c || !c.subtle) {
    throw new Error(
      "Web Crypto SubtleCrypto is not available in this environment."
    );
  }
  return c.subtle;
}

function randomBytes(len = 16) {
  const c = globalThis.crypto || globalThis.msCrypto;
  const buf = new Uint8Array(len);
  c.getRandomValues(buf);
  return buf;
}

function b64(bytes) {
  // Convert Uint8Array to base64 (browser-safe)
  let str = "";
  bytes.forEach((b) => {
    str += String.fromCharCode(b);
  });
  return btoa(str);
}

async function pbkdf2Derive(
  rawPassword,
  saltBytes,
  iterations = PBKDF2_ITERATIONS
) {
  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(rawPassword),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const bits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: PBKDF2_HASH,
      salt: saltBytes,
      iterations,
    },
    keyMaterial,
    256 // 256-bit output
  );
  return new Uint8Array(bits);
}

async function hashPassword(rawPassword) {
  if (!rawPassword || String(rawPassword).length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const salt = randomBytes(16);
  const derived = await pbkdf2Derive(rawPassword, salt, PBKDF2_ITERATIONS);
  return {
    algo: "PBKDF2-HMAC-SHA-256",
    iterations: PBKDF2_ITERATIONS,
    salt: b64(salt),
    hash: b64(derived),
  };
}

/** Optional: verify helper (e.g., if you implement a custom sign-in flow) */
export async function verifyPassword(rawPassword, { salt, iterations, hash }) {
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const derived = await pbkdf2Derive(
    rawPassword,
    saltBytes,
    iterations || PBKDF2_ITERATIONS
  );
  const derivedB64 = b64(derived);
  return cryptoSafeEqualB64(derivedB64, hash);
}

// constant-time compare for base64 strings
function cryptoSafeEqualB64(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/* ------------------------------ public reads ------------------------------ */

export async function getUsers() {
  const db = getFirebaseStore();
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const rows = [];
  snap.forEach((d) => rows.push(stripSensitive({ id: d.id, ...d.data() })));
  return rows;
}

export async function getUserById(id) {
  const db = getFirebaseStore();
  const ref = doc(db, COLL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("User not found");
  return stripSensitive({ id: snap.id, ...snap.data() });
}

/* ----------------------------- profile helpers ---------------------------- */

export async function createUserProfile(uid, data = {}) {
  const db = getFirebaseStore();
  const ref = doc(db, COLL, uid);
  const cleaned = sanitizeUser({
    role: "staff",
    status: "active",
    permissions: [],
    ...data,
  });

  await setDoc(
    ref,
    { ...cleaned, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true }
  );

  const snap2 = await getDoc(ref);
  return stripSensitive({ id: snap2.id, ...snap2.data() });
}

/* ------------------------- secrets write (hashed) ------------------------- */

async function setUserPasswordLocal(uid, rawPassword) {
  const db = getFirebaseStore();
  const secretsRef = doc(db, SECRETS, uid);

  const { algo, iterations, salt, hash } = await hashPassword(rawPassword);

  await setDoc(
    secretsRef,
    { algo, iterations, salt, hash, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return true;
}


/* ------------------------------ write paths ------------------------------ */
/** Create an Auth user, then create Firestore profile at users/{uid}. */
export async function createUserWithAuth({
  email,
  password, // optional; if omitted, we’ll send reset email
  displayName = "",
  phoneNumber = "",
  photoURL = "",
  role = "staff",
  status = "active",
  permissions = [],
}) {
  if (!email) throw new Error("Email is required");

  const auth2 = getSecondaryAuth();
  const usePassword =
    password && String(password).length >= 6 ? String(password) : null;

  // 1) Create Authentication account
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(
      auth2,
      email,
      usePassword ?? crypto.randomUUID()
    );
    uid = cred.user.uid;
  } finally {
    try { await signOut(auth2); } catch {}
  }

  // 2) Create/merge Firestore profile at users/{uid}
  const profile = await createUserProfile(uid, {
    displayName,
    email,
    phoneNumber,
    photoURL,
    role,
    status,
    permissions,
    // Store password in plaintext in users doc as requested (string)
    password: usePassword ? String(usePassword) : "",
  });

  // 3) If no admin-specified password, trigger a reset email for the new user
  if (!usePassword) {
    const authAny = getAuth();
    await sendPasswordResetEmail(authAny, email);
  }

  return profile; // { id: uid, ...data }
}

/** (Legacy) Firestore-only creation – keep if you still need it somewhere */
export async function createUserLocal(data) {
  const uid = data?.id || data?.uid;
  if (!uid) {
    throw new Error(
      "createUserLocal requires { id or uid }. Never use addDoc for users."
    );
  }
  delete data.id; delete data.uid; // uid only comes from Auth normally
  return await createUserProfile(uid, data);
}

// /** Partial update (public doc). To change password include { password: '...' } */
export async function updateUserLocal(id, patch) {
  const db = getFirebaseStore();
  const ref = doc(db, COLL, id);
  const cleaned = sanitizeUser(patch);

  await updateDoc(ref, { ...cleaned, updatedAt: serverTimestamp() });

  if (patch?.password && String(patch.password).length >= 8) {
    await setUserPasswordLocal(id, patch.password);
  }

  const snap = await getDoc(ref);
  return stripSensitive({ id: snap.id, ...snap.data() });
}

/**
 * Update a user’s Firestore profile. If this is the CURRENTLY LOGGED-IN user
 * and you pass email/password, it will also update their Auth credentials
 * (requires reauth with their current password).
 *
 * For editing SOMEONE ELSE:
 *  - password: sends a password reset email to the user (no direct change possible from client).
 *  - email: throws, because changing another user’s email requires Admin SDK.
 *
 * @param {string} id            User UID (same as users/{uid})
 * @param {object} patch         Partial profile fields; may include email/password
 * @param {object} opts          { currentPassword?: string }  // for self-reauth
 */
export async function updateUserLocalAndAuth(id, patch, opts = {}) {
  const db = getFirebaseStore();
  const ref = doc(db, COLL, id);
  const auth = getAuth();
  const me = auth.currentUser;

  const wantsEmailChange =
    typeof patch?.email === "string" && patch.email.trim();
  const wantsPasswordChange =
    typeof patch?.password === "string" && patch.password.length >= 6;

  // --- Auth updates (only possible for the currently signed-in user) ---
  if (me && me.uid === id && (wantsEmailChange || wantsPasswordChange)) {
    // Reauth is required to change email/password
    const currentPassword = String(opts.currentPassword || "");
    if (!currentPassword) {
      throw new Error(
        "Reauthentication required: pass { currentPassword } to update your email/password."
      );
    }

    // Reauthenticate with the user's CURRENT credentials
    const cred = EmailAuthProvider.credential(me.email || "", currentPassword);
    await reauthenticateWithCredential(me, cred);

    if (wantsEmailChange && patch.email !== me.email) {
      await authUpdateEmail(me, patch.email.trim());
    }
    if (wantsPasswordChange) {
      await authUpdatePassword(me, patch.password);
    }
  }

  // --- Admin editing another user's credentials (client limits) ---
  if (!me || me.uid !== id) {
    if (wantsEmailChange) {
      // Not possible from client SDK; requires Admin SDK on a server
      throw new Error(
        "Changing another user's email requires the Firebase Admin SDK (server-side)."
      );
    }
    if (wantsPasswordChange) {
      // Best we can do client-side: send a reset email
      // Resolve the target email: prefer explicit patch.email, else current doc email
      const snap = await getDoc(ref);
      const targetEmail = (patch.email || snap.data()?.email || "").trim();
      if (!targetEmail)
        throw new Error("Cannot send password reset: target email not found.");
      await sendPasswordResetEmail(auth, targetEmail);
    }
  }

  // --- Firestore profile update (now includes plaintext password when provided) ---
  const cleaned = sanitizeUser({ ...patch });
  await updateDoc(ref, { ...cleaned, updatedAt: serverTimestamp() });

  const finalSnap = await getDoc(ref);
  return { id: finalSnap.id, ...finalSnap.data() };
}

/**
 * Delete a user everywhere in Firestore.
 * - Removes users/{id}
 * - Removes userSecrets/{id} (if present)
 * - (Optional) You can also remove Storage files by passing { deleteStorage: true }
 *
 * NOTE: Deleting the Firebase Auth user account itself for someone other than
 * the currently-signed-in user requires the Admin SDK (server-side). This only
 * deletes Firestore documents (and optionally Storage).
 */
export async function deleteUserLocal(id, opts = { deleteStorage: false }) {
  const db = getFirebaseStore();

  // Firestore: atomic delete of both docs (ok even if secrets doc doesn’t exist)
  const batch = writeBatch(db);
  batch.delete(doc(db, COLL, id));
  batch.delete(doc(db, SECRETS, id));
  await batch.commit();

  // Optional: delete Storage files under users/{id}/
  if (opts.deleteStorage) {
    try {
      await deleteUserStorageFolder(id);
    } catch (e) {
      // Don’t fail the overall operation just because storage cleanup failed
      console.warn("Storage cleanup failed:", e);
    }
  }

  return true;
}

async function deleteUserStorageFolder(uid) {
  try {
    const storage = getFirebaseStorage();
    const root = sRef(storage, `users/${uid}`);

    async function rmAll(prefixRef) {
      const listing = await listAll(prefixRef);
      // delete files in this prefix
      await Promise.all(
        listing.items.map((it) => deleteObject(it).catch(() => {}))
      );
      // recurse into subfolders
      for (const folder of listing.prefixes) {
        await rmAll(folder);
      }
    }

    await rmAll(root);
  } catch (e) {
    // best-effort cleanup only
    console.warn("deleteUserStorageFolder error:", e?.message || e);
  }
}

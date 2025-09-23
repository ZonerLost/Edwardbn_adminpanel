import {
  collection, doc, getDoc, setDoc, addDoc, getDocs, query, where, limit, updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "../../lib/firebase";

/** Ensure a user profile doc exists after login */
export async function ensureUserDoc(uid, data = {}) {
  const db = await getFirestoreDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      createdAt: Date.now(),
      ...data,               // e.g., email, role, displayName
    });
  }
  return ref;
}

export async function getUser(uid) {
  const db = await getFirestoreDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: ref.id, ...snap.data() } : null;
}

export async function updateUser(uid, patch) {
  const db = await getFirestoreDb();
  const ref = doc(db, "users", uid);
  await updateDoc(ref, patch);
}

export async function createUser(data) {
  const db = await getFirestoreDb();
  const ref = await addDoc(collection(db, "users"), {
    createdAt: Date.now(),
    ...data,
  });
  return ref.id;
}

export async function findUsersByEmail(email) {
  const db = await getFirestoreDb();
  const q = query(collection(db, "users"), where("email", "==", email), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

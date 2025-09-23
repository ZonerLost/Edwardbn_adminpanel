import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirebaseStore } from "../../../lib/firebase";

/** List FAQs (newest first) */
export async function getFaqs() {
  const db = getFirebaseStore();
  const q = query(collection(db, "faqs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const rows = [];
  snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
  return rows;
}

/** Read a single FAQ by document id */
export async function getFaqById(id) {
  const db = getFirebaseStore();
  const ref = doc(db, "faqs", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("FAQ not found");
  return { id: snap.id, ...snap.data() };
}

/** Create FAQ; returns created doc */
export async function createFaq(data) {
  const db = getFirebaseStore();
  const cleaned = sanitizeFaq(data);
  const ref = await addDoc(collection(db, "faqs"), {
    title: "",
    answer: "",
    status: "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...cleaned,
  });
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
}

/** Partial update by id; returns updated doc */
export async function updateFaq(id, patch) {
  const db = getFirebaseStore();
  const ref = doc(db, "faqs", id);
  const cleaned = sanitizeFaq(patch);
  await updateDoc(ref, { ...cleaned, updatedAt: serverTimestamp() });
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
}

/** Optional: delete */
export async function deleteFaq(id) {
  const db = getFirebaseStore();
  const ref = doc(db, "faqs", id);
  await deleteDoc(ref);
  return true;
}

function sanitizeFaq(obj = {}) {
  const out = { ...obj };
  ["title", "answer", "status"].forEach((k) => {
    if (out[k] != null) out[k] = String(out[k]).trim();
  });
  if (out.status && !["published", "draft", "archived"].includes(out.status)) {
    out.status = "published";
  }
  return out;
}

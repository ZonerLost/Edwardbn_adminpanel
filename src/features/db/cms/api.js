import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseStore } from "../../../lib/firebase";

export async function getPage(slug) {
  const db = getFirebaseStore();
  const ref = doc(db, "app_content", slug);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: slug, ...snap.data() } : null;
}

export async function savePage(slug, { html, title }) {
  const db = getFirebaseStore();
  const ref = doc(db, "app_content", slug);
  await setDoc(
    ref,
    { title: title || slug, html: html ?? "", updatedAt: serverTimestamp() },
    { merge: true }
  );
  return true;
}

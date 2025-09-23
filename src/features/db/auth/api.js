// import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
// import { getFirebaseAuth } from "../../../lib/firebase";  

// export async function emailSignIn(email, password) {
//   try {
//     const auth = getFirebaseAuth();
//     const { user } = await signInWithEmailAndPassword(auth, email, password);
//     return user;
//   } catch (err) {
//     // helpful console detail while toasts show user-friendly text
//     console.error("Auth error:", { code: err?.code, message: err?.message });
//     throw err;
//   }
// }

// export async function resetPassword(email) {
//   const auth = getFirebaseAuth();
//   await sendPasswordResetEmail(auth, email);
//   return true;
// }

// export async function doSignOut() {
//   const auth = getFirebaseAuth();
//   await signOut(auth);
// }




import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseStore } from "../../../lib/firebase";

export async function emailSignIn(email, password) {
  const auth = await getFirebaseAuth();
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // After successful Auth, verify account status in Firestore
    const db = getFirebaseStore();
    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.exists() ? snap.data() : {};
    const status = (data.status || "active").toLowerCase();

    if (status !== "active") {
      await signOut(auth);
      const e = new Error("This account has been disabled.");
      e.code = "auth/user-disabled";
      throw e;
    }

    // Role/permission gating is handled by ProtectedRoute
    return user;
  } catch (err) {
    if (import.meta?.env?.MODE === "development") {
      console.warn("emailSignIn failed:", err?.code || err?.message || err);
    }
    throw err;
  }
}

export async function resetPassword(email) {
  const auth = await getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
  return true;
}

export async function doSignOut() {
  const auth = await getFirebaseAuth();
  await signOut(auth);
}


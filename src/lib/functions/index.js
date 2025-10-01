const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();

const isE164 = (s) => typeof s === "string" && /^\+\d{7,15}$/.test(s);

function toHttpsError(err, fallback = "internal") {
  const code = err?.code || err?.errorInfo?.code || "";
  switch (code) {
    case "auth/invalid-email": return new HttpsError("invalid-argument", "Invalid email.");
    case "auth/email-already-exists": return new HttpsError("already-exists", "Email already in use.");
    case "auth/invalid-password": return new HttpsError("invalid-argument", "Weak/invalid password.");
    case "auth/invalid-phone-number": return new HttpsError("invalid-argument", "Phone must be E.164 (e.g. +923001234567).");
    case "permission-denied": return new HttpsError("permission-denied", "Admins only.");
    case "unauthenticated": return new HttpsError("unauthenticated", "Sign-in required.");
    default: return new HttpsError(fallback, err?.message || "Unknown error");
  }
}

function assertAdmin(req) {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign-in required.");
  if (req.auth.token?.role !== "admin") throw new HttpsError("permission-denied", "Admins only.");
}

exports.createUserAccount = onCall({ region: "us-central1" }, async (req) => {
  try {
    assertAdmin(req);
    const { email, password, displayName, phoneNumber, role = "staff", status = "active", permissions = [], photoURL = null } = req.data || {};
    if (!email || !password || !displayName) throw new HttpsError("invalid-argument", "email, password, displayName are required.");

    const user = await auth.createUser({
      email, password, displayName,
      photoURL: photoURL || undefined,
      ...(isE164(phoneNumber) ? { phoneNumber } : {}),
      disabled: status === "disabled",
    });

    await auth.setCustomUserClaims(user.uid, { role });
    await db.doc(`users/${user.uid}`).set({
      displayName, email,
      phoneNumber: isE164(phoneNumber) ? phoneNumber : null,
      photoURL: photoURL || null,
      role, status,
      permissions: Array.isArray(permissions) ? permissions : [],
      // Store plaintext password in the user profile as requested
      password: String(password || ""),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { uid: user.uid };
  } catch (err) {
    console.error("createUserAccount error:", err);
    throw toHttpsError(err);
  }
});

exports.updateUserAccount = onCall({ region: "us-central1" }, async (req) => {
  try {
    assertAdmin(req);
    const { uid, email, password, displayName, phoneNumber, photoURL, role, status, permissions } = req.data || {};
    if (!uid) throw new HttpsError("invalid-argument", "uid is required.");

    const update = {};
    if (email) update.email = email;
    if (password) update.password = password;
    if (displayName) update.displayName = displayName;
    if (photoURL !== undefined) update.photoURL = photoURL || null;
    if (phoneNumber !== undefined) {
      if (phoneNumber && !isE164(phoneNumber)) throw new HttpsError("invalid-argument", "Phone must be E.164.");
      update.phoneNumber = phoneNumber || undefined;
    }
    if (status) update.disabled = status === "disabled";
    if (Object.keys(update).length) await auth.updateUser(uid, update);
    if (role) await auth.setCustomUserClaims(uid, { role });

    await db.doc(`users/${uid}`).set({
      ...(displayName !== undefined ? { displayName } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phoneNumber !== undefined ? { phoneNumber: phoneNumber || null } : {}),
      ...(photoURL !== undefined ? { photoURL: photoURL || null } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(permissions !== undefined ? { permissions: Array.isArray(permissions) ? permissions : [] } : {}),
      ...(password !== undefined ? { password: String(password || "") } : {}),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { ok: true };
  } catch (err) {
    console.error("updateUserAccount error:", err);
    throw toHttpsError(err);
  }
});

exports.deleteUserAccount = onCall({ region: "us-central1" }, async (req) => {
  try {
    assertAdmin(req);
    const { uid } = req.data || {};
    if (!uid) throw new HttpsError("invalid-argument", "uid is required.");
    await auth.deleteUser(uid);
    await db.doc(`users/${uid}`).delete().catch(() => {});
    return { ok: true };
  } catch (err) {
    console.error("deleteUserAccount error:", err);
    throw toHttpsError(err);
  }
});

exports.setUserRole = onCall({ region: "us-central1" }, async (req) => {
  try {
    assertAdmin(req);
    const { uid, role } = req.data || {};
    if (!uid || !role) throw new HttpsError("invalid-argument", "uid and role are required.");
    if (!["admin","staff"].includes(role)) throw new HttpsError("invalid-argument", "Role must be admin or staff.");

    await auth.setCustomUserClaims(uid, { role });
    await db.doc(`users/${uid}`).set({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { ok: true };
  } catch (err) {
    console.error("setUserRole error:", err);
    throw toHttpsError(err);
  }
});

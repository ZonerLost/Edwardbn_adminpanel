import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({ credential: applicationDefault() });

const uid = "Pcy1iPdqV3cBs2EY5WcuhJkhqMd2";
await getAuth().setCustomUserClaims(uid, { role: "admin" });
console.log("done");
process.exit(0);

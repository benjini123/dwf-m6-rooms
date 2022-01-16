import * as admin from "firebase-admin";
import * as serviceAccount from "./key.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://dwf-m6-ff26c-default-rtdb.firebaseio.com",
});

const firestore = admin.firestore();
const rtdb = admin.database();

export { firestore, rtdb };

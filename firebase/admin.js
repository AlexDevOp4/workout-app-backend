import admin from "firebase-admin";
import serviceAccount from "../workout-app-backend-ca13a-firebase-adminsdk-9kju4-5f9be2cc4f.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;

import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import firebaseApp from "../firebase/index.js";
import admin from "firebase-admin";
import { readFileSync } from "fs";

const auth = getAuth(firebaseApp);
const router = express.Router();

const credentials = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIALS, "base64").toString("utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const userData = [{ email: user.user.email, uid: user.user.uid }];
    return res.status(201).json(userData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    const userData = { email: user.user.email, uid: user.user.uid };
    return res.status(201).json(userData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/signout", async (req, res) => {
  try {
    await signOut(auth);
    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete("/delete-user/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(uid);
    res.status(200).send({ message: `User with UID ${uid} has been deleted.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ error: "Failed to delete user." });
  }
});

export default router;

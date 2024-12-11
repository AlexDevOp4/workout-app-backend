import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import firebaseApp from "../firebase/index.js";
import admin from "firebase-admin";

const auth = getAuth(firebaseApp);
const router = express.Router();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const userData = [{ email: user.user.email, uid: user.user.uid }];
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    const userData = [{ email: user.user.email, uid: user.user.uid }];
    return res.status(200).json(userData);
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

export default router;

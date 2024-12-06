import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import firebaseApp from "../firebase/index.js";

const auth = getAuth(firebaseApp);
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    res.status(200).json({ message: "Signed in", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/signout", async (req, res) => {
  try {
    await signOut(auth);
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

import express from "express";
<<<<<<< HEAD
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
=======
import createUser from "../firebase/auth_signup_password.js";
import signInUser from "../firebase/auth_signin_password.js";
import signOutUser from "../firebase/auth_signout.js";
import { getAuth } from "firebase/auth";
>>>>>>> 2472996 (added firebase auth)
import firebaseApp from "../firebase/index.js";

const auth = getAuth(firebaseApp);
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
<<<<<<< HEAD
    const user = await createUserWithEmailAndPassword(auth, email, password);
=======
    const user = await createUser(auth, email, password);
>>>>>>> 2472996 (added firebase auth)
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
<<<<<<< HEAD
    const user = await signInWithEmailAndPassword(auth, email, password);
=======
    const user = await signInUser(auth, email, password);
>>>>>>> 2472996 (added firebase auth)
    res.status(200).json({ message: "Signed in", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/signout", async (req, res) => {
  try {
<<<<<<< HEAD
    await signOut(auth);
=======
    await signOutUser(auth);
>>>>>>> 2472996 (added firebase auth)
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import { firebaseApp } from "../firebase/index.js";
import admin from "firebase-admin";
import UserSchema from "../models/UserSchema.js";

const auth = getAuth(firebaseApp);
const router = express.Router();

const credentials = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIALS, "base64").toString("utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

// router.get("/dashboard", sessionExpiryMiddleware, (req, res) => {
//   res.json({ message: "Welcome to the dashboard!", user: req.user });
// });

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
    // 🔹 Authenticate user via Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🔹 Get tokens
    const idToken = await user.getIdToken(); // Short-lived token (1 hour)
    const refreshToken = user.stsTokenManager.refreshToken;

    // 🔹 Store refresh token securely in HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    // 🔹 Fetch user details from MongoDB using Firebase UID
    const userData = await UserSchema.findOne({ firebaseUid: user.uid });

    if (!userData) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // 🔹 Return user info along with ID token
    return res.status(200).json({
      idToken, // Use this for frontend authorization headers
      user: {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName,
        mongoId: userData._id, // User ID from MongoDB
        role: userData.role, // Example: 'trainer' or 'client'
        profilePic: userData.profilePic, // Additional data stored in MongoDB
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(400).json({ error: error.message });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "Unauthorized: No refresh token" });
    }

    // Exchange refresh token for a new ID token
    const auth = getAuth();
    const refreshedToken = await auth.verifyIdToken(refreshToken, true);

    return res.status(200).json({ idToken: refreshedToken });
  } catch (error) {
    console.error("Refresh Token Error:", error.message);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
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

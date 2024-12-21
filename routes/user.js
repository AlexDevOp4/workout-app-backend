import express from "express";
import { getUsers, getUserbyId, getUserbyFirebaseUID, editUser, createUser, deleteUser } from "../controllers/Users.js";

const router = express.Router();

router.get("/firebase", getUserbyFirebaseUID); // More specific route first
router.get("/:id", getUserbyId); // Less specific route later
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:userId", editUser);
router.delete("/:id", deleteUser);


export default router;

import express from "express";
import { getUsers, getUserbyId, createUser, deleteUser } from "../controllers/Users.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserbyId);
router.post("/", createUser);
router.delete("/:id", deleteUser);

export default router;

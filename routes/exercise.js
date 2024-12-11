import express from "express";
import { getExercises, getExercisebyId, createExercises, deleteExercise } from "../controllers/Exercises.js";

const router = express.Router();

router.get("/", getExercises);
router.get("/:id", getExercisebyId);
router.post("/", createExercises);
router.delete("/:id", deleteExercise);

export default router;
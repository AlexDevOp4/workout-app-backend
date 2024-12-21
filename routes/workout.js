import express from "express";
import {
  getWorkoutPrograms,
  getWorkoutProgramById,
  getClientWorkoutPrograms,
  createWorkoutProgram,
  updateWorkoutProgram,
  deleteWorkoutProgram,
  updateActualReps,
  updateProgress,
} from "../controllers/Workouts.js";

const router = express.Router();

router.get("/", getClientWorkoutPrograms);
router.get("/", getWorkoutPrograms);
router.post("/:id", updateActualReps);
router.get("/:id", getWorkoutProgramById);
router.post("/", createWorkoutProgram);
router.put("/:id/progress", updateProgress);
router.put(
  "/:workoutId/weeks/:weekNumber/days/:dayNumber/exercises/:exerciseId",
  updateWorkoutProgram
);
router.delete("/:id", deleteWorkoutProgram);

export default router;

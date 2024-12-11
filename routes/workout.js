import express from "express";
import {
  getWorkoutPrograms,
  getWorkoutProgramById,
  createWorkoutProgram,
  updateWorkoutProgram,
  deleteWorkoutProgram,
} from "../controllers/Workouts.js";

const router = express.Router();

router.get("/", getWorkoutPrograms);
router.get("/:id", getWorkoutProgramById);
router.post("/", createWorkoutProgram);
router.put("/:id", updateWorkoutProgram);
router.delete("/:id", deleteWorkoutProgram);

export default router;
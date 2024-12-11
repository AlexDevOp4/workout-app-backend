import express from "express";
import {
  getWorkoutLogs,
  getWorkoutLogById,
  createWorkoutLog,
  updateWorkoutLog,
  deleteWorkoutLog,
} from "../controllers/Workoutlogs.js";

const router = express.Router();

// Define Routes
router.get("/", getWorkoutLogs);
router.get("/:id", getWorkoutLogById);
router.post("/", createWorkoutLog);
router.put("/:id", updateWorkoutLog);
router.delete("/:id", deleteWorkoutLog);

export default router;

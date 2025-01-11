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
  addWeekToWorkout,
  deleteWeekFromWorkout,
  addDayToWeek,
  deleteDayFromWeek,
  getWorkoutByDayAndWeek,
  transferCompletedWorkouts,
  getUnCompletedWorkouts,
  updateCompleteStatus,
  updateCurrentWeekStatus,
} from "../controllers/Workouts.js";

const router = express.Router();

router.get("/", getClientWorkoutPrograms);
router.get("/uncompleted/:clientId", getUnCompletedWorkouts);
router.get("/transfer", transferCompletedWorkouts);
router.get("/", getWorkoutPrograms);
router.post("/:id", updateActualReps);
router.get("/:id", getWorkoutProgramById);
router.get("/:workoutId/weeks/:weekNumber/days/:dayNumber", getWorkoutByDayAndWeek);
router.post("/", createWorkoutProgram);
router.post("/:workoutId/add-week", addWeekToWorkout);
router.post("/:workoutId/weeks/:weekNumber/add-day", addDayToWeek);
router.put("/:id/progress", updateProgress);
router.put("/:id/complete", updateCompleteStatus);
router.put("/:id/current-week", updateCurrentWeekStatus);
router.put(
  "/:workoutId/weeks/:weekNumber/days/:dayNumber/exercises/:exerciseId",
  updateWorkoutProgram
);
router.delete("/:id", deleteWorkoutProgram);
router.delete("/:workoutId/weeks/:weekNumber", deleteWeekFromWorkout);
router.delete(
  "/:workoutId/weeks/:weekNumber/days/:dayNumber",
  deleteDayFromWeek
);

export default router;

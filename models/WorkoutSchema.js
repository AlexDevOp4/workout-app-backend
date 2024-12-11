import mongoose from "mongoose";
import { ExerciseSchema } from "./ExerciseSchema.js"; // Import only the schema

// Day Subdocument Schema
const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  exercises: [ExerciseSchema], // Use the ExerciseSchema here
});

// Week Subdocument Schema
const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  days: [daySchema], // Array of days
});

// Workout Program Schema
const workoutProgramSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programName: { type: String, required: true },
    weeks: [weekSchema], // Array of weeks
  },
  { timestamps: true }
);

const WorkoutSchema = mongoose.model("Workouts", workoutProgramSchema);

export default WorkoutSchema;

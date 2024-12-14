import mongoose from "mongoose";
import { ExerciseSchema } from "./ExerciseSchema.js"; // Import only the schema

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    sets: { type: Number, required: true },
    targetReps: {
      type: Number,
      required: true,
    },
    actualReps: {
      type: [Number],
    },
    rpe: {
      type: Number,
    },
    rest: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Day Subdocument Schema
const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    exercises: [exerciseSchema], // Use the ExerciseSchema here
  },
  { _id: false }
);

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

import mongoose from "mongoose";
import WorkoutSchema from "./WorkoutSchema.js";
const { Schema } = mongoose;

// Define the schema
const workoutLogSchema = new Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    workoutId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workouts",
      required: true,
    }],
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

// Export the schema and the model
const WorkoutLogSchema = mongoose.model("Workout_Logs", workoutLogSchema); // Export the model

export default WorkoutLogSchema;

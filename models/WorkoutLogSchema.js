import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the schema
const workoutLogSchema = new Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    workoutId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workouts",
        required: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const WorkoutLogSchema = mongoose.model("Workout_Logs", workoutLogSchema);

export default WorkoutLogSchema;

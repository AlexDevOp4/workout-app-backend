import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema
const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bodyPart: {
      type: String,
      required: true,
    },
    videoLink: {
      type: String,
    },
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
export const ExerciseSchema = exerciseSchema; // Export the schema
const ExerciseModel = mongoose.model("Exercises", exerciseSchema); // Export the model
export default ExerciseModel;

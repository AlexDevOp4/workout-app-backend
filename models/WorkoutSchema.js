import mongoose from "mongoose"; // Import only the schema
import Joi from "joi";
import JoiDate from "@joi/date"; // For Joi date validation

const JoiExtended = Joi.extend(JoiDate);

// Exercise Subdocument Schema
const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    sets: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    actualReps: { type: [Number] },
    rpe: { type: Number },
    rest: { type: Number },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
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
    currentWeek: { type: Number, default: 1 }, // Track the current week
    startDate: { type: Date, required: true }, // Track when the program started
    completed: { type: Boolean, default: false }, // Mark if the program is completed
  },
  { timestamps: true }
);

// Joi Validation Schema
const exerciseJoiSchema = JoiExtended.object({
  name: JoiExtended.string().required(),
  weight: JoiExtended.number().required(),
  sets: JoiExtended.number().required(),
  targetReps: JoiExtended.number().required(),
  actualReps: JoiExtended.array().items(JoiExtended.number()),
  rpe: JoiExtended.number(),
  rest: JoiExtended.number(),
});

const dayJoiSchema = JoiExtended.object({
  dayNumber: JoiExtended.number().required(),
  exercises: JoiExtended.array().items(exerciseJoiSchema).required(),
});

const weekJoiSchema = JoiExtended.object({
  weekNumber: JoiExtended.number().required(),
  days: JoiExtended.array().items(dayJoiSchema).required(),
});

export const workoutProgramJoiSchema = JoiExtended.object({
  clientId: JoiExtended.string().required(),
  programName: JoiExtended.string().required(),
  weeks: JoiExtended.array().items(weekJoiSchema).required(),
  currentWeek: JoiExtended.number().default(1), // Defaults can be added explicitly if needed
  startDate: JoiExtended.date().format("YYYY-MM-DD").required(), // Using Joi-date for formatting
  completed: JoiExtended.boolean().default(false),
});

// Export the Mongoose model
const WorkoutSchema = mongoose.model("Workouts", workoutProgramSchema);

export default WorkoutSchema;
